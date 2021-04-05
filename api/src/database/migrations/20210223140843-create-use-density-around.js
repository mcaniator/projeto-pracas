'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('use_density_arounds', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      use_type: {
        type: Sequelize.DECIMAL
      },
      institucional_use: {
        type: Sequelize.BOOLEAN
      },
      count_houses: {
        type: Sequelize.INTEGER
      },
      other_relevant_elements: {
        type: Sequelize.STRING
      },
      night_user: {
        type: Sequelize.BOOLEAN
      },
      day_use: {
        type: Sequelize.BOOLEAN
      },
      third_place: {
        type: Sequelize.BOOLEAN
      },
      third_place_description: {
        type: Sequelize.TEXT
      },
      evaluation_id: {
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
    await queryInterface.dropTable('use_density_arounds');
  }
};