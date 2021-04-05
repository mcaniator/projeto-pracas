'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class use_area_evaluations extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  use_area_evaluations.init({
    quantity: DataTypes.INTEGER,
    shadow_area: DataTypes.BOOLEAN,
    lighting: DataTypes.BOOLEAN,
    walled: DataTypes.BOOLEAN,
    seats: DataTypes.BOOLEAN,
    conservation: DataTypes.INTEGER,
    conservation: DataTypes.INTEGER,
    meter: DataTypes.INTEGER,
    photo_path: DataTypes.TEXT,
    evaluation_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'use_area_evaluations',
  });
  return use_area_evaluations;
};