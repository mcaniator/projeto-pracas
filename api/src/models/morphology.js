'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class morphology extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  morphology.init({
    categorie: DataTypes.INTEGER,
    divided: DataTypes.BOOLEAN,
    evaluation_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'morphology',
  });
  return morphology;
};