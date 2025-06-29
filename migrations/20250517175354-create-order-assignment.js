'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('order_assignments', {
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
          model: 'orders',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      rider_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'riders',
          key: 'id',
        },
      },
      assigned_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      status: {
        type: Sequelize.ENUM('assigned', 'missed', 'picked', 'completed'),
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        allowNull: true,
        type: Sequelize.DATE,
      }
    });

    // Add unique constraint on (order_id, rider_id, assigned_at)
    await queryInterface.addConstraint('order_assignments', {
      fields: ['order_id', 'rider_id', 'assigned_at'],
      type: 'unique',
      name: 'unique_order_rider_assignedAt'
    });

    // Add indexes for performance (optional)
    await queryInterface.addIndex('order_assignments', ['order_id'], { name: 'idx_order_assignments_order_id' });
    await queryInterface.addIndex('order_assignments', ['rider_id'], { name: 'idx_order_assignments_rider_id' });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('order_assignments');
  }
};
