import express from "express"
import verifyToken from "../middleware/verifyToken.js"
import * as userController from "../controllers/userController.js"
const userRouter = express.Router()

// GET method to get a batch of users.
userRouter.get("/", verifyToken, userController.fetchBatchOfUsers)

// GET method to get fetch a user. (Uses regex to only get numbers.)
userRouter.get("/:userId(\\d+)", verifyToken, userController.getUserById)

export default userRouter
