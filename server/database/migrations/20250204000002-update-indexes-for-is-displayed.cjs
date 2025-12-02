'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 古いインデックスを削除（存在する場合）
    try {
      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS idx_events_published_composite'
      )
    } catch (e) {
      // エラーは無視
    }
    try {
      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS idx_events_is_published'
      )
    } catch (e) {
      // エラーは無視
    }

    // 新しいカラム名でインデックスを再作成（存在しない場合のみ）
    try {
      await queryInterface.sequelize.query(
        'CREATE INDEX IF NOT EXISTS idx_events_is_displayed ON events(is_displayed)'
      )
    } catch (e) {
      // エラーは無視
    }

    try {
      await queryInterface.sequelize.query(
        'CREATE INDEX IF NOT EXISTS idx_events_displayed_composite ON events(is_displayed, published_start, published_end, start_date)'
      )
    } catch (e) {
      // エラーは無視
    }
  },

  async down(queryInterface, Sequelize) {
    // 新しいインデックスを削除
    try {
      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS idx_events_displayed_composite'
      )
    } catch (e) {
      // エラーは無視
    }
    try {
      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS idx_events_is_displayed'
      )
    } catch (e) {
      // エラーは無視
    }

    // 元のインデックスを再作成
    try {
      await queryInterface.sequelize.query(
        'CREATE INDEX IF NOT EXISTS idx_events_is_published ON events(is_published)'
      )
    } catch (e) {
      // エラーは無視
    }

    try {
      await queryInterface.sequelize.query(
        'CREATE INDEX IF NOT EXISTS idx_events_published_composite ON events(is_published, published_start, published_end, start_date)'
      )
    } catch (e) {
      // エラーは無視
    }
  },
}

