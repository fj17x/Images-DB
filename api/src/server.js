import "dotenv/config"
import express from "express"
import cors from "cors"
import morgan from "morgan"
import imageRouter from "./routes/imageRoutes.js"
import authRouter from "./routes/authRoutes.js"
import userRouter from "./routes/userRoutes.js"
import meRouter from "./routes/meRoutes.js"

const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
}

const app = express()
const PORT = process.env.APP_PORT ?? 4000
app.use(express.json())
app.use(cors(corsOptions))
app.use(morgan("dev"))

app.use("/auth", authRouter)
app.use("/images", imageRouter)
app.use("/users", userRouter)
app.use("/me", meRouter)

app.listen(PORT, () => {
  console.info(`App running on Port: ${PORT}`)
})
