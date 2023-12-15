import express from "express"
import verifyToken from "../middleware/verifyToken.js"
import * as imageController from "../controllers/imageController.js"
const imageRouter = express.Router()

// POST method to upload an image URL.
imageRouter.post("/", verifyToken, imageController.createImage)

// GET method to get fetch an image using ID. (Uses Regex)
imageRouter.get("/:imageId(\\d+)", verifyToken, imageController.getImageById)

// GET method to fetch batch of images.
imageRouter.get("/", verifyToken, imageController.getBatchOfImages)

// GET method to fetch images with common tags.
imageRouter.get("/common-tags", verifyToken, imageController.getImagesByCommonTags)

// PATCH method to update the description of an image.
imageRouter.patch("/:imageId/description", verifyToken, imageController.updateDescription)

// PATCH method to update the tags of an image.
imageRouter.patch("/:imageId/tags", verifyToken, imageController.updateTags)

// PATCH method to flag an image, only accessible by the admin. (Uses Regex)
imageRouter.patch("/flag/:imageId(\\d+)", verifyToken, imageController.flagImage)

export default imageRouter
