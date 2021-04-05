const { Model, DataTypes } = require('sequelize');

class User extends Model {
  static init(sequelize) {
    super.init({
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      type: DataTypes.INTEGER,
      phone_number: DataTypes.STRING,
    }, {
      sequelize
    })
  }

  static associate(models) {

  }
}

module.exports = User;