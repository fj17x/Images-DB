import fs from "fs/promises"
import Image from "../models/image.js"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const imagesFilePath = path.join(__dirname, "..", "db", "images.json")
const usersFilePath = path.join(__dirname, "..", "db", "users.json")

//Function to create HATEOS links.
const createImageLinks = (imageId, isAdmin) => {
  const links = [
    {
      rel: "self",
      method: "GET",
      href: `/images/${imageId}`,
      description: "Get details of this image",
    },
    {
      rel: "update_description",
      method: "PATCH",
      href: `/images/${imageId}/description`,
      description: "Update description of this image",
    },
    {
      rel: "update_tags",
      method: "PATCH",
      href: `/images/${imageId}/tags`,
      description: "Update tags of this image",
    },
    {
      rel: "all_images",
      method: "GET",
      href: "/images",
      description: "Get all images",
    },
  ]
  if (isAdmin) {
    links.push({
      rel: "flag_image",
      method: "PATCH",
      href: `/images/${imageId}/flag`,
      description: "Flag this image (Admin Only)",
    })
  }

  return links
}

const createImage = async (req, res) => {
  try {
    //Get metadata provided in JSON and JWT.
    let { imageURL, title, description, tags } = req.body
    const userId = req.userId
    const isAdmin = req.isAdmin

    if (!imageURL || typeof imageURL !== "string") {
      return res.status(400).json({
        error: "Please provide the imageURL and ensure the type is a string.",
      })
    }

    if (!title || typeof title !== "string") {
      return res.status(400).json({
        error: "Please provide a title and ensure the type is a string.",
      })
    }

    if (description && typeof description !== "string") {
      return res.status(400).json({
        error: "Description should be a string.",
      })
    }

    if (tags && !Array.isArray(tags)) {
      return res.status(400).json({
        error: "Tags should be provided as an array.",
      })
    }

    const userName = req.userName

    //Get current Image DB as an object.
    const allImagesJSON = await fs.readFile(imagesFilePath, "utf-8")
    const allImagesObject = JSON.parse(allImagesJSON)

    //Create new Image object.
    const newImageId = (allImagesObject.images?.length ?? 0) + 1
    const newImageObject = new Image(newImageId, imageURL, title, description, userId, userName, tags)

    //Push image into images object and write on JSON DB.
    allImagesObject.images.push(newImageObject)
    await fs.writeFile("db/images.json", JSON.stringify(allImagesObject, null, 2))

    const response = {
      message: `Sucessfully uploaded image! Image Id is : ${newImageId}`,
      links: createImageLinks(newImageId, isAdmin),
    }

    res.status(201).json(response)
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
    if (foundImage.isDeleted) {
      return res.status(403).json({ error: "This image has been deleted!" })
    }
    if (foundImage.isFlagged) {
      return res.status(403).json({ error: "This image has been flagged by the admin and cannot be accessed." })
    }
    if (!isAdmin && foundImage.ownerId !== userId) {
      return res.status(403).json({ error: "You can only access images you have uploaded." })
    }

    const response = {
      message: "Successfully found image!",
      data: { ...foundImage },
      links: createImageLinks(imageId, isAdmin),
    }
    //Return details of image.
    res.status(200).json(response)
  } catch (err) {
    console.log("Error while fetching.", err)
    res.status(500).json({ error: "Failed to fetch." })
  }
}

