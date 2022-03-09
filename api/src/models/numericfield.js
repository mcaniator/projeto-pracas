const { Model, DataTypes } = require('sequelize');

  class NumericField extends Model {
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
        id_field: DataTypes.INTEGER,
        min: DataTypes.FLOAT,
        max: DataTypes.FLOAT
      }, {
        sequelize,
        modelName: 'numericfield',
        tableName: 'numericfield',
      })
    }
  };

  module.exports = NumericField;
