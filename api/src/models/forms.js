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
      // define association here
    }
  };
  Forms.init({
    evaluations_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Form',
    tableName: 'forms'
  })
  return Forms;
};
