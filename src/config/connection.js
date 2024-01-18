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

export default sequelize
