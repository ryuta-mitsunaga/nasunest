'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('admins', 'line_user_id', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'LINEユーザーID（LIFF連携用）',
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('admins', 'line_user_id')
  },
}


