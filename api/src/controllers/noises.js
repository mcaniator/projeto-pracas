const Noises = require("../models/noises");
module.exports = {
  async index(req, res) {
    const noise = await Noises.findAll();
    return res.json(noise);
  },

  async store(req, res) {
    const noises = req.body;
    console.log(noises);
    const ret = await Noises.create(noises);
    return res.json(ret);
  }
};
