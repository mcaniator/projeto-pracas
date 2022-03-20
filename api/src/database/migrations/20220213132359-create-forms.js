'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

     await queryInterface.createTable('forms', 
     { 
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      evaluations_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references : {model: 'evaluations', key : 'id'}
      }

    });
  },

  down: async (queryInterface, Sequelize) => {

     await queryInterface.dropTable('forms');
  }
};
