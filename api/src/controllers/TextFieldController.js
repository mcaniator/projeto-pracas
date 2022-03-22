const { TextField } = require('../models');

module.exports = {
  async index(req, res) {
    const forms = await TextField.findAll();
    return res.json(forms);
  },

  async store(req, res) {
    const {forms} = req.body;
    console.log(forms);
    const ret =  await TextField.bulkCreate(forms);
    return res.json(ret);
  }
};