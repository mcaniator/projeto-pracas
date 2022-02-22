const { Model, DataTypes } = require('sequelize');

  class option extends Model {
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
        optionfield_id: DataTypes.INTEGER,
        name: DataTypes.STRING,
      }, {
        sequelize,
        modelName: 'option',
      })
    }
  };

  module.exports = option;
