'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FormStructure extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  FormStructure.init({
    id_forms: DataTypes.INTEGER,
    id_forms_fields: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'FormStructure',
    tableName: 'form-structure'
  })
  return FormStructure;
};
