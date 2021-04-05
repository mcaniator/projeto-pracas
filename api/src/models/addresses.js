'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class addresses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  addresses.init({
    cep: DataTypes.STRING,
    UF: DataTypes.STRING,
    city: DataTypes.STRING,
    neighborhood: DataTypes.STRING,
    sreet: DataTypes.STRING,
    number: DataTypes.STRING,
    complement: DataTypes.STRING,
    planning_region_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'addresses',
  });
  return addresses;
};