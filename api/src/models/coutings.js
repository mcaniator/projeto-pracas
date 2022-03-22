'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class coutings extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  coutings.init({
    name: DataTypes.STRING,
    init_date_time: DataTypes.DATE,
    end_date_time: DataTypes.DATE,
    count_animals: DataTypes.INTEGER,
    temperature: DataTypes.INTEGER,
    sky: DataTypes.STRING,
    person_on_local_id: DataTypes.INTEGER,
    local_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Counting',
    tableName: 'coutings',
  });
  return coutings;
};