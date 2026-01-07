'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('admins', 'isMaster', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'マスターユーザーフラグ（trueの場合、管理者管理が可能）',
    })

    // インデックスを追加（必要に応じて）
    await queryInterface.addIndex('admins', ['isMaster'], {
      name: 'idx_admins_is_master',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('admins', 'idx_admins_is_master')
    await queryInterface.removeColumn('admins', 'isMaster')
  },
}

