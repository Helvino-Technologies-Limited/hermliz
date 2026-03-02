const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Client = sequelize.define('Client', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  fullName: { type: DataTypes.STRING, allowNull: false },
  nationalId: { type: DataTypes.STRING, unique: true },
  phone: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING },
  kraPin: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING },
  occupation: { type: DataTypes.STRING },
  businessName: { type: DataTypes.STRING },
  nextOfKinName: { type: DataTypes.STRING },
  nextOfKinPhone: { type: DataTypes.STRING },
  nextOfKinRelationship: { type: DataTypes.STRING },
  dateOfBirth: { type: DataTypes.DATEONLY },
  gender: { type: DataTypes.ENUM('male', 'female', 'other') },
  notes: { type: DataTypes.TEXT },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  createdBy: { type: DataTypes.UUID },
});

module.exports = Client;
