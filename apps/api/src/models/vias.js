'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class vias extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  vias.init({
    typology: DataTypes.STRING,
    morphology_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'vias',
  });
  return vias;
};