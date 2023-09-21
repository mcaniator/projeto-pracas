'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

     await queryInterface.createTable('category', 
     { 
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      optional: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },

    });
  },

  down: async (queryInterface, Sequelize) => {

     await queryInterface.dropTable('category');
  }
};
