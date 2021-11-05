const Acessibility = require('../models/Accessibility');

module.exports = {
    async index(req, res) {
        const users = await Acessibility.findAll();

        return res.json(users);
    },

    async store(req, res) {
        const {
            sidewalk,
            type,
            evaluation_id,
            clear_path,
            furniture_zone,
            min_height,
            crossing,
            obstacle,
            cross_slope,
            longitudinal_slope,
            tactile_floor,
            regular_floor,
            disabled_parking,
            senior_parking,
            accessible_route,
            adapted_equipment,
        } = req.body;

        const user = await Acessibility.create({
            sidewalk,
            type,
            evaluation_id,
            clear_path,
            furniture_zone,
            min_height,
            crossing,
            obstacle,
            cross_slope,
            longitudinal_slope,
            tactile_floor,
            regular_floor,
            disabled_parking,
            senior_parking,
            accessible_route,
            adapted_equipment,
        });

        return res.json(user);
    }
};