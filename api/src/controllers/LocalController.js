const Local = require('../models/locals');

module.exports = {
    async index(req, res) {
        const local = await Local.findAll();
        return res.json(local);
    },

    async store(req, res) {
        const locals = req.body;
        console.log(locals);
        const ret = await Local.create(locals);
        return res.json(ret);
    }
};