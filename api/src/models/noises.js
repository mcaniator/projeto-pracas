'use strict';
const { Model, DataTypes } = require('sequelize');

  class noises extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }


  static init(sequelize) {
        super.init({
        db_level: {
          type: DataTypes.DECIMAL,
          allowNull: false,
        },
        is_weekend: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        positioning: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        category: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        evaluation_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        createdAt: {
          field:"createdAt",
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: sequelize.NOW
        },
        updatedAt: {
          field:"updatedAt",
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: sequelize.NOW
        }
      },
      {
      sequelize,
      timestamps: true,
      }
    )
  };
};

  module.exports = noises;
