import "dotenv/config"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import * as OpenApiValidator from "express-openapi-validator"
import imageRouter from "./routes/imageRoutes.js"
import authRouter from "./routes/authRoutes.js"
import userRouter from "./routes/userRoutes.js"
import meRouter from "./routes/meRoutes.js"

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:3200"],
  optionsSuccessStatus: 200,
  credentials: true,
}

const app = express()
const PORT = process.env.APP_PORT ?? 4000
const apiSpec = "./openapi-spec.yaml"

app.use(express.json())
app.use(cookieParser())
app.use(cors(corsOptions))

app.use(OpenApiValidator.middleware({ apiSpec }))

app.use(`/${process.env.API_VERSION}/auth`, authRouter)
app.use(`/${process.env.API_VERSION}/images`, imageRouter)
app.use(`/${process.env.API_VERSION}/users`, userRouter)
app.use(`/${process.env.API_VERSION}/me`, meRouter)

app.listen(PORT, () => {
  console.info(`App running on Port: ${PORT}`)
})
