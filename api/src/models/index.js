'use strict';

// Esse arquivo foi auto gerado pelo sequelize, ele busca os modelos, os carraega e retorna a conexao como banco

// Pacotes do core do Node.js
const fs = require('fs'); // implementa funcionalidades para lidar com o sistema de arquivos
const path = require('path'); // utilitario para trabalhar com caminho de arquivos e de diretorios

const Sequelize = require('sequelize');

const basename = path.basename(__filename); // Obtem o nome desse arquvio, no caso index.js
// const env = process.env.NODE_ENV || 'development'; // Seleciona em que ambiente a aplicacao esta rodando
const config = require(__dirname + '/../config/database.js'); //[env]; // Carrega configuracao

// Esse objeto vai guardar os modelos e a conexao com o banco
const db = {};

// Sequelize se conecta com o banco de dados
let sequelize;
if (config.use_env_variable) { // Caso esteja em producao com variaveis de ambiente
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs.readdirSync(__dirname) // retorna um array com os nomes de arquivo desse diretorio (models/)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'); // elimina arquivos ocultos que comecam com "." e arquivos que nao sao javascript
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes); // carreaga cada arquivo de modelo passando o sequelize e os tipos de dados
    db[model.name] = model; // salva o modelo no objeto db
  });

// Associa os arquivos de modelo com a conexao do sequelize com o banco
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;