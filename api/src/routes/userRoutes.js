import express from "express"
import verifyToken from "../middleware/verifyToken.js"
import checkDB from "../middleware/checkDB.js"
import * as userController from "../controllers/userController.js"
const userRouter = express.Router()

userRouter.use(checkDB)
userRouter.use(verifyToken)

// GET method to get a batch of users.
userRouter.get("/", userController.fetchBatchOfUsers)

// GET method to get fetch a user. (Uses regex to only get numbers.)
userRouter.get("/:userId(\\d+)", userController.getUserById)

// PUT method to get update a user. (Uses regex to only get numbers.)
userRouter.put("/:userId(\\d+)", userController.updateUserById)

// PATCH method to get update a user. (Uses regex to only get numbers.)
userRouter.patch("/:userId(\\d+)", userController.partiallyUpdateUserById)

// POST method to get create a user.
userRouter.post("/", userController.createUser)

// DELETE method to get delete a user. (Uses regex to only get numbers.)
userRouter.delete("/:userId(\\d+)", userController.deleteUserById)

export default userRouter
