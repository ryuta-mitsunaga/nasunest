'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('events', 'form_link', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment:
        '外部フォームURL（NasuNestフォームではなく外部リンクを使う場合）',
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('events', 'form_link')
  },
}

