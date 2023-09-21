const { Option } = require('../models');

module.exports = {
  async index(req, res) {
    const options = await Option.findAll();
    return res.json(options);
  },

  async store(req, res) {
    const {options} = req.body;
    const ret =  await Option.bulkCreate(options);
    return res.json(ret);
  }
};