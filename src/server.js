import express from "express"
import "dotenv/config"
import imageRouter from "./routes/imageRoutes.js"
import authRouter from "./routes/authRoutes.js"
import userRouter from "./routes/userRoutes.js"
import meRouter from "./routes/meRoutes.js"

const app = express()
const PORT = process.env.APP_PORT
app.use(express.json())

app.use("/auth", authRouter)
app.use("/images", imageRouter)
app.use("/users", userRouter)
app.use("/me", meRouter)

app.listen(PORT, () => {
  console.log(`App running on Port: ${PORT}`)
})
