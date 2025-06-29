"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("riders", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING(15),
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      password_hash: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      driver_license_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      vehicle_registration_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      adhaar_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      pan_card_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      photo: {
        type: Sequelize.STRING(255),
        allowNull: true, 
      },

      availability_status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      last_seen: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      current_location: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("riders");
  },
};
