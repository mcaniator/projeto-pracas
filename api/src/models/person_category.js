'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class person_category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  person_category.init({
    age_rating: DataTypes.INTEGER,
    physical_activity: DataTypes.BOOLEAN,
    deficiency_person: DataTypes.BOOLEAN,
    illegal_activity: DataTypes.BOOLEAN,
    homeless: DataTypes.BOOLEAN,
    quantity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'person_category',
  });
  return person_category;
};