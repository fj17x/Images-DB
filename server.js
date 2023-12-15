import express from "express"
import imageRouter from "./routes/image.js"
import authRouter from "./routes/auth.js"

const app = express()
const PORT = 4000
app.use(express.json())

app.use("/auth", authRouter)
app.use("/images", imageRouter)

app.listen(PORT, () => {
  console.log(`App running on Port: ${PORT}`)
})
