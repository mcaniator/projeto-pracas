const FormsFields = require('../models/forms-fields');

module.exports = {
  async index(req, res) {
    const forms = await FormsFields.findAll();
    return res.json(forms);
  },

  async store(req, res) {
    const {forms} = req.body;
    console.log(forms);
    const ret =  await FormsFields.bulkCreate(forms);
    return res.json(ret);
  }
};