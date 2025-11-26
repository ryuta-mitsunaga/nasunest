require('dotenv').config()
const pg = require('pg')

module.exports = {
  development: {
    username: process.env.DB_USER || process.env.MYSQL_USER || 'app_user',
    password:
      process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || 'app_password',
    database:
      process.env.DB_DATABASE || process.env.MYSQL_DATABASE || 'nasunest',
    host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '5432', 10),
    dialect: 'postgres',
    // CLI 実行時にも pg を明示的に使う
    dialectModule: pg,
    logging: console.log,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // ← PlanetScale では通常 false にする
      },
    },
  },
  production: {
    username: process.env.DB_USER || process.env.MYSQL_USER || 'app_user',
    password:
      process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || 'app_password',
    database:
      process.env.DB_DATABASE || process.env.MYSQL_DATABASE || 'nasunest',
    host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '5432', 10),
    dialect: 'postgres',
    // CLI 実行時にも pg を明示的に使う
    dialectModule: pg,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // ← PlanetScale では通常 false にする
      },
    },
  },
}
