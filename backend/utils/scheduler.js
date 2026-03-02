const cron = require('node-cron');
const moment = require('moment');
const { Op } = require('sequelize');
const { Installment, Policy, Notification, Client } = require('../models');

const updateOverdueInstallments = async () => {
  const today = moment().format('YYYY-MM-DD');
  const overdue = await Installment.findAll({
    where: { dueDate: { [Op.lt]: today }, status: { [Op.in]: ['pending', 'partial'] } },
  });
  for (const inst of overdue) {
    const days = moment().diff(moment(inst.dueDate), 'days');
    await inst.update({ status: 'overdue', overdueDays: days });
  }
  console.log(`✅ Overdue check: ${overdue.length} updated`);
};

const createRenewalReminders = async () => {
  const reminderDays = [7, 14, 30, 60];
  for (const days of reminderDays) {
    const targetDate = moment().add(days, 'days').format('YYYY-MM-DD');
    const policies = await Policy.findAll({
      where: { endDate: targetDate, status: 'active' },
      include: [{ model: Client, as: 'client' }],
    });
    for (const policy of policies) {
      const existing = await Notification.findOne({
        where: { policyId: policy.id, type: 'renewal_reminder', message: { [Op.like]: `%${days} days%` } },
      });
      if (!existing) {
        await Notification.create({
          clientId: policy.clientId,
          policyId: policy.id,
          type: 'renewal_reminder',
          title: `Policy Renewal in ${days} Days`,
          message: `Policy ${policy.policyNumber} for ${policy.client.fullName} expires in ${days} days on ${policy.endDate}.`,
          channel: 'in_app',
          status: 'sent',
          sentAt: new Date(),
        });
      }
    }
  }
  console.log(`✅ Renewal reminders created`);
};

const createInstallmentReminders = async () => {
  const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');
  const due = await Installment.findAll({
    where: { dueDate: tomorrow, status: { [Op.in]: ['pending', 'partial'] }, reminderSent: false },
    include: [{ model: Policy, as: 'policy', include: [{ model: Client, as: 'client' }] }],
  });
  for (const inst of due) {
    await Notification.create({
      clientId: inst.policy.clientId,
      policyId: inst.policyId,
      installmentId: inst.id,
      type: 'installment_due',
      title: 'Installment Due Tomorrow',
      message: `KES ${inst.amountDue} due tomorrow for policy ${inst.policy.policyNumber} - ${inst.policy.client.fullName}.`,
      channel: 'in_app',
      status: 'sent',
      sentAt: new Date(),
    });
    await inst.update({ reminderSent: true });
  }
  console.log(`✅ Installment reminders: ${due.length} sent`);
};

const startScheduler = () => {
  // Run daily at 7am
  cron.schedule('0 7 * * *', async () => {
    console.log('⏰ Running daily scheduler...');
    await updateOverdueInstallments();
    await createRenewalReminders();
    await createInstallmentReminders();
  });

  // Also run once on startup
  setTimeout(async () => {
    await updateOverdueInstallments();
    await createRenewalReminders();
  }, 3000);

  console.log('✅ Scheduler started');
};

module.exports = { startScheduler };
