import { Sequelize } from "sequelize"
import "dotenv/config"

const connectionURI =
  "postgres://" +
  process.env.DB_USERNAME +
  ":" +
  process.env.DB_PASSWORD +
  "@" +
  process.env.DB_HOST +
  ":" +
  process.env.DB_PORT +
  "/" +
  process.env.DB_NAME

const sequelize = new Sequelize(connectionURI)

const makeConnection = async () => {
  try {
    await sequelize.authenticate()
    console.log("Application successfully connected to database!")
  } catch (error) {
    console.log("Failed to connect to db!", error)
  }
}

makeConnection()

export default sequelize
