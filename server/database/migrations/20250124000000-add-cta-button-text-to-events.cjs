'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('events', 'cta_button_text', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'CTAボタンのテキスト（デフォルト: 参加申し込み）',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('events', 'cta_button_text')
  },
}

