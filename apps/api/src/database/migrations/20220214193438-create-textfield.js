'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

     await queryInterface.createTable('textfield', 
     { 
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      char_limit: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      id_field: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references : {model: 'forms-fields', key : 'id'}
      }
    });
  },

  down: async (queryInterface, Sequelize) => {

     await queryInterface.dropTable('textfield');
  }
};
