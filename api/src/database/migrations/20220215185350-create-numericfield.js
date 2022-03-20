'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('numericfield', 
     { 
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      min: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      max: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      id_field: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references : {model: 'forms-fields', key : 'id'}
      }
    })
  },
  

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('numericfield');
  }
};
