'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Forms extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsToMany(models.FormsFields, { foreignKey: 'id_forms', through: models.FormStructure });
      this.hasMany(models.Evaluation, { foreignKey: 'forms_id' });
    }
  };
  Forms.init({}, {
    sequelize,
    modelName: 'Form',
    tableName: 'forms'
  })
  return Forms;
};
