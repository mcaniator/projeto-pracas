const NumericField = require('../models/numericfield');

module.exports = {
  async index(req, res) {
    try {
      const forms = await NumericField.findAll();
      return res.json(forms);
    }
    catch (error) {
      console.error(error);
      return es.status(500).send('error')
    }
  },

  async store(req, res) {
    const { forms } = req.body;

    try {
      const ret = await NumericField.bulkCreate(forms);
      return res.json(ret);

    } catch (error) {
      console.error(error);
      return es.status(500).send('error')
    }
  }
};