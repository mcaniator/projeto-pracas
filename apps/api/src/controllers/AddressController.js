const { Address } = require('../models');

module.exports = {
  async index(req, res) {
    const addresses = await Address.findAll();
    return res.json(addresses);
  },

  async store(req, res) {
    const { addresses } = req.body;
    const ret = await Address.bulkCreate(addresses);
    return res.json(ret);
  }
};