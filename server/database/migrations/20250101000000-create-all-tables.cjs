'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. adminsテーブル（他のテーブルに依存しない）
    await queryInterface.createTable('admins', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      login_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'ハッシュ化されたパスワード',
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

    // 2. nasunest_membersテーブル（他のテーブルに依存しない）
    await queryInterface.createTable('chiki_okoshi_members', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name_sei: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      name_mei: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      mission: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      icon: {
        type: Sequelize.BLOB('long'),
        allowNull: true,
      },
      x_url: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'XのURL',
      },
      instagram_url: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'InstagramのURL',
      },
      facebook_url: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'FacebookのURL',
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

    // 3. formsテーブル（adminsに依存）
    await queryInterface.createTable('forms', {
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
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      content: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      published_start: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: '公開開始日',
      },
      published_end: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: '公開終了日',
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

    // 4. form_answersテーブル（formsに依存）
    await queryInterface.createTable('form_answers', {
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
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      content: {
        type: Sequelize.JSON,
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

    // 5. eventsテーブル（adminsとformsに依存）
    await queryInterface.createTable('events', {
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
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      form_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'forms',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Editor.jsで作成した本文（JSON形式）',
      },
      location_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      location_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      location_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      thumbnail: {
        type: Sequelize.BLOB('long'),
        allowNull: true,
      },
      cta_button_text: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'CTAボタンのテキスト（デフォルト: 参加申し込み）',
      },
      is_published: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '公開フラグ（true: 公開, false: 非公開）',
      },
      published_start: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: '公開開始日',
      },
      published_end: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: '公開終了日',
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
    // 依存関係を考慮して逆順に削除
    await queryInterface.dropTable('events')
    await queryInterface.dropTable('form_answers')
    await queryInterface.dropTable('forms')
    await queryInterface.dropTable('chiki_okoshi_members')
    await queryInterface.dropTable('admins')
  },
}
