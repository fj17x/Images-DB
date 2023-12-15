import express from "express"
import fs from "fs/promises"
import Image from "../models/image.js"
import verifyToken from "../middleware/tokenAuth.js"

const userRouter = express.Router()

userRouter.post("/uploadImage", verifyToken, async (req, res) => {
  try {
    //Get metadata provided in JSON and JWT.
    let { imageURL, title, description, tags } = req.body
    const userId = req.userId

    if (!imageURL) {
      return res.status(400).json({
        error: "Please provide the imageURL.",
      })
    }

    if (!title) {
      return res.status(400).json({
        error: "Please provide a title.",
      })
    }

    //Get username of user using given ID.
    const allUsersJSON = await fs.readFile("db/users.json", "utf-8")
    const allUsersObject = JSON.parse(allUsersJSON)
    const user = allUsersObject.users.find((user) => user.id === userId)
    if (!user) {
      return res.status(400).json({
        error: "User doesnt exist.",
      })
    }
    const userName = user.username

    //Get current Image DB as an object.
    const allImagesJSON = await fs.readFile("db/images.json", "utf-8")
    const allImagesObject = JSON.parse(allImagesJSON)

    //Create new Image object.
    const newImageId = (allImagesObject.images?.length ?? 0) + 1
    const newImageObject = new Image(newImageId, imageURL, title, description, userId, userName, tags)

    //Push image into images object and write on JSON DB.
    allImagesObject.images.push(newImageObject)
    await fs.writeFile("db/images.json", JSON.stringify(allImagesObject, null, 2))
    res.status(200).json({ message: `Sucessfully uploaded image! Image Id is : ${newImageId}` })
  } catch (err) {
    console.log("Error while uploading", err)
    res.status(500).json({ error: "Failed to upload. Must provide url and title." })
  }
})

userRouter.post("/fetchImageById", verifyToken, async (req, res) => {
  try {
    //Get ID of image needed to be searched for.
    const { imageId } = req.body
    const userId = req.userId
    if (!imageId) {
      return res.status(400).json({ error: "Please provide imageId." })
    }

    //Get the JSON DB for images as an object.
    const allImagesJSON = await fs.readFile("db/images.json", "utf-8")
    const allImagesObject = JSON.parse(allImagesJSON)

    //Search for the image and check whether user has permission to access it.
    const foundImage = allImagesObject.images.find((image) => image.id === imageId)
    if (!foundImage) {
      return res.status(404).json({ error: "Image not found." })
    }
    if (foundImage.ownerId !== userId) {
      return res.status(401).json({ error: "You can only access images you have uploaded." })
    }

    //Return details of image.
    res.status(200).json({ ...foundImage })
  } catch (err) {
    console.log("Error while fetching.", err)
    res.status(500).json({ error: "Failed to fetch." })
  }
})

export default userRouter