const getBatchOfImages = async (req, res) => {
  try {
    const userId = req.userId
    const isAdmin = req.isAdmin

    //Get limit and offset and calculate start and end index.
    let { limit = 10, offset = 0 } = req.query
    limit = Number(limit)
    offset = Number(offset)
    if (isNaN(limit) || isNaN(offset) || limit < 1 || offset < 0) {
      return res.status(400).json({
        error: "Limit should be >= 1, and offset should be >= 0.",
      })
    }
    const startIndex = offset
    const endIndex = startIndex + limit

    //Get current JSON DB images as an object.
    const allImagesJSON = await fs.readFile(imagesFilePath, "utf-8")
    const allImagesObject = JSON.parse(allImagesJSON)

    //Admin will be able to retrieve soft deleted images.
    let userImages = allImagesObject.images.filter(
      (image) => !image.isFlagged && (req.isAdmin || image.ownerId === userId) && !image.isDeleted
    )

    const batchOfUserImages = userImages.slice(startIndex, endIndex)
    if (!batchOfUserImages.length) {
      if (!isAdmin) {
        return res.status(404).json({ error: `No images found for user with ID: ${userId} ` })
      }
      return res.status(404).json({ error: "No images found. " })
    }

    // Generate links for each image in the batch
    const imageLinks = batchOfUserImages.map((image) => {
      return createImageLinks(image.id, isAdmin)
    })

    const imageData = batchOfUserImages.map((image) => {
      return { ...image }
    })

    const response = {
      message: `Successfully fetched ${batchOfUserImages.length} images!`,
      data: imageData,
      links: imageLinks,
    }

    res.status(200).json(response)
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
    if (!description || typeof description !== "string") {
      return res.status(400).json({ error: "Please provide description and make sure its a string." })
    }

    //Fetch all the images from JSON DB as JS object.
    const allImagesJSON = await fs.readFile(imagesFilePath, "utf-8")
    const allImagesObject = JSON.parse(allImagesJSON)

    //Find image and verify whether user has permissions to modify it.
    const foundImage = allImagesObject.images.find((image) => image.id === imageId)
    if (!foundImage) {
      return res.status(404).json({ error: "Please provide a valid imageId." })
    }
    if (foundImage.isDeleted) {
      return res.status(403).json({ error: "This image has been deleted!" })
    }
    if (foundImage.isFlagged) {
      return res.status(403).json({ error: "This image has been flagged by the admin and cannot be accessed." })
    }
    if (!isAdmin && foundImage.ownerId !== userId) {
      return res.status(403).json({
        error: `You can only modify images you have uploaded. This image was uploaded by user id: ${foundImage.ownerId}`,
      })
    }

    //Update description and update JSON DB. (Will update as objects are referenced by memory address.)
    foundImage.description = description
    await fs.writeFile(imagesFilePath, JSON.stringify(allImagesObject, null, 2))

    const response = {
      message: "Image description updated successfully.",
      links: createImageLinks(imageId, isAdmin),
    }

    res.status(200).json(response)
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
    const isAdmin = req.isAdmin
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
    if (foundImage.isDeleted) {
      return res.status(403).json({ error: "This image has been deleted!" })
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
    const response = {
      message: "Tags added successfully.",
      links: createImageLinks(imageId, isAdmin),
    }
    res.status(200).json(response)
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
    const isAdmin = req.isAdmin
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
    if (foundImage.isDeleted) {
      return res.status(403).json({ error: "This image has been deleted!" })
    }
    if (foundImage.isFlagged) {
      return res.status(400).json({ error: "This image has already been flagged!" })
    }

    //Update description and update JSON DB. (Will update as objects are referenced by memory address.)
    foundImage.isFlagged = true
    await fs.writeFile(imagesFilePath, JSON.stringify(allImagesObject, null, 2))
    const response = {
      message: "Image flagged successfully.",
      links: createImageLinks(imageId, isAdmin),
    }
    res.status(200).json(response)
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
      if (!image.isFlagged && !image.isDeleted && tagList.every((tag) => image.tags.includes(tag))) {
        if (isAdmin || image.ownerId === userId) {
          return true
        }
      }
      return false
    })

    const imageLinks = filteredImages.map((image) => {
      return createImageLinks(image.id, isAdmin)
    })

    const imageData = filteredImages.map((image) => {
      return { ...image }
    })

    if (!filteredImages.length) {
      return res.status(404).json({ error: "No images found with given tags." })
    }
    const response = {
      message: `${filteredImages.length} Images with such tags found successfully.`,
      data: imageData,
      links: imageLinks,
    }

    res.status(200).json({ response })
  } catch (err) {
    console.error("Error while fetching images by common tags: ", err)
    res.status(500).json({ error: "Failed to fetch images by these common tags." })
  }
}

const deleteImageById = async (req, res) => {
  try {
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

    //Find image in DB.
    const foundImageIndex = allImagesObject.images.findIndex((image) => image.id === imageId)
    const foundImage = allImagesObject.images[foundImageIndex]
    if (!foundImage) {
      return res.status(404).json({ error: "Image not found." })
    }
    if (foundImage.isDeleted) {
      return res.status(400).json({ error: "This image has already been deleted!" })
    }
    if (foundImage.isFlagged) {
      return res.status(400).json({ error: "This image has been flagged by the admin and cannot be accessed." })
    }
    if (foundImage.ownerId !== userId) {
      return res.status(403).json({ error: "Unauthorized to delete this image." })
    }

    //Soft delete the image and write in DB.
    foundImage.isDeleted = true
    await fs.writeFile(imagesFilePath, JSON.stringify(allImagesObject, null, 2))
    const response = {
      message: "Image deleted.",
      links: createImageLinks(imageId, isAdmin),
    }
    res.status(200).json(response)
  } catch (err) {
    console.error("Error during deleting. ", err)
    res.status(500).json({ error: "Failed to delete the image." })
  }
}

export {
  createImage,
  getImageById,
  getBatchOfImages,
  updateDescription,
  updateTags,
  flagImage,
  getImagesByCommonTags,
  deleteImageById,
}
