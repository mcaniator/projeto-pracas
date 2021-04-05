'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class suveirllance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  suveirllance.init({
    camera: DataTypes.BOOLEAN,
    police_station: DataTypes.BOOLEAN,
    visibility: DataTypes.INTEGER,
    permeable_facate: DataTypes.INTEGER,
    active_facate: DataTypes.INTEGER,
    evaluation_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'suveirllance',
  });
  return suveirllance;
};