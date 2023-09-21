const { Category } = require('../models');

module.exports = {
  async index(req, res) {
    const category = await Category.findAll();
    return res.json(category);
  },

  async store(req, res) {
    const {category} = req.body;
    const ret =  await Category.bulkCreate(category);
    return res.json(ret);
  }
};