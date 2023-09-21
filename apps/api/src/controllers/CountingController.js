const { Counting } = require('../models');

module.exports = {
  async index(req, res) {
    const counting = await Counting.findAll();
    return res.json(counting);
  },

  async store(req, res) {
    const {counting} = req.body;
    const ret =  await Counting.bulkCreate(counting);
    return res.json(ret);
  }
};