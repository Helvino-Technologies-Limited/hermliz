const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Underwriter = sequelize.define('Underwriter', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  shortName: { type: DataTypes.STRING },
  logo: { type: DataTypes.STRING },
  contactPerson: { type: DataTypes.STRING },
  contactPhone: { type: DataTypes.STRING },
  contactEmail: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING },
  website: { type: DataTypes.STRING },
  defaultCommissionRate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 10.00 },
  motorCommission: { type: DataTypes.DECIMAL(5, 2) },
  medicalCommission: { type: DataTypes.DECIMAL(5, 2) },
  lifeCommission: { type: DataTypes.DECIMAL(5, 2) },
  notes: { type: DataTypes.TEXT },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

module.exports = Underwriter;
