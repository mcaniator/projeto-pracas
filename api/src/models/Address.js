'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Address.init({
    UF: { type: DataTypes.STRING, field: "UF" },
    locals_id: DataTypes.INTEGER,
    city: DataTypes.STRING,
    neighborhood: DataTypes.STRING,
    street: DataTypes.STRING,
    number: DataTypes.STRING,
    planning_region_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Address',
    tableName: 'addresses',
    timestamps: true,
    underscored: false
  });
  return Address;
};
