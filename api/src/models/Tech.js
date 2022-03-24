'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tech extends Model {
    static associate(models) {
      this.belongsToMany(models.User, { foreignKey: 'tech_id', through: 'user_techs', as: 'users' });
    }
  };
  Tech.init({
    name: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Tech',
    tableName: 'techs',
  })
  return Tech;
};
