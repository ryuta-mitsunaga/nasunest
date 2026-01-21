'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('chiki_okoshi_members', 'homepage_url', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'ホームページのURL',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('chiki_okoshi_members', 'homepage_url')
  },
}

