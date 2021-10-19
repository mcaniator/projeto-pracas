'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn(
      'accessibilities',
      'seidewalk',
      'sidewalk'
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn(
      'accessibilities',
      'sidewalk',
      'seidewalk'
    );
  }
};
