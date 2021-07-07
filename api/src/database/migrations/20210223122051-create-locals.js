'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('locals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      common_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      free_space_category: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      comments: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      creation_year: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      reform_year: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mayor_creation: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      legislation: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      useful_area: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      area_pjf: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      angle_inclination: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      urban_region: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      inactive_not_found: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      address_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('locals');
  }
};