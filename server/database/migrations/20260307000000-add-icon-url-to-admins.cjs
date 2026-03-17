'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('admins', 'icon_url', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Supabase Storageのアイコン画像URL',
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('admins', 'icon_url')
  },
}
