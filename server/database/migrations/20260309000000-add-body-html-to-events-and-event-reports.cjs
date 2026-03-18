'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('events', 'body_html', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: '本文のHTML表示用（SSR用）',
    })
    await queryInterface.addColumn('event_reports', 'body_html', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: '本文のHTML表示用（SSR用）',
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('events', 'body_html')
    await queryInterface.removeColumn('event_reports', 'body_html')
  },
}
