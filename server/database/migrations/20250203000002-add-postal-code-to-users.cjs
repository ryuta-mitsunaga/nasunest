'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'postal_code', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: '郵便番号',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'postal_code')
  },
}

