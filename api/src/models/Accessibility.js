'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class accessibility extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  accessibility.init({
    sidewalk: DataTypes.INTEGER,
    type: DataTypes.INTEGER,
    evaluation_id: DataTypes.INTEGER,
    clear_path: DataTypes.BOOLEAN,
    furniture_zone: DataTypes.BOOLEAN,
    min_height: DataTypes.BOOLEAN,
    crossing: DataTypes.BOOLEAN,
    obstacle: DataTypes.BOOLEAN,
    cross_slope: DataTypes.BOOLEAN,
    longitudinal_slope: DataTypes.BOOLEAN,
    tactile_floor: DataTypes.BOOLEAN,
    regular_floor: DataTypes.BOOLEAN,
    disabled_parking: DataTypes.BOOLEAN,
    senior_parking: DataTypes.BOOLEAN,
    accessible_route: DataTypes.BOOLEAN,
    adapted_equipment: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'accessibility',
  });
  return accessibility;
};