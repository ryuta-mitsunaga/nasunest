'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. admin_permissionsテーブル（権限マスタ）
    await queryInterface.createTable('admin_permissions', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        comment: '権限コード（例: member_management, form_management）',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '権限名（例: 協力隊管理, フォーム管理）',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '権限の説明',
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

    // 2. admin_admin_permissionsテーブル（リレーションテーブル）
    await queryInterface.createTable('admin_admin_permissions', {
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
      },
      admin_permission_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'admin_permissions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

    // 複合ユニーク制約
    await queryInterface.addIndex('admin_admin_permissions', ['admin_id', 'admin_permission_id'], {
      unique: true,
      name: 'admin_admin_permissions_unique',
    })

    // 初期データの投入（権限マスタ）
    await queryInterface.bulkInsert('admin_permissions', [
      {
        code: 'member_management',
        name: '協力隊管理',
        description: '協力隊員の管理が可能',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'form_management',
        name: 'フォーム管理',
        description: 'フォームの管理が可能',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'event_management',
        name: 'イベント管理',
        description: 'イベントの管理が可能',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'invitation_management',
        name: '管理者招待管理',
        description: '管理者の招待が可能',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        code: 'admin_management',
        name: '管理者管理',
        description: '管理者の管理が可能',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('admin_admin_permissions')
    await queryInterface.dropTable('admin_permissions')
  },
}

