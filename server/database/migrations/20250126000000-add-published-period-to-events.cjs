'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('events', 'published_start', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      comment: '公開開始日',
    })
    await queryInterface.addColumn('events', 'published_end', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      comment: '公開終了日',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('events', 'published_end')
    await queryInterface.removeColumn('events', 'published_start')
  },
}

