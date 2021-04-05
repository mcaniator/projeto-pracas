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
        type: Sequelize.STRING
      },
      common_name: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.INTEGER
      },
      free_space_category: {
        type: Sequelize.INTEGER
      },
      comments: {
        type: Sequelize.TEXT
      },
      creation_year: {
        type: Sequelize.STRING
      },
      reform_year: {
        type: Sequelize.STRING
      },
      mayor_creation: {
        type: Sequelize.STRING
      },
      legislation: {
        type: Sequelize.STRING
      },
      useful_area: {
        type: Sequelize.INTEGER
      },
      area_pjf: {
        type: Sequelize.INTEGER
      },
      angle_inclination: {
        type: Sequelize.INTEGER
      },
      urban_region: {
        type: Sequelize.BOOLEAN
      },
      inactive_not_found: {
        type: Sequelize.BOOLEAN
      },
      address_id: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('locals');
  }
};