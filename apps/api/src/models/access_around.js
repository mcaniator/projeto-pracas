'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class access_around extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  access_around.init({
    name_plate: DataTypes.INTEGER,
    transport_point: DataTypes.INTEGER,
    taxi_point: DataTypes.INTEGER,
    fence: DataTypes.BOOLEAN,
    vihicle_parking: DataTypes.INTEGER,
    motorcycle_parking: DataTypes.INTEGER,
    bike_lane: DataTypes.BOOLEAN,
    bike_rack: DataTypes.INTEGER,
    evaluation_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'access_around',
  });
  return access_around;
};