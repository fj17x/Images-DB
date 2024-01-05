import express from "express"
import verifyToken from "../middleware/verifyToken.js"
import * as userController from "../controllers/userController.js"
const userRouter = express.Router()

// GET method to get a batch of users.
userRouter.get("/", verifyToken, userController.fetchBatchOfUsers)

// GET method to get fetch a user. (Uses regex to only get numbers.)
userRouter.get("/:userId(\\d+)", verifyToken, userController.getUserById)

// PUT method to get update a user. (Uses regex to only get numbers.)
userRouter.put("/:userId(\\d+)", verifyToken, userController.updateUserById)

// PATCH method to get update a user. (Uses regex to only get numbers.)
userRouter.patch("/:userId(\\d+)", verifyToken, userController.updateUserById)

// POST method to get create a user.
userRouter.post("/", verifyToken, userController.createUser)

// DELETE method to get delete a user. (Uses regex to only get numbers.)
userRouter.delete("/:userId(\\d+)", verifyToken, userController.deleteUserById)

export default userRouter
