import User from "./user.js"
import Image from "./image.js"
import sequelize from "../config/connection.js"

User.hasMany(Image, { foreignKey: "ownerId", as: "images" })
Image.belongsTo(User, { foreignKey: "ownerId", as: "owner" })
sequelize.sync()

export { User, Image }
