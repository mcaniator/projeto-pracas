const { Event } = require('../models');

module.exports = {
  async index(req, res) {
    const events = await Event.findAll();

    return res.json(events);
  }
};