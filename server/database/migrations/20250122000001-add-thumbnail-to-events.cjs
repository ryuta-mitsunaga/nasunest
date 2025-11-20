'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('events', 'thumbnail', {
      type: Sequelize.BLOB('long'),
      allowNull: true,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('events', 'thumbnail')
  },
}

