'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    // event_categoriesテーブル
    await queryInterface.createTable('event_categories', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'カテゴリ名',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'カテゴリの説明',
      },
      color: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'カテゴリの色（HEXコードなど）',
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

    // event_event_categoriesテーブル（多対多リレーション）
    await queryInterface.createTable('event_event_categories', {
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
      event_category_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'event_categories',
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
    await queryInterface.addConstraint('event_event_categories', {
      fields: ['event_id', 'event_category_id'],
      type: 'unique',
      name: 'unique_event_category',
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('event_event_categories')
    await queryInterface.dropTable('event_categories')
  },
}

