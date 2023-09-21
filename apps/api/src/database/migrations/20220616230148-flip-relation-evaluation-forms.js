'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('evaluations', 'forms_id', {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'forms',
            key: 'id'
          },
          transaction: t
        }, { transaction: t }),
        queryInterface.removeColumn('forms', 'evaluations_id', { transaction: t }),
      ]);
    })
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('forms', 'evaluations_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'evaluations',
            key: 'id'
          },
          transaction: t
        }, { transaction: t }),
        queryInterface.removeColumn('evaluations', 'forms_id', { transaction: t }),
      ]);
    })
  }
};
