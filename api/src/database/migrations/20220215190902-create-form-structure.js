'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

     await queryInterface.createTable('form-structure', 
     { 
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_forms_fields: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references : {model: 'forms-fields', key : 'id'}
      },
      id_forms: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references : {model: 'forms', key : 'id'}
      }
    });
  },

  down: async (queryInterface, Sequelize) => {

     await queryInterface.dropTable('form-structure');
  }
};
