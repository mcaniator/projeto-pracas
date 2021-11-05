'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'accessibilities',
        'clear_path',
        { type: Sequelize.BOOLEAN }
      ),
      queryInterface.addColumn(
        'accessibilities',
        'furniture_zone',
        { type: Sequelize.BOOLEAN }
      ),
      queryInterface.addColumn(
        'accessibilities',
        'min_height',
        { type: Sequelize.BOOLEAN }
      ),
      queryInterface.addColumn(
        'accessibilities',
        'crossing',
        { type: Sequelize.BOOLEAN }
      ),
      queryInterface.addColumn(
        'accessibilities',
        'obstacle',
        { type: Sequelize.BOOLEAN }
      ),
      queryInterface.addColumn(
        'accessibilities',
        'cross_slope',
        { type: Sequelize.BOOLEAN }
      ),
      queryInterface.addColumn(
        'accessibilities',
        'longitudinal_slope',
        { type: Sequelize.BOOLEAN }
      ),
      queryInterface.addColumn(
        'accessibilities',
        'tactile_floor',
        { type: Sequelize.BOOLEAN }
      ),
      queryInterface.addColumn(
        'accessibilities',
        'regular_floor',
        { type: Sequelize.BOOLEAN }
      ),
      queryInterface.addColumn(
        'accessibilities',
        'disabled_parking',
        { type: Sequelize.BOOLEAN }
      ),
      queryInterface.addColumn(
        'accessibilities',
        'senior_parking',
        { type: Sequelize.BOOLEAN }
      ),
      queryInterface.addColumn(
        'accessibilities',
        'accessible_route',
        { type: Sequelize.BOOLEAN }
      ),
      queryInterface.addColumn(
        'accessibilities',
        'adapted_equipment',
        { type: Sequelize.BOOLEAN }
      ),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('accessibilities', 'clear_path'),
      queryInterface.removeColumn('accessibilities', 'furniture_zone'),
      queryInterface.removeColumn('accessibilities', 'min_height'),
      queryInterface.removeColumn('accessibilities', 'crossing'),
      queryInterface.removeColumn('accessibilities', 'obstacle'),
      queryInterface.removeColumn('accessibilities', 'cross_slope'),
      queryInterface.removeColumn('accessibilities', 'longitudinal_slope'),
      queryInterface.removeColumn('accessibilities', 'tactile_floor'),
      queryInterface.removeColumn('accessibilities', 'regular_floor'),
      queryInterface.removeColumn('accessibilities', 'disabled_parking'),
      queryInterface.removeColumn('accessibilities', 'senior_parking'),
      queryInterface.removeColumn('accessibilities', 'accessible_route'),
      queryInterface.removeColumn('accessibilities', 'adapted_equipment'),
    ]);
  }
};
