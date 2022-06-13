const { Form, FormStructure, sequelize } = require('../models');

module.exports = {
  async index(req, res) {
    const forms = await Form.findAll();
    return res.json(forms);
  },

  async store(req, res) {
    const { fields } = req.body;

    const result = await sequelize.transaction(async (t) => {
      const form = await Form.create(null, { transaction: t });

      const structures = fields.map(field => {
        return { id_forms: form.dataValues.id, id_forms_fields: field.id }
      })

      const formStructures = await FormStructure.bulkCreate(structures, { transaction: t });

      return { form, formStructures }
    });

    return res.json(result);
  }
};