const { Evaluation } = require('../models');

module.exports = {
  async index(req, res) {
    const evals = await Evaluation.findAll();
    return res.json(evals);
  },

  async store(req, res) {
    const {evals} = req.body;
    const ret =  await Evaluation.bulkCreate(evals);
    return res.json(ret);
  }
};