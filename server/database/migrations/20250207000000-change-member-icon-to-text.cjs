'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // PostgreSQLの場合、BYTEAからTEXTへの変更
    await queryInterface.sequelize.query(`
      ALTER TABLE chiki_okoshi_members 
      ALTER COLUMN icon TYPE TEXT USING 
      CASE 
        WHEN icon IS NULL THEN NULL
        ELSE encode(icon, 'base64')
      END;
    `)
  },

  async down(queryInterface, Sequelize) {
    // TEXTからBYTEAへの変更（Base64文字列をデコード）
    await queryInterface.sequelize.query(`
      ALTER TABLE chiki_okoshi_members 
      ALTER COLUMN icon TYPE BYTEA USING 
      CASE 
        WHEN icon IS NULL THEN NULL
        WHEN icon LIKE 'http%' THEN NULL -- URLの場合はNULL（元に戻せない）
        ELSE decode(icon, 'base64')
      END;
    `)
  },
}

