'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

     await queryInterface.createTable('optionfield', 
     { 
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      option_limit: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      total_options: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      visual_preference: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      id_field: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references : {model: 'forms-fields', key : 'id'}
      }
    });
  },

  down: async (queryInterface, Sequelize) => {

     await queryInterface.dropTable('optionfield');
  }
};
