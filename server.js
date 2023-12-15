import express from "express"
import imageRouter from "./routes/image.js"
import userRouter from "./routes/user.js"

const app = express()
const PORT = 4000
app.use(express.json())
app.use(express.json())

app.use("/users", userRouter)
app.use("/images", imageRouter)

app.listen(PORT, () => {
  console.log(`App running on Port: ${PORT}`)
})
