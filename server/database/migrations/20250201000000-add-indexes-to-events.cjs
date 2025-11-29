'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    // eventsテーブルのインデックス
    await queryInterface.addIndex('events', ['is_published'], {
      name: 'idx_events_is_published',
    })

    await queryInterface.addIndex('events', ['published_start'], {
      name: 'idx_events_published_start',
    })

    await queryInterface.addIndex('events', ['published_end'], {
      name: 'idx_events_published_end',
    })

    await queryInterface.addIndex('events', ['start_date'], {
      name: 'idx_events_start_date',
    })

    // 複合インデックス（公開フラグと公開期間）
    await queryInterface.addIndex(
      'events',
      ['is_published', 'published_start', 'published_end', 'start_date'],
      {
        name: 'idx_events_published_composite',
      }
    )

    // event_event_categoriesテーブルのインデックス
    await queryInterface.addIndex('event_event_categories', ['event_id'], {
      name: 'idx_event_event_categories_event_id',
    })

    await queryInterface.addIndex(
      'event_event_categories',
      ['event_category_id'],
      {
        name: 'idx_event_event_categories_category_id',
      }
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('events', 'idx_events_published_composite')
    await queryInterface.removeIndex('events', 'idx_events_start_date')
    await queryInterface.removeIndex('events', 'idx_events_published_end')
    await queryInterface.removeIndex('events', 'idx_events_published_start')
    await queryInterface.removeIndex('events', 'idx_events_is_published')
    await queryInterface.removeIndex(
      'event_event_categories',
      'idx_event_event_categories_category_id'
    )
    await queryInterface.removeIndex(
      'event_event_categories',
      'idx_event_event_categories_event_id'
    )
  },
}
