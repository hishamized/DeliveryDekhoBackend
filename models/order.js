'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    unique_id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    sender_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    receiver_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    source_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dest_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    phone_sender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone_receiver: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    send_otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deliver_otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('registered', 'assigned', 'picked', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'registered',
    },
    assigned_rider_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'riders',
        key: 'id',
      },
    },
    assigned_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    pickup_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    delivery_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    payment_status: {
      type: DataTypes.ENUM('yes', 'no'),
      allowNull: false,
      defaultValue: 'no',
    },
   customer_deadline: {
  type: DataTypes.DATE,
  allowNull: false,
  comment: 'Customer-assigned delivery deadline',
},

  }, {
    tableName: 'orders',
    timestamps: true,
    underscored: true,
  });

  Order.associate = (models) => {
  Order.hasMany(models.Deadline, {
    foreignKey: 'order_id',
    as: 'deadlines',
  });
};


  return Order;
};
