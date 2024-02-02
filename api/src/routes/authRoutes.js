import express from "express"
import * as authController from "../controllers/authController.js"
import checkDB from "../middleware/checkDB.js"

const authRouter = express.Router()
authRouter.use(checkDB)

// POST method to register a new user. (Gives a JWT token)
authRouter.post("/register", authController.register)

// POST method to log in via userName and password. (Gives a JWT token)
authRouter.post("/signin", authController.login)

// GET method to log out. (Clears client cookie)
authRouter.get("/logout", authController.logout)

export default authRouter
