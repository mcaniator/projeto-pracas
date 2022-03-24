const { NumericField } = require('../models');

module.exports = {
  async index(req, res) {
    const forms = await NumericField.findAll();
    return res.json(forms);
  },

  async store(req, res) {
    const { forms } = req.body;
    const ret = await NumericField.bulkCreate(forms);
    return res.json(ret);
  }
};