const { OptionField } = require('../models');

module.exports = {
  async index(req, res) {
    const forms = await OptionField.findAll();
    return res.json(forms);
  },

  async store(req, res) {
    const {forms} = req.body;
    const ret =  await OptionField.bulkCreate(forms);
    return res.json(ret);
  }
};