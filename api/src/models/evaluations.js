'use strict';
// const {
//   Model
// } = require('sequelize');
// module.exports = (sequelize, DataTypes) => {
//   class evaluations extends Model {
//     /**
//      * Helper method for defining associations.
//      * This method is not a part of Sequelize lifecycle.
//      * The `models/index` file will call this method automatically.
//      */
//     static associate(models) {
//       // define association here
//     }
//   };
//   evaluations.init({
//     name: DataTypes.STRING,
//     type: DataTypes.INTEGER,
//     email: DataTypes.STRING,
//     password: DataTypes.STRING,
//     user_id: DataTypes.INTEGER
//   }, {
//     sequelize,
//     modelName: 'evaluations',
//   });
//   return evaluations;
// };

const { Model, DataTypes } = require('sequelize');

class evaluations extends Model {
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
      type: DataTypes.INTEGER,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      user_id: DataTypes.INTEGER,
    }, {
      sequelize,
      modelName: 'evaluations',
      timestamps: false,
    })
  };
};

module.exports = evaluations;