'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // カラムが存在するか確認
    const [results] = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'events' 
      AND column_name IN ('is_published', 'is_displayed')
      AND table_schema = 'public'
    `)

    const columns = results.map((r) => r.column_name)
    const hasIsPublished = columns.includes('is_published')
    const hasIsDisplayed = columns.includes('is_displayed')

    // 既存のインデックスを削除
    try {
      await queryInterface.sequelize.query('DROP INDEX IF EXISTS idx_events_published_composite')
    } catch (e) {
      // インデックスが存在しない場合は無視
    }
    try {
      await queryInterface.sequelize.query('DROP INDEX IF EXISTS idx_events_is_published')
    } catch (e) {
      // インデックスが存在しない場合は無視
    }

    // カラム名を変更（is_publishedが存在し、is_displayedが存在しない場合のみ）
    if (hasIsPublished && !hasIsDisplayed) {
      await queryInterface.renameColumn('events', 'is_published', 'is_displayed')
    } else if (!hasIsDisplayed) {
      // is_publishedもis_displayedも存在しない場合は新規作成
      await queryInterface.addColumn('events', 'is_displayed', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      })
    }
    // is_displayedが既に存在する場合は何もしない

    // 新しいカラム名でインデックスを再作成
    try {
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_events_is_displayed ON events(is_displayed)')
    } catch (e) {
      // エラーは無視
    }

    try {
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_events_displayed_composite ON events(is_displayed, published_start, published_end, start_date)')
    } catch (e) {
      // エラーは無視
    }
  },

  async down(queryInterface, Sequelize) {
    // 新しいインデックスを削除
    try {
      await queryInterface.sequelize.query('DROP INDEX IF EXISTS idx_events_displayed_composite')
    } catch (e) {
      // インデックスが存在しない場合は無視
    }
    try {
      await queryInterface.sequelize.query('DROP INDEX IF EXISTS idx_events_is_displayed')
    } catch (e) {
      // インデックスが存在しない場合は無視
    }

    // カラム名を元に戻す
    const [results] = await queryInterface.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'events' 
      AND column_name = 'is_displayed'
      AND table_schema = 'public'
    `)

    if (results.length > 0) {
      await queryInterface.renameColumn('events', 'is_displayed', 'is_published')
    }

    // 元のインデックスを再作成
    try {
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_events_is_published ON events(is_published)')
    } catch (e) {
      // エラーは無視
    }

    try {
      await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS idx_events_published_composite ON events(is_published, published_start, published_end, start_date)')
    } catch (e) {
      // エラーは無視
    }
  },
}

