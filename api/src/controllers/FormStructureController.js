const { FormStructure } = require('../models');

module.exports = {
  async index(req, res) {
    const forms = await FormStructure.findAll();
    return res.json(forms);
  },

  async store(req, res) {
    const structures = req.body;
    const ret = await FormStructure.bulkCreate(structures);
    return res.json(ret);
  }
};