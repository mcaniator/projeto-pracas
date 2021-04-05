'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('suveirllances', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      camera: {
        type: Sequelize.BOOLEAN
      },
      police_station: {
        type: Sequelize.BOOLEAN
      },
      visibility: {
        type: Sequelize.INTEGER
      },
      permeable_facate: {
        type: Sequelize.INTEGER
      },
      active_facate: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('suveirllances');
  }
};