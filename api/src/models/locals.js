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
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    common_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    free_space_category: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    creation_year: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reform_year: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mayor_creation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    legislation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    useful_area: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    area_pjf: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    angle_inclination: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    urban_region: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    inactive_not_found: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    address_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    polygon: {
      type: DataTypes.GEOMETRY("Polygon"),
      allowNull: true
    },
  },
    {
      sequelize,
      timestamps: false,
      modelName: 'Local',
      tableName: 'locals',
      timestamps: true,
      underscored: false
    })
    
  return locals;
}
