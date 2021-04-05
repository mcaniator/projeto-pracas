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
    seidewalk: DataTypes.INTEGER,
    type: DataTypes.INTEGER,
    evaluation_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'accessibility',
  });
  return accessibility;
};