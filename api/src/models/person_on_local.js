'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class person_on_local extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  person_on_local.init({
    age_rating: DataTypes.INTEGER,
    physical_activity: DataTypes.BOOLEAN,
    deficiency_person: DataTypes.BOOLEAN,
    illegal_activity: DataTypes.BOOLEAN,
    homeless: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'person_on_local',
  });
  return person_on_local;
};