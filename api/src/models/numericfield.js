const { Model, DataTypes } = require('sequelize');

  class numericfield extends Model {
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
        field_id: DataTypes.INTEGER,
        min: DataTypes.FLOAT,
        max: DataTypes.FLOAT
      }, {
        sequelize,
        modelName: 'numericfield',
      })
    }
  };

  module.exports = numericfield;
