'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class use_density_around extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  use_density_around.init({
    use_type: DataTypes.DECIMAL,
    institucional_use: DataTypes.BOOLEAN,
    count_houses: DataTypes.INTEGER,
    other_relevant_elements: DataTypes.STRING,
    night_user: DataTypes.BOOLEAN,
    day_use: DataTypes.BOOLEAN,
    third_place: DataTypes.BOOLEAN,
    third_place_description: DataTypes.TEXT,
    evaluation_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'use_density_around',
  });
  return use_density_around;
};