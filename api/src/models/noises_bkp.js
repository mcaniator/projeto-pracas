'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class noises extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  noises.init({
    db_level: DataTypes.DECIMAL,
    is_weekend: DataTypes.BOOLEAN,
    positioning: DataTypes.INTEGER,
    category: DataTypes.INTEGER,
    evaluation_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'noises',
  });
  return noises;
};