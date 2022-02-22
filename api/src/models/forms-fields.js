const { Model, DataTypes } = require('sequelize');

  class formsFields extends Model {
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
        name: DataTypes.STRING,
        optional: DataTypes.BOOLEAN,
        active: DataTypes.BOOLEAN,
        category_id: DataTypes.INTEGER  
      }, {
        sequelize,
        modelName: 'forms-fields',
      })
    }
  };

  module.exports = formsFields;
