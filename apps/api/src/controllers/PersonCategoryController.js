const { PersonCategory } = require('../models');

module.exports = {
  async index(req, res) {
    const category = await PersonCategory.findAll();
    return res.json(category);
  },

  async store(req, res) {
    const {category} = req.body;
    const ret =  await PersonCategory.bulkCreate(category);
    return res.json(ret);
  }
};