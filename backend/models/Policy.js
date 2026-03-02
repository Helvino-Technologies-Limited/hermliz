const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Policy = sequelize.define('Policy', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  policyNumber: { type: DataTypes.STRING, unique: true },
  clientId: { type: DataTypes.UUID, allowNull: false },
  underwriterId: { type: DataTypes.UUID, allowNull: false },
  createdBy: { type: DataTypes.UUID },
  insuranceClass: {
    type: DataTypes.ENUM(
      'motor_private', 'motor_commercial', 'motor_psv',
      'medical', 'life', 'education', 'pension',
      'travel', 'fire', 'public_liability',
      'professional_indemnity', 'other'
    ),
    allowNull: false,
  },
  coverType: { type: DataTypes.STRING },
  vehicleReg: { type: DataTypes.STRING },
  vehicleMake: { type: DataTypes.STRING },
  vehicleModel: { type: DataTypes.STRING },
  vehicleYear: { type: DataTypes.INTEGER },
  chassisNumber: { type: DataTypes.STRING },
  engineNumber: { type: DataTypes.STRING },
  sumInsured: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  premiumAmount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  commissionPercent: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  commissionAmount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  startDate: { type: DataTypes.DATEONLY, allowNull: false },
  endDate: { type: DataTypes.DATEONLY, allowNull: false },
  renewalReminderDays: { type: DataTypes.INTEGER, defaultValue: 30 },
  paymentPlan: {
    type: DataTypes.ENUM('full', 'two_installments', 'three_installments', 'custom'),
    defaultValue: 'full',
  },
  totalPaid: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  outstandingBalance: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'cancelled', 'pending', 'renewed'),
    defaultValue: 'active',
  },
  renewalStatus: {
    type: DataTypes.ENUM('pending', 'contacted', 'quoted', 'renewed', 'lost'),
    defaultValue: 'pending',
  },
  documentPath: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT },
  isRenewal: { type: DataTypes.BOOLEAN, defaultValue: false },
  parentPolicyId: { type: DataTypes.UUID },
});

module.exports = Policy;
