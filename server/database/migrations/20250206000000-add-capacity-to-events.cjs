'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('events', 'capacity', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: '定員（nullの場合は無制限）',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('events', 'capacity')
  },
}

