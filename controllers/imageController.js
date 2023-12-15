import fs from "fs/promises"
import Image from "../models/image.js"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const imagesFilePath = path.join(__dirname, "..", "db", "images.json")
const usersFilePath = path.join(__dirname, "..", "db", "users.json")

const createImage = async (req, res) => {
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
    const allUsersJSON = await fs.readFile(usersFilePath, "utf-8")
    const allUsersObject = JSON.parse(allUsersJSON)
    console.log("allUsersObject: ", allUsersObject)
    const user = allUsersObject.users.find((user) => user.id === userId)
    if (!user) {
      return res.status(404).json({
        error: "User doesnt exist.",
      })
    }
    const userName = user.username

    //Get current Image DB as an object.
    const allImagesJSON = await fs.readFile(imagesFilePath, "utf-8")
    const allImagesObject = JSON.parse(allImagesJSON)

    //Create new Image object.
    const newImageId = (allImagesObject.images?.length ?? 0) + 1
    const newImageObject = new Image(newImageId, imageURL, title, description, userId, userName, tags)

    //Push image into images object and write on JSON DB.
    allImagesObject.images.push(newImageObject)
    await fs.writeFile("db/images.json", JSON.stringify(allImagesObject, null, 2))
    res.status(201).json({ message: `Sucessfully uploaded image! Image Id is : ${newImageId}` })
  } catch (err) {
    console.log("Error during uploading: ", err)
    res.status(500).json({ error: "Failed to upload. Must provide url and title." })
  }
}

const getImageById = async (req, res) => {
  try {
    //Get ID of image needed to be searched for.
    let { imageId } = req.params
    imageId = Number(imageId)
    const userId = req.userId
    const isAdmin = req.isAdmin
    if (!imageId) {
      return res.status(400).json({ error: "Please provide imageId." })
    }

    //Get current JSON DB images as an object.
    const allImagesJSON = await fs.readFile(imagesFilePath, "utf-8")
    const allImagesObject = JSON.parse(allImagesJSON)
    console.log("allImagesObject: ", allImagesObject)

    //Search for the image and check whether user has permission to access it.
    const foundImage = allImagesObject.images.find((image) => image.id === imageId)
    if (!foundImage) {
      return res.status(404).json({ error: "Image not found." })
    }
    if (foundImage.isFlagged) {
      return res.status(400).json({ error: "This image has been flagged by the admin and cannot be accessed." })
    }
    if (!isAdmin && foundImage.ownerId !== userId) {
      return res.status(403).json({ error: "You can only access images you have uploaded." })
    }

    //Return details of image.
    res.status(200).json({ ...foundImage })
  } catch (err) {
    console.log("Error while fetching.", err)
    res.status(500).json({ error: "Failed to fetch." })
  }
}

const getBatchOfImages = async (req, res) => {
  try {
    //Get limit and offset and calculate start and end index.
    let { limit = 10, offset = 0 } = req.query
    const userId = req.userId
    const isAdmin = req.isAdmin
    limit = Number(limit)
    offset = Number(offset)

    //Get current JSON DB images as an object.
    const allImagesJSON = await fs.readFile(imagesFilePath, "utf-8")
    const allImagesObject = JSON.parse(allImagesJSON)

    //Calculate start and end
    const startIndex = offset
    const endIndex = startIndex + limit

    let userImages = allImagesObject.images.filter((image) => !image.isFlagged && (req.isAdmin || image.ownerId === userId))

    const batchOfUserImages = userImages.slice(startIndex, endIndex)
    if (!batchOfUserImages.length) {
      if (!isAdmin) {
        return res.status(404).json({ error: `No images found for user with ID: ${userId} ` })
      }
      return res.status(404).json({ error: "No images found. " })
    }
    res.status(200).json({ images: batchOfUserImages })
  } catch (err) {
    console.error("Error during fetching of images.: ", err)
    res.status(500).json({ error: "Failed to fetch images." })
  }
}

const updateDescription = async (req, res) => {
  try {
    //Get the ID of the image to update along with description.
    const { description } = req.body
    let { imageId } = req.params
    const isAdmin = req.isAdmin
    imageId = Number(imageId)
    const userId = req.userId
    if (!imageId) {
      return res.status(400).json({ error: "Please provide imageId." })
    }
    if (!description) {
      return res.status(400).json({ error: "Please provide description." })
    }

    //Fetch all the images from JSON DB as JS object.
    const allImagesJSON = await fs.readFile(imagesFilePath, "utf-8")
    const allImagesObject = JSON.parse(allImagesJSON)

    //Find image and verify whether user has permissions to modify it.
    const foundImage = allImagesObject.images.find((image) => image.id === imageId)
    if (!foundImage) {
      return res.status(404).json({ error: "Please provide a valid imageId." })
    }
    if (foundImage.isFlagged) {
      return res.status(400).json({ error: "This image has been flagged by the admin and cannot be accessed." })
    }
    if (!isAdmin && foundImage.ownerId !== userId) {
      return res.status(401).json({
        error: `You can only modify images you have uploaded. This image was uploaded by user id: ${foundImage.ownerId}`,
      })
    }

    //Update description and update JSON DB. (Will update as objects are referenced by memory address.)
    foundImage.description = description
    await fs.writeFile(imagesFilePath, JSON.stringify(allImagesObject, null, 2))
    res.status(200).json({ message: "Image description updated successfully." })
  } catch (err) {
    console.log("Failed to update the description: ", err)
    res.status(500).json({ error: "Failed to update image description." })
  }
}

