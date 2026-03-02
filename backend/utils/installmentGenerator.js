const moment = require('moment');

const generateInstallments = (policy) => {
  const { id, premiumAmount, paymentPlan, startDate } = policy;
  const installments = [];
  const start = moment(startDate);

  if (paymentPlan === 'full') {
    installments.push({
      policyId: id,
      installmentNumber: 1,
      amountDue: parseFloat(premiumAmount),
      dueDate: start.format('YYYY-MM-DD'),
      status: 'pending',
    });
  } else if (paymentPlan === 'two_installments') {
    const half = parseFloat(premiumAmount) / 2;
    installments.push({ policyId: id, installmentNumber: 1, amountDue: half, dueDate: start.format('YYYY-MM-DD'), status: 'pending' });
    installments.push({ policyId: id, installmentNumber: 2, amountDue: half, dueDate: start.clone().add(3, 'months').format('YYYY-MM-DD'), status: 'pending' });
  } else if (paymentPlan === 'three_installments') {
    const third = parseFloat(premiumAmount) / 3;
    for (let i = 0; i < 3; i++) {
      installments.push({
        policyId: id,
        installmentNumber: i + 1,
        amountDue: i === 2 ? parseFloat(premiumAmount) - third * 2 : third,
        dueDate: start.clone().add(i * 3, 'months').format('YYYY-MM-DD'),
        status: 'pending',
      });
    }
  }
  return installments;
};

module.exports = generateInstallments;
