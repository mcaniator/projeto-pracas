const { Local } = require('../models');

module.exports = {
    async index(req, res) {
        const local = await Local.findAll();
        return res.json(local);
    },

    async store(req, res) {
        const locals = req.body;
        const ret = await Local.create(locals);
        return res.json(ret);
    }
};