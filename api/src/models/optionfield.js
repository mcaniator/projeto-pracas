'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {

  class OptionField extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  OptionField.init({
    field_id: DataTypes.INTEGER,
    option_limit: DataTypes.INTEGER,
    total_options: DataTypes.INTEGER,
    visual_preference: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'OptionField',
    tableName: 'optionfield'
  })
  return OptionField;
};
