'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('form_answers', 'is_cancel', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'キャンセルフラグ（true: キャンセル済み）',
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('form_answers', 'is_cancel')
  },
}


