'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('event_report_comments', {
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
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      age: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sex: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      area: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: false,
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
    await queryInterface.addIndex('event_report_comments', ['event_id'], {
      name: 'idx_event_report_comments_event_id',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      'event_report_comments',
      'idx_event_report_comments_event_id'
    )
    await queryInterface.dropTable('event_report_comments')
  },
}
