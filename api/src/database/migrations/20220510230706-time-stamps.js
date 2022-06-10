'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.renameColumn('users', 'created_at', 'createdAt', {}, { transaction: t }),
        queryInterface.renameColumn('users', 'updated_at', 'updatedAt', {}, { transaction: t }),
        queryInterface.addColumn('person_category', 'createdAt', {
          allowNull: false,
          type: Sequelize.DATE
        }, {}, { transaction: t }),
        queryInterface.addColumn('person_category', 'updatedAt', {
          allowNull: false,
          type: Sequelize.DATE
        }, {}, { transaction: t }),
        queryInterface.renameColumn('category', 'created_at', 'createdAt', {}, { transaction: t }),
        queryInterface.addColumn('category', 'updatedAt', {
          allowNull: false,
          type: Sequelize.DATE
        }, {}, { transaction: t }),
        queryInterface.addColumn('forms', 'createdAt', {
          allowNull: false,
          type: Sequelize.DATE
        }, {}, { transaction: t }),
        queryInterface.addColumn('forms', 'updatedAt', {
          allowNull: false,
          type: Sequelize.DATE
        }, {}, { transaction: t }),
        queryInterface.addColumn('forms-fields', 'createdAt', {
          allowNull: false,
          type: Sequelize.DATE
        }, {}, { transaction: t }),
        queryInterface.addColumn('forms-fields', 'updatedAt', {
          allowNull: false,
          type: Sequelize.DATE
        }, {}, { transaction: t }),
        queryInterface.addColumn('textfield', 'createdAt', {
          allowNull: false,
          type: Sequelize.DATE
        }, {}, { transaction: t }),
        queryInterface.addColumn('textfield', 'updatedAt', {
          allowNull: false,
          type: Sequelize.DATE
        }, {}, { transaction: t }),
        queryInterface.addColumn('numericfield', 'createdAt', {
          allowNull: false,
          type: Sequelize.DATE
        }, {}, { transaction: t }),
        queryInterface.addColumn('numericfield', 'updatedAt', {
          allowNull: false,
          type: Sequelize.DATE
        }, {}, { transaction: t }),
        queryInterface.addColumn('optionfield', 'createdAt', {
          allowNull: false,
          type: Sequelize.DATE
        }, {}, { transaction: t }),
        queryInterface.addColumn('optionfield', 'updatedAt', {
          allowNull: false,
          type: Sequelize.DATE
        }, {}, { transaction: t }),
        queryInterface.addColumn('option', 'createdAt', {
          allowNull: false,
          type: Sequelize.DATE
        }, {}, { transaction: t }),
        queryInterface.addColumn('option', 'updatedAt', {
          allowNull: false,
          type: Sequelize.DATE
        }, {}, { transaction: t }),
        queryInterface.addColumn('form-structure', 'createdAt', {
          allowNull: false,
          type: Sequelize.DATE
        }, {}, { transaction: t }),
        queryInterface.addColumn('form-structure', 'updatedAt', {
          allowNull: false,
          type: Sequelize.DATE
        }, {}, { transaction: t }),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.renameColumn('users', 'createdAt', 'created_at', {}, { transaction: t }),
        queryInterface.renameColumn('users', 'updatedAt', 'updated_at', {}, { transaction: t }),
        queryInterface.removeColumn('person_category', 'createdAt'),
        queryInterface.removeColumn('person_category', 'updatedAt'),
        queryInterface.renameColumn('category', 'createdAt', 'created_at', {}, { transaction: t }),
        queryInterface.removeColumn('category', 'updatedAt'),
        queryInterface.removeColumn('forms', 'createdAt'),
        queryInterface.removeColumn('forms', 'updatedAt'),
        queryInterface.removeColumn('forms-fields', 'createdAt'),
        queryInterface.removeColumn('forms-fields', 'updatedAt'),
        queryInterface.removeColumn('textfield', 'createdAt'),
        queryInterface.removeColumn('textfield', 'updatedAt'),
        queryInterface.removeColumn('numericfield', 'createdAt'),
        queryInterface.removeColumn('numericfield', 'updatedAt'),
        queryInterface.removeColumn('optionfield', 'createdAt'),
        queryInterface.removeColumn('optionfield', 'updatedAt'),
        queryInterface.removeColumn('option', 'createdAt'),
        queryInterface.removeColumn('option', 'updatedAt'),
        queryInterface.removeColumn('form-structure', 'createdAt'),
        queryInterface.removeColumn('form-structure', 'updatedAt'),

      ]);
    });
  }
};
