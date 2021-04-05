'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class photos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  photos.init({
    description: DataTypes.STRING,
    path: DataTypes.TEXT,
    evaluation_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'photos',
  });
  return photos;
};