'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('events', 'is_login_required', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'ログイン必須フラグ（true: ログイン必須, false: ログイン不要）',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('events', 'is_login_required')
  },
}

