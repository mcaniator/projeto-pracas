'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {

  class TextField extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  TextField.init({
    id_field: DataTypes.INTEGER,
    char_limit: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'TextField',
    tableName: 'textfield',
  })
  return TextField;
};
