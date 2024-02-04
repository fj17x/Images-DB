import express from "express"
import verifyToken from "../middleware/verifyToken.js"
import checkDB from "../middleware/checkDB.js"
import * as imageController from "../controllers/imageController.js"
const imageRouter = express.Router()

imageRouter.use(checkDB)
imageRouter.use(verifyToken)

// POST method to upload an image URL.
imageRouter.post("/", imageController.createImage)

// GET method to get fetch an image using its ID. (Uses Regex)
imageRouter.get("/:imageId(\\d+)", imageController.getImageById)

// DELETE method to delete an image using its ID. (Uses Regex)
imageRouter.delete("/:imageId(\\d+)", imageController.deleteImageById)

// DELETE method to delete all images.
imageRouter.delete("/", imageController.deleteAllOwnImages)

// GET method to fetch batch of images.
imageRouter.get("/", imageController.getBatchOfImages)

// PATCH method to update an image.
imageRouter.patch("/:imageId(\\d+)", imageController.partiallyUpdateImage)

// PUT method to update an image.
imageRouter.put("/:imageId(\\d+)", imageController.updateImage)

export default imageRouter
