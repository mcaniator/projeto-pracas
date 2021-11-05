const Evaluation = require('../models/evaluations');

module.exports = {
    async index(req, res) {
        const evaluation = await Evaluation.findAll({
            attributes: { exclude: ['password'] }
        });
        return res.json(evaluation);
    },

    async store(req, res) {
        const evaluations = req.body;
        console.log(evaluations);
        const ret = await Evaluation.create(evaluations);
        return res.json(ret);
    }
};