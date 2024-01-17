import express from "express"
import verifyToken from "../middleware/verifyToken.js"
import * as meController from "../controllers/meController.js"
const meRouter = express.Router()

//Routes for user to view, modify and delete their details.
meRouter.get("/", verifyToken, meController.getCurrentUserDetails)
meRouter.patch("/", verifyToken, meController.updateCurrentUserDetails)
meRouter.delete("/", verifyToken, meController.deleteCurrentUser)

export default meRouter
