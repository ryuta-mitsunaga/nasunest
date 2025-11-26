'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('events', 'body', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Editor.jsで作成した本文（JSON形式）',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('events', 'body')
  },
}
