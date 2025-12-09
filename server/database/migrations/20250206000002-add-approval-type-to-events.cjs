'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('events', 'approval_type', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: '参加承認の方式（0: 自動承認, 1: 手動承認, 2: 承認なし）',
      defaultValue: 0,
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('events', 'approval_type')
  },
}

