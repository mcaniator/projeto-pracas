'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('street_safeties', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      crosswalk: {
        type: Sequelize.BOOLEAN
      },
      semaphore: {
        type: Sequelize.BOOLEAN
      },
      protection_fence: {
        type: Sequelize.BOOLEAN
      },
      speed_limit_plate: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('street_safeties');
  }
};