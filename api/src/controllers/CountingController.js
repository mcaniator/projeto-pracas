const Counting = require('../models/coutings');

module.exports = {
  async index(req, res) {
    const counting = await Counting.findAll();
    return res.json(counting);
  },

  async store(req, res) {
    const {counting} = req.body;
    console.log(counting);
    const ret =  await Counting.bulkCreate(counting);
    return res.json(ret);
  }
};