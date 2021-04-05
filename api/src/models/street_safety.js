'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class street_safety extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  street_safety.init({
    crosswalk: DataTypes.BOOLEAN,
    semaphore: DataTypes.BOOLEAN,
    protection_fence: DataTypes.BOOLEAN,
    speed_limit_plate: DataTypes.BOOLEAN,
    evaluation_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'street_safety',
  });
  return street_safety;
};