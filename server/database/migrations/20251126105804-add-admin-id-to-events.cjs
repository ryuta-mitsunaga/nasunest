'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    // 既存のイベントデータがあるかチェック
    const [results] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM events'
    )
    const eventCount = results[0]?.count || 0

    // 最初のadmin_idを取得（既存データがある場合に使用）
    let defaultAdminId = 1
    if (eventCount > 0) {
      const [adminResults] = await queryInterface.sequelize.query(
        'SELECT id FROM admins LIMIT 1'
      )
      if (adminResults && adminResults.length > 0) {
        defaultAdminId = adminResults[0].id
      }
    }

    // admin_idカラムを追加（一時的にallowNull: true, defaultValue: 1で追加）
    await queryInterface.addColumn('events', 'admin_id', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
      defaultValue: defaultAdminId,
    })

    // 既存データがある場合、デフォルトのadmin_idを設定
    if (eventCount > 0) {
      await queryInterface.sequelize.query(
        `UPDATE events SET admin_id = ${defaultAdminId} WHERE admin_id IS NULL`
      )
    }

    // 外部キー制約を追加
    await queryInterface.addConstraint('events', {
      fields: ['admin_id'],
      type: 'foreign key',
      name: 'events_admin_id_fk',
      references: {
        table: 'admins',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    })

    // allowNull: falseに変更（デフォルト値は既に設定済み）
    await queryInterface.changeColumn('events', 'admin_id', {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: false,
    })
  },

  async down(queryInterface, Sequelize) {
    // 外部キー制約を削除
    await queryInterface.removeConstraint('events', 'events_admin_id_fk')
    // カラムを削除
    await queryInterface.removeColumn('events', 'admin_id')
  },
}

