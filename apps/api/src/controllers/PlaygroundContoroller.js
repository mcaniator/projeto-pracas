const { Playgrounds } = require("../models");

module.exports = {
  async index(req, res) {
    const playgrounds = await Playgrounds.findAll();
    return res.json(playgrounds);
  },

  async store(req, res) {
    const { playgrounds } = req.body;
    const ret = await Playgrounds.bulkCreate(playgrounds);
    return res.json(ret);
  },
};
