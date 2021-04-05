'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('use_area_evaluations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      quantity: {
        type: Sequelize.INTEGER
      },
      shadow_area: {
        type: Sequelize.BOOLEAN
      },
      lighting: {
        type: Sequelize.BOOLEAN
      },
      walled: {
        type: Sequelize.BOOLEAN
      },
      seats: {
        type: Sequelize.BOOLEAN
      },
      conservation: {
        type: Sequelize.INTEGER
      },
      conservation: {
        type: Sequelize.INTEGER
      },
      meter: {
        type: Sequelize.INTEGER
      },
      photo_path: {
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
    await queryInterface.dropTable('use_area_evaluations');
  }
};