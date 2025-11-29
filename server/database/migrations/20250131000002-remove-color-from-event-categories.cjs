'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('event_categories', 'color')
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('event_categories', 'color', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'カテゴリの色（HEXコードなど）',
    })
  },
}

