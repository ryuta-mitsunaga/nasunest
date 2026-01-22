'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // formsテーブルのpublished_startとpublished_endをDATEONLYからDATEに変更
    await queryInterface.changeColumn('forms', 'published_start', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: '公開開始日時',
    })
    await queryInterface.changeColumn('forms', 'published_end', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: '公開終了日時',
    })

    // eventsテーブルのstart_date、end_date、published_start、published_endをDATEONLYからDATEに変更
    await queryInterface.changeColumn('events', 'start_date', {
      type: Sequelize.DATE,
      allowNull: false,
    })
    await queryInterface.changeColumn('events', 'end_date', {
      type: Sequelize.DATE,
      allowNull: true,
    })
    await queryInterface.changeColumn('events', 'published_start', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: '公開開始日時',
    })
    await queryInterface.changeColumn('events', 'published_end', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: '公開終了日時',
    })
  },

  async down(queryInterface, Sequelize) {
    // ロールバック: DATEからDATEONLYに戻す
    await queryInterface.changeColumn('forms', 'published_start', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      comment: '公開開始日',
    })
    await queryInterface.changeColumn('forms', 'published_end', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      comment: '公開終了日',
    })

    await queryInterface.changeColumn('events', 'start_date', {
      type: Sequelize.DATEONLY,
      allowNull: false,
    })
    await queryInterface.changeColumn('events', 'end_date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    })
    await queryInterface.changeColumn('events', 'published_start', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      comment: '公開開始日',
    })
    await queryInterface.changeColumn('events', 'published_end', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      comment: '公開終了日',
    })
  },
}
