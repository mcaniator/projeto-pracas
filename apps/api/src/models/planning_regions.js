'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class planning_regions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  planning_regions.init({
    name: DataTypes.STRING,
    planning_unit_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'planning_regions',
  });
  return planning_regions;
};