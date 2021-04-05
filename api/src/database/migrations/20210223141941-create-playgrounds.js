'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('playgrounds', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      material_type: {
        type: Sequelize.INTEGER
      },
      quantity: {
        type: Sequelize.INTEGER
      },
      crack_greater_8mm: {
        type: Sequelize.BOOLEAN
      },
      pointed_object: {
        type: Sequelize.BOOLEAN
      },
      sharp_corner: {
        type: Sequelize.BOOLEAN
      },
      conservation: {
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
    await queryInterface.dropTable('playgrounds');
  }
};