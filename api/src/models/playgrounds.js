'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class playgrounds extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  playgrounds.init({
    name: DataTypes.STRING,
    material_type: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    crack_greater_8mm: DataTypes.BOOLEAN,
    pointed_object: DataTypes.BOOLEAN,
    sharp_corner: DataTypes.BOOLEAN,
    conservation: DataTypes.INTEGER,
    evaluation_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'playgrounds',
  });
  return playgrounds;
};