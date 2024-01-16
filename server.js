import express from "express"
import imageRouter from "./routes/imageRoutes.js"
import authRouter from "./routes/authRoutes.js"
import userRouter from "./routes/userRoutes.js"
import meRouter from "./routes/meRoutes.js"
import sequelize from "./db/connection.js"
import User from "./models/User.js"
import Image from "./models/Image.js"

const app = express()
const PORT = 4000
app.use(express.json())

User.hasMany(Image, { foreignKey: "ownerId", as: "images" })
Image.belongsTo(User, { foreignKey: "ownerId", as: "owner" })
sequelize.sync()

app.use("/auth", authRouter)
app.use("/images", imageRouter)
app.use("/users", userRouter)
app.use("/me", meRouter)

app.listen(PORT, () => {
  console.log(`App running on Port: ${PORT}`)
})
