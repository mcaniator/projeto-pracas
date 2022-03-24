const { Form } = require('../models');

module.exports = {
  async index(req, res) {
    const forms = await Form.findAll();
    return res.json(forms);
  },

  async store(req, res) {
    const {forms} = req.body;
    const ret =  await Form.bulkCreate(forms);
    return res.json(ret);
  }
};