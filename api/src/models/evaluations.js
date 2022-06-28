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
      this.belongsTo(models.Form, { foreignKey: 'forms_id' })
    }
  };
  evaluations.init({
    name: DataTypes.STRING,
    type: DataTypes.INTEGER,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    answers: DataTypes.JSON,
    forms_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Evaluation',
    tableName: 'evaluations',
    timestamps: true,
    underscored: false
  });
  return evaluations;
};