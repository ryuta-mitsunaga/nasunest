'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('event_reports', 'comment_token', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
      comment: 'コメントフォーム用のトークン',
    })

    await queryInterface.addIndex('event_reports', ['comment_token'], {
      name: 'idx_event_reports_comment_token',
      unique: true,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      'event_reports',
      'idx_event_reports_comment_token'
    )
    await queryInterface.removeColumn('event_reports', 'comment_token')
  },
}

