const { Depredation } = require('../models');

module.exports = {
  async index(req, res) {
    const drepredations = await depredations.findAll();

    return res.json(drepredations);
  }
};