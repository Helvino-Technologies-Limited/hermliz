const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  installmentId: { type: DataTypes.UUID, allowNull: false },
  policyId: { type: DataTypes.UUID, allowNull: false },
  clientId: { type: DataTypes.UUID, allowNull: false },
  amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  paymentDate: { type: DataTypes.DATEONLY, allowNull: false },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'mpesa', 'bank_transfer', 'cheque', 'card'),
    defaultValue: 'mpesa',
  },
  transactionRef: { type: DataTypes.STRING },
  receiptNumber: { type: DataTypes.STRING },
  recordedBy: { type: DataTypes.UUID },
  notes: { type: DataTypes.TEXT },
});

module.exports = Payment;
