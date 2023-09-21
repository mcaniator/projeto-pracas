'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class people_positioning extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  people_positioning.init({
    name: DataTypes.STRING,
    evaluation_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'people_positioning',
  });
  return people_positioning;
};