const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  clientId: { type: DataTypes.UUID },
  policyId: { type: DataTypes.UUID },
  installmentId: { type: DataTypes.UUID },
  userId: { type: DataTypes.UUID },
  type: {
    type: DataTypes.ENUM(
      'installment_due', 'installment_overdue', 'renewal_reminder',
      'renewal_overdue', 'claim_update', 'payment_received',
      'policy_created', 'general'
    ),
  },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  channel: { type: DataTypes.ENUM('in_app', 'sms', 'email'), defaultValue: 'in_app' },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  sentAt: { type: DataTypes.DATE },
  scheduledFor: { type: DataTypes.DATE },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'failed', 'read'),
    defaultValue: 'pending',
  },
});

module.exports = Notification;
