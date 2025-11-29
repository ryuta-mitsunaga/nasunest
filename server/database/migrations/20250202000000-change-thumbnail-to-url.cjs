'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // thumbnailカラムをBLOBからTEXT（URL用）に変更
    await queryInterface.changeColumn('events', 'thumbnail', {
      type: Sequelize.TEXT,
      allowNull: true,
    })
  },

  async down(queryInterface, Sequelize) {
    // ロールバック時はBLOBに戻す（ただし、既存のURLデータは失われる）
    await queryInterface.changeColumn('events', 'thumbnail', {
      type: Sequelize.BLOB,
      allowNull: true,
    })
  },
}

