const { FormStructure } = require('../models');

module.exports = {
  async index(req, res) {
    const forms = await FormStructure.findAll();
    return res.json(forms);
  },

  async store(req, res) {
    const {forms} = req.body;
    const ret =  await FormStructure.bulkCreate(forms);
    return res.json(ret);
  }
};