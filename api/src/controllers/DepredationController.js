const depredations = require('../models/depredations');

module.exports = {
    async index(req, res) {
      const drepredations = await depredations.findAll();
      console.log(drepredations);
      return res.json(drepredations);
    },
    async store(req, res) {
        const depredations = req.body;
        console.log(depredations);
        const ret = await Depredation.create(depredations);
        return res.json(ret);
    }
};
