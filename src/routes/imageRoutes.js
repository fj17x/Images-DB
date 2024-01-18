import express from "express"
import verifyToken from "../middleware/verifyToken.js"
import * as imageController from "../controllers/imageController.js"
const imageRouter = express.Router()

// POST method to upload an image URL.
imageRouter.post("/", verifyToken, imageController.createImage)

// GET method to get fetch an image using its ID. (Uses Regex)
imageRouter.get("/:imageId(\\d+)", verifyToken, imageController.getImageById)

// DELETE method to delete an image using its ID. (Uses Regex)
imageRouter.delete("/:imageId(\\d+)", verifyToken, imageController.deleteImageById)

// GET method to fetch batch of images.
imageRouter.get("/", verifyToken, imageController.getBatchOfImages)

// PATCH method to update an image.
imageRouter.patch("/:imageId(\\d+)", verifyToken, imageController.partiallyUpdateImage)

// PUT method to update an image.
imageRouter.put("/:imageId(\\d+)", verifyToken, imageController.updateImage)

export default imageRouter
