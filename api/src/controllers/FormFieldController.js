const { FormsFields } = require('../models');

module.exports = {
  async index(req, res) {
    const forms = await FormsFields.findAll();
    return res.json(forms);
  },

  async store(req, res) {
    const {forms} = req.body;
    const ret =  await FormsFields.bulkCreate(forms);
    return res.json(ret);
  }
};