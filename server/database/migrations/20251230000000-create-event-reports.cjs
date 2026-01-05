'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('event_reports', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      event_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      admin_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'admins',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      thumbnail: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Supabase StorageのURL',
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Editor.jsで作成した本文（JSON形式）',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })

    // インデックスを追加
    await queryInterface.addIndex('event_reports', ['event_id'], {
      name: 'idx_event_reports_event_id',
    })
    await queryInterface.addIndex('event_reports', ['admin_id'], {
      name: 'idx_event_reports_admin_id',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('event_reports')
    await queryInterface.removeIndex(
      'event_reports',
      'idx_event_reports_event_id'
    )
    await queryInterface.removeIndex(
      'event_reports',
      'idx_event_reports_admin_id'
    )
  },
}
