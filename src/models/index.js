import User from "./user.js"
import Image from "./image.js"
import sequelize from "../config/connection.js"

const syncDatabase = async () => {
  try {
    User.hasMany(Image, { foreignKey: "ownerId", as: "images" })
    Image.belongsTo(User, { foreignKey: "ownerId", as: "owner" })
    await sequelize.sync({ alter: true })
    console.log("Database synchronized successfully")
  } catch (error) {
    console.error("Error synchronizing database:", error)
  }
}

syncDatabase()
export { User, Image }
