'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('event_categories', 'description')
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('event_categories', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'カテゴリの説明',
    })
  },
}
