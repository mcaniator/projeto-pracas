'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class evaluations extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  evaluations.init({
    name: DataTypes.STRING,
    type: DataTypes.INTEGER,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    answers: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Evaluation',
    tableName: 'evaluations',
  });
  return evaluations;
};