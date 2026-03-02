const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Installment = sequelize.define('Installment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  policyId: { type: DataTypes.UUID, allowNull: false },
  installmentNumber: { type: DataTypes.INTEGER, allowNull: false },
  amountDue: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  amountPaid: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  dueDate: { type: DataTypes.DATEONLY, allowNull: false },
  paidDate: { type: DataTypes.DATE },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'partial', 'overdue'),
    defaultValue: 'pending',
  },
  reminderSent: { type: DataTypes.BOOLEAN, defaultValue: false },
  overdueDays: { type: DataTypes.INTEGER, defaultValue: 0 },
  notes: { type: DataTypes.TEXT },
});

module.exports = Installment;
