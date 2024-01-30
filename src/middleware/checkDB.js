import sequelize from "../config/connection.js"

const checkDB = async (req, res, next) => {
  try {
    await sequelize.authenticate()
    console.info("Application successfully connected to database!")
    next()
  } catch (err) {
    console.error("Error verifying token.", err)
    return res.status(500).json({ error: "Something went wrong!" })
  }
}

export default checkDB
