import "dotenv/config"
import sequelize from "../config/connection.js"

const checkDB = async (req, res, next) => {
  try {
    await sequelize.authenticate()
    console.log("Application successfully connected to database!")
    next()
  } catch (err) {
    console.log("Error verifying token.", err)
    return res.status(500).json({ error: "Database is down!" })
  }
}

export default checkDB
