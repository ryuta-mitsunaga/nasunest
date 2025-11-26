require('dotenv').config()

module.exports = {
  development: {
    username: process.env.MYSQL_USER || 'app_user',
    password: process.env.MYSQL_PASSWORD || 'app_password',
    database: process.env.MYSQL_DATABASE || 'nasunest',
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    dialect: 'mysql',
    logging: console.log,
  },
  production: {
    username: process.env.MYSQL_USER || 'app_user',
    password: process.env.MYSQL_PASSWORD || 'app_password',
    database: process.env.MYSQL_DATABASE || 'nasunest',
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    dialect: 'mysql',
    logging: false,
  },
}
