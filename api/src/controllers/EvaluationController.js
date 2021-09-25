const Evaluation = require('../models/evaluations');

module.exports = {
    async index(req, res) {
        const local = await Evaluation.findAll();
        return res.json(local);
    },

    async store(req, res) {
        const evaluations = req.body;
        console.log(evaluations);
        const ret = await Evaluation.create(evaluations);
        return res.json(ret);
    }
};