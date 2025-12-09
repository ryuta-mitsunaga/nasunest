'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('form_answers', 'user_id', {
      type: Sequelize.BIGINT,
      allowNull: true,
      comment: 'ユーザーID（ログインしている場合）',
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('form_answers', 'user_id')
  },
}

