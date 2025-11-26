'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('events', 'is_published', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '公開フラグ（true: 公開, false: 非公開）',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('events', 'is_published')
  },
}

