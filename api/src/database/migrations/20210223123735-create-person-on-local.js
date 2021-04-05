'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('person_on_locals', {
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
    await queryInterface.dropTable('person_on_locals');
  }
};