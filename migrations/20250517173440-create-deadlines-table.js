'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('deadlines', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'orders', // Make sure this table exists before migrating
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      deadline_type: {
        type: Sequelize.ENUM('pickup', 'delivery'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'met', 'missed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      deadline_expire_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      fulfilled_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      notified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    // Drop ENUM types manually to avoid PostgreSQL enum conflict
    await queryInterface.dropTable('deadlines');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_deadlines_deadline_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_deadlines_status";');
  }
};
