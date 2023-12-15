import express from "express"
import * as authController from "../controllers/authController.js"

const authRouter = express.Router()

// POST method to register a new user. (Recieves JWT token)
authRouter.post("/register", authController.register)

// POST method to log in. (Recieves JWT token)
authRouter.post("/login", authController.login)

export default authRouter
