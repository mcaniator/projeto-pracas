'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.FormsFields, { foreignKey: 'category_id' });
    }
  };
  category.init({
    name: DataTypes.STRING,
    optional: DataTypes.BOOLEAN,
    active: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'category',
  });
  return category;
};