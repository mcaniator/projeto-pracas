'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {

  class NumericField extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.FormsFields, { foreignKey: 'id_field' })
    }
  };

  NumericField.init({
    id_field: DataTypes.INTEGER,
    min: DataTypes.FLOAT,
    max: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'NumericField',
    tableName: 'numericfield'
  })
  return NumericField;
};
