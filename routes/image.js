import express from "express"

const userRouter = express.Router()

userRouter.post("/uploadImage", (req, res) => {
  let { userId, imageURL, title, description } = req.body
})

export default userRouter
