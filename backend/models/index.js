const sequelize = require('../config/database');
const User = require('./User');
const Client = require('./Client');
const Underwriter = require('./Underwriter');
const Policy = require('./Policy');
const Installment = require('./Installment');
const Payment = require('./Payment');
const Claim = require('./Claim');
const Notification = require('./Notification');

// Client -> Policies
Client.hasMany(Policy, { foreignKey: 'clientId', as: 'policies' });
Policy.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Underwriter -> Policies
Underwriter.hasMany(Policy, { foreignKey: 'underwriterId', as: 'policies' });
Policy.belongsTo(Underwriter, { foreignKey: 'underwriterId', as: 'underwriter' });

// Policy -> Installments
Policy.hasMany(Installment, { foreignKey: 'policyId', as: 'installments' });
Installment.belongsTo(Policy, { foreignKey: 'policyId', as: 'policy' });

// Installment -> Payments
Installment.hasMany(Payment, { foreignKey: 'installmentId', as: 'payments' });
Payment.belongsTo(Installment, { foreignKey: 'installmentId', as: 'installment' });

// Policy -> Payments
Policy.hasMany(Payment, { foreignKey: 'policyId', as: 'payments' });
Payment.belongsTo(Policy, { foreignKey: 'policyId', as: 'policy' });

// Client -> Payments
Client.hasMany(Payment, { foreignKey: 'clientId', as: 'payments' });
Payment.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Policy -> Claims
Policy.hasMany(Claim, { foreignKey: 'policyId', as: 'claims' });
Claim.belongsTo(Policy, { foreignKey: 'policyId', as: 'policy' });

// Client -> Claims
Client.hasMany(Claim, { foreignKey: 'clientId', as: 'claims' });
Claim.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });

// Underwriter -> Claims
Underwriter.hasMany(Claim, { foreignKey: 'underwriterId', as: 'claims' });
Claim.belongsTo(Underwriter, { foreignKey: 'underwriterId', as: 'underwriter' });

// Notifications
Client.hasMany(Notification, { foreignKey: 'clientId', as: 'notifications' });

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully.');
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  syncDatabase,
  User,
  Client,
  Underwriter,
  Policy,
  Installment,
  Payment,
  Claim,
  Notification,
};
