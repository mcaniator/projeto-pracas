'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('category', 'type')
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('category', 'type', {
      type: Sequelize.INTEGER,
      allowNull: true,
    })
  }
};
