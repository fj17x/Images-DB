import User from "./user.js"
import Image from "./image.js"
import sequelize from "../config/connection.js"

const syncDatabase = async () => {
  try {
    User.hasMany(Image, { foreignKey: "ownerId", as: "images" })
    Image.belongsTo(User, { foreignKey: "ownerId", as: "owner" })
    await sequelize.sync()
    console.log("\x1b[35mDatabase synchronized successfully!\x1b[0m\x1b[32m")
  } catch (error) {
    console.error("Error synchronizing database:", error)
  }
}

await syncDatabase()
export { User, Image }
