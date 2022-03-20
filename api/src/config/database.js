const path = require('path');

module.exports = {
    dialect: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: '02Ago1962',
    database: 'square_project',
    define: {
        timestamps: true,
        underscored: true,
    },

    'models-path': path.resolve('src/models', 'sequelize'),
}