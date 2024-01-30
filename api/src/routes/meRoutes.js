import express from "express"
import verifyToken from "../middleware/verifyToken.js"
import checkDB from "../middleware/checkDB.js"
import * as meController from "../controllers/meController.js"
const meRouter = express.Router()

meRouter.use(checkDB)
meRouter.use(verifyToken)

//Routes for user to view, modify and delete their details.
meRouter.get("/", meController.getCurrentUserDetails)
meRouter.patch("/", meController.updateCurrentUserDetails)
meRouter.delete("/", meController.deleteCurrentUser)

export default meRouter
