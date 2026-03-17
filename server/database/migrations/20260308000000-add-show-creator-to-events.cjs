'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('events', 'show_creator', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'イベント作成者を表示するかどうか',
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('events', 'show_creator')
  },
}
