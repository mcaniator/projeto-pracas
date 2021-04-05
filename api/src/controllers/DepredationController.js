const depredations = require('../models/depredations');

module.exports = {
  async index(req, res) {
    const drepredations = await depredations.findAll();

    return res.json(drepredations);
  }
};