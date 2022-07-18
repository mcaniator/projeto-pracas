const { FormsFields, Category, NumericField, TextField, Option, OptionField, sequelize } = require('../models');

module.exports = {
  async index(req, res) {
    const forms = await FormsFields.findAll();
    return res.json(forms);
  },

  async store(req, res) {
    const { question, type, field, options } = req.body;
    let Field;

    switch (type) {
      case 'numeric':
        Field = NumericField;
        break;
      case 'text':
        Field = TextField;
        break;
      case 'option':
        Field = OptionField
        break;
      default:
        return res.status(400).json({ msg: 'Invalid field type' });
    }

    const result = await sequelize.transaction(async (t) => {
      const formField = await FormsFields.create(question, { transaction: t });

      field.id_field = formField.dataValues.id;

      const typeField = await Field.create(field, { transaction: t });

      if (type === 'option') {
        options.forEach((opt) => {
          opt.id_optionfield = typeField.dataValues.id;
        });

        const opts = await Option.bulkCreate(options, { transaction: t });

        return { formField, typeField, options: opts }
      }

      return { formField, typeField }
    })


    return res.json(result);
  },

  async getWithCategory(req, res) {
    const fields = await Category.findAll({
      attributes: ['id', 'name'],
      where: { active: true },
      include: {
        attributes: ['id', 'name', 'optional'],
        model: FormsFields,
        where: { active: true },
      },
    });

    res.json(fields)
  }
};