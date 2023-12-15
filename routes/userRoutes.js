import express from "express"
import verifyToken from "../middleware/verifyToken.js"
import * as userController from "../controllers/imageController.js"
const userRouter = express.Router()

// POST method to upload an image URL.
userRouter.post("/", verifyToken, userController.createImage)

// GET method to get fetch an image using ID.
userRouter.get("/:userId(\\d+)", verifyToken, userController.getImageById)

export default userRouter
