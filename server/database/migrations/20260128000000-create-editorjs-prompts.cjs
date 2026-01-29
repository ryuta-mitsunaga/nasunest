'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // デフォルトプロンプト用のマスタテーブル
    await queryInterface.createTable('editorjs_prompts_master', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'プロンプト名',
      },
      prompt: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'プロンプト内容',
      },
      display_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '表示順序',
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

    // カスタムプロンプト用のテーブル（adminと紐づけ）
    await queryInterface.createTable('editorjs_prompts_custom', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
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
        comment: '管理者ID',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'プロンプト名',
      },
      prompt: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'プロンプト内容',
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
    await queryInterface.addIndex('editorjs_prompts_master', ['display_order'], {
      name: 'idx_editorjs_prompts_master_display_order',
    })
    await queryInterface.addIndex('editorjs_prompts_custom', ['admin_id'], {
      name: 'idx_editorjs_prompts_custom_admin_id',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('editorjs_prompts_custom', 'idx_editorjs_prompts_custom_admin_id')
    await queryInterface.removeIndex('editorjs_prompts_master', 'idx_editorjs_prompts_master_display_order')
    await queryInterface.dropTable('editorjs_prompts_custom')
    await queryInterface.dropTable('editorjs_prompts_master')
  },
}
