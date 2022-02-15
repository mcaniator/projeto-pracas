const { Model, DataTypes } = require('sequelize');

  class optionfield extends Model {
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
        option_limit: DataTypes.INTEGER,
        total_options: DataTypes.INTEGER,
        visual_preference: DataTypes.INTEGER,
      }, {
        sequelize,
        modelName: 'optionfield',
      })
    }
  };

  module.exports = optionfield;
