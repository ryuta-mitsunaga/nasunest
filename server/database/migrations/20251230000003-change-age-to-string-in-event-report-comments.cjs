'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    // ageカラムをINTEGERからSTRINGに変更
    await queryInterface.changeColumn('event_report_comments', 'age', {
      type: Sequelize.STRING,
      allowNull: true,
    })
  },

  async down(queryInterface, Sequelize) {
    // 元に戻す（INTEGERに戻す）
    await queryInterface.changeColumn('event_report_comments', 'age', {
      type: Sequelize.INTEGER,
      allowNull: true,
    })
  },
}

