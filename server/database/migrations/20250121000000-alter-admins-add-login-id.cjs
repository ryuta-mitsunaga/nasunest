'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    // formsテーブルが存在する場合は外部キー制約を削除
    const formsTableExists = await queryInterface
      .showAllTables()
      .then(tables => tables.includes('forms'))

    if (formsTableExists) {
      try {
        // 外部キー制約を削除
        const constraints = await queryInterface.showConstraint('forms')
        const fkConstraint = constraints.find(
          c =>
            c.constraintType === 'FOREIGN KEY' &&
            (c.constraintName.includes('admin') ||
              c.constraintName.includes('forms_ibfk'))
        )
        if (fkConstraint) {
          await queryInterface.removeConstraint(
            'forms',
            fkConstraint.constraintName
          )
        }
      } catch (e) {
        // 制約が存在しない場合は無視
        console.log('制約の削除をスキップ:', e.message)
      }
    }

    // adminsテーブルを削除
    await queryInterface.dropTable('admins').catch(() => {})

    // 新しい構造でadminsテーブルを作成
    await queryInterface.createTable('admins', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
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

    // formsテーブルのadmin_idをBIGINTに変更（存在する場合）
    if (formsTableExists) {
      // admin_idをBIGINTに変更
      await queryInterface
        .changeColumn('forms', 'admin_id', {
          type: Sequelize.BIGINT.UNSIGNED,
          allowNull: false,
        })
        .catch(() => {})

      // 外部キー制約を再追加
      await queryInterface
        .addConstraint('forms', {
          fields: ['admin_id'],
          type: 'foreign key',
          name: 'forms_ibfk_1',
          references: {
            table: 'admins',
            field: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        })
        .catch(() => {})
    }
  },

  async down(queryInterface, Sequelize) {
    // ロールバック処理（複雑なため、必要に応じて実装）
    throw new Error('ロールバックは手動で行ってください')
  },
}
