'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'name_sei', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: '性',
    })

    await queryInterface.addColumn('users', 'name_mei', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: '名',
    })

    await queryInterface.addColumn('users', 'display_name', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: '表示名',
    })

    await queryInterface.addColumn('users', 'age', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: '年齢',
    })

    await queryInterface.addColumn('users', 'address', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: '住所',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'name_sei')
    await queryInterface.removeColumn('users', 'name_mei')
    await queryInterface.removeColumn('users', 'display_name')
    await queryInterface.removeColumn('users', 'age')
    await queryInterface.removeColumn('users', 'address')
  },
}

