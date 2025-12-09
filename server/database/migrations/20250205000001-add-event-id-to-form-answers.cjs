'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('form_answers', 'event_id', {
      type: Sequelize.BIGINT,
      allowNull: true,
      comment: 'イベントID（イベント経由で回答した場合）',
      references: {
        model: 'events',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })

    // インデックスを追加（イベントごとの回答取得を高速化）
    await queryInterface.addIndex('form_answers', ['event_id'], {
      name: 'form_answers_event_id_idx',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('form_answers', 'form_answers_event_id_idx')
    await queryInterface.removeColumn('form_answers', 'event_id')
  },
}

