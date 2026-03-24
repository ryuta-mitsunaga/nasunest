'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('line_official_accounts', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      line_user_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: 'LINE Messaging API の source.userId',
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: '連携したメールアドレス（任意）',
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'users.id への紐付け（任意）',
      },
      last_event_type: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: '直近の webhook イベント種別',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '友だち追加中か（unfollow で false）',
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

  async down(queryInterface) {
    await queryInterface.dropTable('line_official_accounts')
  },
}
