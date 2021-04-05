const path = require('path');

module.exports = {
    dialect: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: '1016868',
    database: 'square_project2',
    define: {
        timestamps: false,
        underscored: true,
    },

    'models-path': path.resolve('src/models', 'sequelize'),
}