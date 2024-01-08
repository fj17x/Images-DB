import fs from "fs/promises"
import Image from "../models/image.js"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const imagesFilePath = path.join(__dirname, "..", "db", "images.json")

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
    if (!foundImage || foundImage.isDeleted) {
      return res.status(404).json({ error: "Image not found." })
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
    let { limit = 50, offset = 0, sortBy = "createdAt", sortOrder = "asc" } = req.query
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

    batchOfUserImages.sort((imageA, imageB) => {
      let comparison = 0
      if (imageA[sortBy] < imageB[sortBy]) {
        comparison = -1
      } else if (imageA[sortBy] > imageB[sortBy]) {
        comparison = 1
      }
      return sortOrder === "desc" ? comparison * -1 : comparison
    })

    // Generate links for each image in the batch
    const imageLinks = batchOfUserImages.map((image) => {
      return createImageLinks(image.id, isAdmin)
    })

    const imageData = batchOfUserImages.map((image) => {
      return { ...image }
    })

    const response = {
      message: `Successfully fetched images!`,
      fetched: batchOfUserImages.length,
      data: imageData,
      links: imageLinks,
    }

    res.status(200).json(response)
  } catch (err) {
    console.error("Error during fetching of images.: ", err)
    res.status(500).json({ error: "Failed to fetch images." })
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
      message: ` Images with such tags found successfully.`,
      fetched: filteredImages.length,
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
      return res.status(400).json({ error: "Image not found." })
    }
    if (foundImage.isFlagged) {
      return res.status(400).json({ error: "This image has been flagged by the admin and cannot be accessed." })
    }
    if (!isAdmin && foundImage.ownerId !== userId) {
      return res.status(403).json({ error: "Unauthorized to delete this image." })
    }

    //Soft delete the image and write in DB.
    foundImage.modifiedAt = new Date()
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

const partiallyUpdateImage = async (req, res) => {
  try {
    let { imageId } = req.params
    imageId = Number(imageId)
    const userId = req.userId
    const isAdmin = req.isAdmin
    const fieldsToUpdate = req.body
    const { title, description, tags, url } = fieldsToUpdate

    if (!imageId) {
      return res.status(400).json({ error: "Please provide imageId." })
    }
    const allowedFieldsByUsers = ["title", "description", "tags", "url"]

    if (!title && !description && !tags && !url) {
      return res.status(400).json({ error: "Please provide at least one field to update from: title, description, tags or url." })
    }

    const allImagesJSON = await fs.readFile(imagesFilePath, "utf-8")
    const allImagesObject = JSON.parse(allImagesJSON)

    const foundImageIndex = allImagesObject.images.findIndex((image) => image.id === imageId)

    const foundImage = allImagesObject.images[foundImageIndex]
    if (!foundImage) {
      return res.status(404).json({ error: "Image not found." })
    }
    if (!isAdmin && foundImage.isDeleted) {
      return res.status(400).json({ error: "Image not found." })
    }

    if (!isAdmin && foundImage.ownerId !== userId) {
      return res.status(403).json({ error: "Unauthorized to update this image." })
    }

    // Only certain fields can be updated by non-admins.
    if (!isAdmin) {
      const allFields = Object.keys(fieldsToUpdate)
      const invalidFields = allFields.filter(
        (field) => fieldsToUpdate[field] !== undefined && !allowedFieldsByUsers.includes(field)
      )
      if (invalidFields.length > 0) {
        return res.status(403).json({ error: `Unauthorized to update: ${invalidFields.join(", ")}` })
      }
    }

    for (const key in fieldsToUpdate) {
      const value = fieldsToUpdate[key]
      if (value !== undefined) {
        if ((key === "title" || key === "description" || key === "url") && typeof value !== "string") {
          return res.status(400).json({ error: `${key} should be a string.` })
        }
        if (key === "tags" && !Array.isArray(value)) {
          return res.status(400).json({ error: `${key} should be an array.` })
        }
        foundImage[key] = value
      }
    }
    foundImage.modifiedAt = new Date()
    await fs.writeFile(imagesFilePath, JSON.stringify(allImagesObject, null, 2))
    const response = {
      message: "Image details updated successfully.",
      links: createImageLinks(imageId, isAdmin),
    }
    res.status(200).json(response)
  } catch (err) {
    console.error("Error during image update: ", err)
    res.status(500).json({ error: "Failed to update the image." })
  }
}

const updateImage = async (req, res) => {
  try {
    let { imageId } = req.params
    imageId = Number(imageId)
    const userId = req.userId
    const isAdmin = req.isAdmin
    const fieldsToUpdate = req.body

    if (!isAdmin) {
      return res.status(403).json({ error: "Only an admin can send the PUT request!" })
    }
    if (!imageId) {
      return res.status(400).json({ error: "Please provide imageId." })
    }

    const allImagesJSON = await fs.readFile(imagesFilePath, "utf-8")
    const allImagesObject = JSON.parse(allImagesJSON)

    const foundImageIndex = allImagesObject.images.findIndex((image) => image.id === imageId)
    let foundImage = allImagesObject.images[foundImageIndex]

    if (!foundImage) {
      return res.status(404).json({ error: "Image not found." })
    }
    if (!isAdmin && foundImage.isDeleted) {
      return res.status(400).json({ error: "Image not found." })
    }

    if (!isAdmin && foundImage.ownerId !== userId) {
      return res.status(403).json({ error: "Unauthorized to update this image." })
    }

    allImagesObject.images[foundImageIndex] = {
      ...fieldsToUpdate,
    }

    await fs.writeFile(imagesFilePath, JSON.stringify(allImagesObject, null, 2))
    const response = {
      message: "Image details updated successfully.",
      links: createImageLinks(imageId, isAdmin),
    }
    res.status(200).json(response)
  } catch (err) {
    console.error("Error during image update: ", err)
    res.status(500).json({ error: "Failed to update the image." })
  }
}

export { createImage, getImageById, getBatchOfImages, getImagesByCommonTags, deleteImageById, partiallyUpdateImage, updateImage }
