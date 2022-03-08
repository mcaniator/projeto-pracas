const Category = require('../models/category');

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