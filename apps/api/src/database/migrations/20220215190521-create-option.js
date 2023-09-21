'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

     await queryInterface.createTable('option', 
     { 
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      id_optionfield: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references : {model: 'optionfield', key : 'id'}
      }
    });
  },

  down: async (queryInterface, Sequelize) => {

     await queryInterface.dropTable('option');
  }
};
