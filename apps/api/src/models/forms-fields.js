'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FormsFields extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsToMany(models.Form, { foreignKey: 'id_forms_fields', through: models.FormStructure });
      this.belongsTo(models.Category, { foreignKey: 'category_id' })
      this.hasOne(models.NumericField, { foreignKey: 'id_field' })
      this.hasOne(models.TextField, { foreignKey: 'id_field' })
      this.hasOne(models.OptionField, { foreignKey: 'id_field' })
    }
  };
  FormsFields.init({
    name: DataTypes.STRING,
    optional: DataTypes.BOOLEAN,
    active: DataTypes.BOOLEAN,
    category_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'FormsFields',
    tableName: 'forms-fields'
  });

  return FormsFields;
};
