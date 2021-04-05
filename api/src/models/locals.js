'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class locals extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  locals.init({
    name: DataTypes.STRING,
    common_name: DataTypes.STRING,
    type: DataTypes.INTEGER,
    free_space_category: DataTypes.INTEGER,
    comments: DataTypes.TEXT,
    creation_year: DataTypes.STRING,
    reform_year: DataTypes.STRING,
    mayor_creation: DataTypes.STRING,
    legislation: DataTypes.STRING,
    useful_area: DataTypes.INTEGER,
    area_pjf: DataTypes.INTEGER,
    angle_inclination: DataTypes.INTEGER,
    urban_region: DataTypes.BOOLEAN,
    inactive_not_found: DataTypes.BOOLEAN,
    address_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'locals',
  });
  return locals;
};