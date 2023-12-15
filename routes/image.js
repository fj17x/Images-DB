import express from "express"
import verifyToken from "../middleware/tokenAuth.js"
import * as imageController from "../controllers/imageController.js"
const userRouter = express.Router()

// POST method to upload an image URL.
userRouter.post("/", verifyToken, imageController.createImage)

// GET method to get fetch an image using ID.
userRouter.get("/:imageId", verifyToken, imageController.getImageById)

// GET method to fetch batch of images.
userRouter.get("/", verifyToken, imageController.fetchBatchOfImages)

// PUT method to update the description of an image.
userRouter.put("/:imageId/description", verifyToken, imageController.updateDescription)

// PUT method to update the tags of an image.
userRouter.put("/:imageId/tags", verifyToken, imageController.updateTags)

export default userRouter