const updateTags = async (req, res) => {
  try {
    //Get tags from request
    const { tags } = req.body
    let { imageId } = req.params
    imageId = Number(imageId)
    const userId = req.userId
    if (!imageId) {
      return res.status(400).json({ error: "Please provide imageId." })
    }
    if (!tags) {
      return res.status(400).json({ error: "Please provide description." })
    }
    if (!Array.isArray(tags)) {
      return res.status(400).json({ error: "Please provide tags as an array." })
    }

    //Get current JSON DB images as an object.
    const allImagesJSON = await fs.readFile(imagesFilePath, "utf-8")
    const allImagesObject = JSON.parse(allImagesJSON)

    //Find image and verify whether user has permissions to modify it.
    const foundImage = allImagesObject.images.find((image) => image.id === imageId)
    if (!foundImage) {
      return res.status(404).json({ error: "Image not found." })
    }
    if (foundImage.isFlagged) {
      return res.status(400).json({ error: "This image has been flagged by the admin and cannot be accessed." })
    }
    if (foundImage.ownerId !== userId) {
      return res.status(403).json({ error: "Unauthorized to update tags for this image." })
    }

    //Update the tags in the image and update JSON DB.
    foundImage.tags.push(...tags)
    await fs.writeFile(imagesFilePath, JSON.stringify(allImagesObject, null, 2))
    res.status(200).json({ message: "Tags added successfully." })
  } catch (err) {
    console.error("Error during adding tags: ", err)
    res.status(500).json({ error: "Failed to add tags to image." })
  }
}

const flagImage = async (req, res) => {
  try {
    //Get id of image needed to be flagged.
    let { imageId } = req.params
    imageId = Number(imageId)
    if (!req.isAdmin) {
      return res.status(403).json({
        error: "Only admins can access this!",
      })
    }

    //Fetch all the images from JSON DB as JS object.
    const allImagesJSON = await fs.readFile(imagesFilePath, "utf-8")
    const allImagesObject = JSON.parse(allImagesJSON)

    //Find image and verify whether user has permissions to modify it.
    const foundImage = allImagesObject.images.find((image) => image.id === imageId)
    if (!foundImage) {
      return res.status(404).json({ error: "Please provide a valid imageId." })
    }
    if (foundImage.isFlagged) {
      return res.status(400).json({ error: "This image has already been flagged!" })
    }

    //Update description and update JSON DB. (Will update as objects are referenced by memory address.)
    foundImage.isFlagged = true
    await fs.writeFile(imagesFilePath, JSON.stringify(allImagesObject, null, 2))
    res.status(200).json({ message: "Image flagged successfully." })
  } catch (err) {
    console.error("Error during flagging: ", err)
    res.status(500).json({ error: "Failed to flag image." })
  }
}

const getImagesByCommonTags = async (req, res) => {
  try {
    //Get tags, userId and check whether user is admin.
    const { tags } = req.query
    const userId = req.userId
    const isAdmin = req.isAdmin

    if (!tags) {
      return res.status(400).json({ error: "Please provide tags for filtering." })
    }

    //Filter images based on tags.
    const tagList = tags.split(",")
    const allImagesJSON = await fs.readFile(imagesFilePath, "utf-8")
    const allImagesObject = JSON.parse(allImagesJSON)
    const filteredImages = allImagesObject.images.filter((image) => {
      if (!image.isFlagged && tagList.every((tag) => image.tags.includes(tag))) {
        if (isAdmin || image.ownerId === userId) {
          return true
        }
      }
      return false
    })

    if (!filteredImages.length) {
      return res.status(404).json({ error: "No images found with given tags." })
    }

    res.status(200).json({ images: filteredImages })
  } catch (err) {
    console.error("Error while fetching images by common tags: ", err)
    res.status(500).json({ error: "Failed to fetch images by these common tags." })
  }
}

export { createImage, getImageById, getBatchOfImages, updateDescription, updateTags, flagImage, getImagesByCommonTags }
