'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_send_logs', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      form_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'forms',
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
      recipient_email: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '送信先メールアドレス',
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'メール件名',
      },
      html: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'メール本文（HTML）',
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'メール本文（テキスト）',
      },
      status: {
        type: Sequelize.ENUM('success', 'failed'),
        allowNull: false,
        defaultValue: 'success',
        comment: '送信ステータス',
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'エラーメッセージ（失敗時）',
      },
      is_test: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'テスト配信フラグ',
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
    await queryInterface.addIndex('email_send_logs', ['form_id'])
    await queryInterface.addIndex('email_send_logs', ['admin_id'])
    await queryInterface.addIndex('email_send_logs', ['createdAt'])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('email_send_logs')
  },
}
