const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Claim = sequelize.define('Claim', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  claimNumber: { type: DataTypes.STRING, unique: true },
  policyId: { type: DataTypes.UUID, allowNull: false },
  clientId: { type: DataTypes.UUID, allowNull: false },
  underwriterId: { type: DataTypes.UUID, allowNull: false },
  incidentDate: { type: DataTypes.DATEONLY },
  reportedDate: { type: DataTypes.DATEONLY },
  claimAmount: { type: DataTypes.DECIMAL(15, 2) },
  approvedAmount: { type: DataTypes.DECIMAL(15, 2) },
  paidAmount: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  description: { type: DataTypes.TEXT },
  status: {
    type: DataTypes.ENUM('reported', 'under_review', 'approved', 'rejected', 'paid', 'closed'),
    defaultValue: 'reported',
  },
  nextFollowUpDate: { type: DataTypes.DATEONLY },
  documentPath: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT },
  handledBy: { type: DataTypes.UUID },
});

module.exports = Claim;
