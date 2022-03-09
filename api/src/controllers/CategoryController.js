const connection = require('../database/index')
const {  DataTypes } = require('sequelize');


const Category = require('../models/category')(connection, DataTypes);

module.exports = {
  async index(req, res) {
    const category = await Category.findAll();
    return res.json(category);
  },

  async store(req, res) {
    const {category} = req.body;
    console.log(category);
    const ret =  await Category.bulkCreate(category);
    return res.json(ret);
  }
};