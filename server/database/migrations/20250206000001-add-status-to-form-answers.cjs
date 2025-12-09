'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('form_answers', 'status', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: '承認ステータス（0: 回答待ち, 1: OK, 2: NG）',
      defaultValue: 0,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('form_answers', 'status')
  },
}

