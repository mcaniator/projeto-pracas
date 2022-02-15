const { Model, DataTypes } = require('sequelize');

  class textfield extends Model {
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
        char_limit: DataTypes.INTEGER,
      }, {
        sequelize,
        modelName: 'textfield',
      })
    }
  };

  module.exports = textfield;
