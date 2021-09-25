const Sequelize = require('sequelize');
const dbConfig = require('../config/database');

const User = require('../models/User');
const Address = require('../models/Address');
const Tech = require('../models/Tech');
const Local = require('../models/locals');
// const Event = require('../models/Event');
const Evaluation = require('../models/evaluations');

const connection = new Sequelize(dbConfig);

User.init(connection);
Address.init(connection);
Tech.init(connection);
Local.init(connection);
// Event.init(connection);
Evaluation.init(connection);

User.associate(connection.models);
Address.associate(connection.models);
Tech.associate(connection.models);
Local.associate(connection.models);
// Event.associate(connection.models);
Evaluation.associate(connection.models);

module.exports = connection;