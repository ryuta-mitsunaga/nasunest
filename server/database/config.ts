import { Sequelize } from 'sequelize'

const dbName =
  process.env.DB_DATABASE || process.env.MYSQL_DATABASE || 'nasunest'
const dbUser = process.env.DB_USER || process.env.MYSQL_USER || 'app_user'
const dbPassword =
  process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || 'app_password'
const dbHost = process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost'
const dbPort = parseInt(
  process.env.DB_PORT || process.env.MYSQL_PORT || '5432',
  10
)

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // ← PlanetScale では通常 false にする
    },
  },
})

export const connectDB = async () => {
  try {
    await sequelize.authenticate()
    console.log('✅ Database connection has been established successfully.')
    return true
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error)
    return false
  }
}

export const syncDB = async (force: boolean = false) => {
  try {
    await sequelize.sync({ force })
    console.log('✅ Database synchronized successfully.')
    return true
  } catch (error) {
    console.error('❌ Unable to synchronize the database:', error)
    return false
  }
}
