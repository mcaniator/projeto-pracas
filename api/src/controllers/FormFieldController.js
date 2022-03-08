const Form = require('../models/forms-fields');

module.exports = {
  async index(req, res) {
    const forms = await Form.findAll();
    return res.json(forms);
  },

  async store(req, res) {
    const {forms} = req.body;
    console.log(forms);
    const ret =  await Form.bulkCreate(forms);
    return res.json(ret);
  }
};