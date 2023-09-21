'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

     await queryInterface.createTable('forms-fields', 
     { 
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references : {model: 'category', key : 'id'}
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      optional: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      }

    });
  },

  down: async (queryInterface, Sequelize) => {

     await queryInterface.dropTable('forms-fields');
  }
};
