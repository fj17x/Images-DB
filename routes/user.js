import express from "express"
import * as userController from "../controllers/userController.js"

const userRouter = express.Router()

// POST method to register a new user.
userRouter.post("/", userController.register)

// POST method to log in.
userRouter.post("/login", userController.login)

export default userRouter
