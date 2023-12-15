import express from "express"
import imageRouter from "./routes/imageRoutes.js"
import authRouter from "./routes/authRoutes.js"

const app = express()
const PORT = 4000
app.use(express.json())

app.use("/auth", authRouter)
app.use("/images", imageRouter)
app.use("/users", imageRouter)

app.listen(PORT, () => {
  console.log(`App running on Port: ${PORT}`)
})
