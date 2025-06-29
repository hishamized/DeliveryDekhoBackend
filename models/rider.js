'use strict';

module.exports = (sequelize, DataTypes) => {
  const Rider = sequelize.define('Rider', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    driver_license_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    vehicle_registration_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    adhaar_number:{
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    pan_card_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    photo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    availability_status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    last_seen: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    current_location: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'riders',
    timestamps: true,
    underscored: true,
  });

  return Rider;
};
