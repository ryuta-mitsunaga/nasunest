'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pickup_events', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      event_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      pickup_datetime_start: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'ピックアップ開始日時',
      },
      pickup_datetime_end: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'ピックアップ終了日時',
      },
      left_text: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'CTAボタン左側に表示するテキスト',
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pickup_events')
  },
}

