'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('person_category', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      age_rating: {
        type: Sequelize.INTEGER
      },
      physical_activity: {
        type: Sequelize.BOOLEAN
      },
      deficiency_person: {
        type: Sequelize.BOOLEAN
      },
      illegal_activity: {
        type: Sequelize.BOOLEAN
      },
      homeless: {
        type: Sequelize.BOOLEAN
      },
      quantity: {
        type: Sequelize.INTEGER
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('person_category');
  }
};