import express from "express"
import * as authController from "../controllers/authController.js"
import checkDB from "../middleware/checkDB.js"

const authRouter = express.Router()
authRouter.use(checkDB)

// POST method to register a new user. (Gives a JWT token)
authRouter.post("/register", authController.register)

// POST method to log in via userName and password. (Gives a JWT token)
authRouter.post("/login", authController.login)

export default authRouter
