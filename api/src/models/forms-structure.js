const { Model, DataTypes } = require('sequelize');

  class formStructure extends Model {
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
        id_forms: DataTypes.INTEGER,
        id_forms_fields: DataTypes.INTEGER,
      }, {
        sequelize,
        modelName: 'form_structure',
      })
    }
  };

  module.exports = formStructure;