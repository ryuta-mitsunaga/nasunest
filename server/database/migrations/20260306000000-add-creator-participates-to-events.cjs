'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('events', 'creator_participates', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'イベント作成者も参加者に含める（true: +1する）',
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('events', 'creator_participates')
  },
}
