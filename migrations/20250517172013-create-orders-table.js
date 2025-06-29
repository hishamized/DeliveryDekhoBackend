'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      unique_id: {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4,
      },
      sender_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      receiver_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      source_address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      dest_address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      phone_sender: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone_receiver: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      send_otp: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      deliver_otp: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('registered', 'assigned', 'picked', 'delivered', 'cancelled'),
        allowNull: false,
        defaultValue: 'registered',
      },
      assigned_rider_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'riders',
          key: 'id',
        },
      },
      assigned_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      pickup_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      delivery_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      payment_status: {
        type: Sequelize.ENUM('yes', 'no'),
        allowNull: false,
        defaultValue: 'no',
      },
      customer_deadline: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Customer-assigned delivery deadline',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('orders');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_orders_payment_status";');
  }
};
