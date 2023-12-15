import express from "express"
import verifyToken from "../middleware/tokenAuth.js"
import * as imageController from "../controllers/imageController.js"
import onlyAdmin from "../middleware/onlyAdmin.js"
const imageRouter = express.Router()

// POST method to upload an image URL.
imageRouter.post("/", verifyToken, imageController.createImage)

// GET method to get fetch an image using ID.
imageRouter.get("/:imageId", verifyToken, imageController.getImageById)

// GET method to fetch batch of images.
imageRouter.get("/", verifyToken, imageController.fetchBatchOfImages)

// PATCH method to update the description of an image.
imageRouter.patch("/:imageId/description", verifyToken, imageController.updateDescription)

// PATCH method to update the tags of an image.
imageRouter.patch("/:imageId/tags", verifyToken, imageController.updateTags)

// PATCH method to flag an image, only accessible by the admin.
imageRouter.patch("/flag/:imageId", verifyToken, onlyAdmin, imageController.flagImage)

export default imageRouter
