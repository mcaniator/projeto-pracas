'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('access_arounds', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name_plate: {
        type: Sequelize.INTEGER
      },
      transport_point: {
        type: Sequelize.INTEGER
      },
      taxi_point: {
        type: Sequelize.INTEGER
      },
      fence: {
        type: Sequelize.BOOLEAN
      },
      vihicle_parking: {
        type: Sequelize.INTEGER
      },
      motorcycle_parking: {
        type: Sequelize.INTEGER
      },
      bike_lane: {
        type: Sequelize.BOOLEAN
      },
      bike_rack: {
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
    await queryInterface.dropTable('access_arounds');
  }
};