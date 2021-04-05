const Event = require('../models/Event');

module.exports = {
  async index(req, res) {
    const events = await Event.findAll();

    return res.json(events);
  }
};