'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class use_areas extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  use_areas.init({
    element: DataTypes.STRING,
    type: DataTypes.INTEGER,
    use_area_eval_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'use_areas',
  });
  return use_areas;
};