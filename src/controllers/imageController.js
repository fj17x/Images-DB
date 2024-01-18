import { QueryTypes, Op } from "sequelize"
import sequelize from "../config/connection.js"
import Image from "../models/Image.js"
import User from "../models/User.js"

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
    //Get data provided in body.
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
        error: "Please provide the title and ensure the type is a string.",
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

    const image = await Image.create({
      url: imageURL,
      ownerId: userId,
      title,
      description,
      tags,
    })

    const newImageId = image.id

    const response = {
      message: `Sucessfully uploaded image! Image Id is : ${newImageId}`,
      links: createImageLinks(newImageId, isAdmin),
    }

    res.status(201).json(response)
  } catch (err) {
    console.log("Error during uploading: ", err)
    const errorMessage = err?.errors?.[0]?.message || "Unknown error occurred."
    res.status(500).json({ error: "Failed to upload. Must provide url and title.", details: errorMessage })
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

    const foundImage = await Image.findByPk(imageId, {
      include: {
        model: User,
        as: "owner",
        attributes: ["userName"],
      },
    })

    if (!foundImage) {
      return res.status(404).json({ error: "Image not found." })
    }

    if (foundImage.dataValues.isFlagged) {
      return res.status(403).json({ error: "This image has been flagged by the admin and cannot be accessed." })
    }

    if (!isAdmin && foundImage.dataValues.ownerId !== userId) {
      return res.status(403).json({ error: "You can only access images you have uploaded." })
    }

    const response = {
      message: "Successfully found image!",
      data: { ...foundImage }.dataValues,
      links: createImageLinks(imageId, isAdmin),
    }
    //Return details of image.
    res.status(200).json(response)
  } catch (err) {
    console.log("Error while fetching.", err)
    const errorMessage = err?.errors?.[0]?.message || "Unknown error occurred."
    res.status(500).json({ error: "Failed to fetch.", details: errorMessage })
  }
}

const getBatchOfImages = async (req, res) => {
  try {
    const userId = req.userId
    const isAdmin = req.isAdmin

    //Get limit and offset.
    let { limit = 50, offset = 0, sortBy = "createdAt", sortOrder = "asc", showDeleted = "false" } = req.query
    limit = Number(limit)
    offset = Number(offset)
    sortOrder = sortOrder.toUpperCase()
    sortOrder = sortOrder === "DESC" ? "DESC" : "ASC"

    if (isNaN(limit) || isNaN(offset) || limit < 1 || offset < 0) {
      return res.status(400).json({
        error: "Limit should be >= 1, and offset should be >= 0.",
      })
    }

    const whereCondition = isAdmin
      ? {}
      : {
          ownerId: userId,
          isFlagged: false,
        }

    const paranoidCondition = isAdmin ? (showDeleted === "false" ? true : false) : true

    const batchOfImages = await Image.findAll({
      limit,
      offset,
      order: [[sortBy, sortOrder]],
      where: whereCondition,
      paranoid: paranoidCondition,
      include: {
        model: User,
        as: "owner",
        attributes: ["userName"],
      },
    })

    if (!batchOfImages.length) {
      if (!isAdmin) {
        return res.status(404).json({ error: `No images found for user with ID: ${userId}.` })
      }
      return res.status(404).json({ error: "No images found. " })
    }

    // Generate links for each image in the batch
    const imageLinks = batchOfImages.map((image) => {
      return createImageLinks(image.id, isAdmin)
    })

    const imageData = batchOfImages.map((image) => {
      return { ...image }.dataValues
    })

    const response = {
      message: `Successfully fetched images!`,
      fetched: batchOfImages.length,
      data: imageData,
      links: imageLinks,
    }

    res.status(200).json(response)
  } catch (err) {
    console.error("Error during fetching of images.: ", err)
    const errorMessage = err?.errors?.[0]?.message || "Unknown error occurred."
    res.status(500).json({ error: "Failed to fetch images.", details: errorMessage })
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

    const whereCondition = isAdmin
      ? {
          tags: {
            [Op.contains]: tagList,
          },
        }
      : {
          tags: {
            [Op.contains]: tagList,
          },
          isFlagged: false,
          ownerId: userId,
        }

    const imagesWithCommonTags = await Image.findAll({
      where: whereCondition,
      order: [["id", "ASC"]],
      include: {
        model: User,
        as: "owner",
        attributes: ["userName"],
      },
    })

    const imageLinks = imagesWithCommonTags.map((image) => {
      return createImageLinks(image.id, isAdmin)
    })

    const imageData = imagesWithCommonTags.map((image) => {
      return { ...image }.dataValues
    })

    if (!imagesWithCommonTags.length) {
      return res.status(404).json({ error: "No images found with given tags." })
    }
    const response = {
      message: ` Images with such tags found successfully.`,
      fetched: imagesWithCommonTags.length,
      data: imageData,
      links: imageLinks,
    }

    res.status(200).json({ response })
  } catch (err) {
    console.error("Error while fetching images by common tags: ", err)
    const errorMessage = err?.errors?.[0]?.message || "Unknown error occurred."
    res.status(500).json({ error: "Failed to fetch images by these common tags.", details: errorMessage })
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

    const foundImage = await Image.findOne({
      where: {
        id: imageId,
        ownerId: userId,
      },
    })
    if (!foundImage) {
      return res.status(404).json({ error: "Image not found." })
    }

    if (!isAdmin && foundImage.dataValues.ownerId !== userId) {
      return res.status(403).json({ error: "Unauthorized to delete this image." })
    }

    await Image.destroy({
      where: {
        id: imageId,
      },
    })

    const response = {
      message: "Image deleted.",
      links: createImageLinks(imageId, isAdmin),
    }
    res.status(200).json(response)
  } catch (err) {
    console.error("Error during deleting. ", err)
    const errorMessage = err?.errors?.[0]?.message || "Unknown error occurred."
    res.status(500).json({ error: "Failed to delete the image.", details: errorMessage })
  }
}

const partiallyUpdateImage = async (req, res) => {
  try {
    let { imageId } = req.params
    imageId = Number(imageId)
    const userId = req.userId
    const isAdmin = req.isAdmin
    const { id, url, title, description, ownerId, tags, isFlagged, destroyTime, updatedAt, createdAt } = req.body
    const fieldsToUpdate = req.body
    const allowedFieldsByUsers = ["title", "description", "tags", "url"]

    if (id && typeof id !== "number") {
      return res.status(400).json({ error: "Id should be provided as an number." })
    }

    if (url && typeof url !== "string") {
      return res.status(400).json({ error: "URL should be provided as an string." })
    }

    if (description && typeof description !== "string") {
      return res.status(400).json({ error: "Description should be provided as an string." })
    }

    if (title && typeof title !== "string") {
      return res.status(400).json({ error: "Title should be provided as an string." })
    }

    if (ownerId && typeof ownerId !== "number") {
      return res.status(400).json({ error: "OwnerId should be provided as an string." })
    }

    if (tags && !Array.isArray(tags)) {
      return res.status(400).json({
        error: "Tags should be provided as an array.",
      })
    }

    if (isFlagged && typeof isFlagged !== "boolean") {
      return res.status(400).json({
        error: "isFlagged should be provided as an boolean.",
      })
    }

    if (ownerId && typeof ownerId !== "number") {
      return res.status(400).json({
        error: "Invalid data type for number.",
      })
    }

    if (createdAt) {
      const createdAtDate = new Date(createdAt)
      if (isNaN(createdAtDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format for createdAt." })
      }
      const formattedCreatedAt = createdAtDate.toISOString()
      fieldsToUpdate.createdAt = formattedCreatedAt
    }

    if (updatedAt) {
      const updatedAtDate = new Date(updatedAt)
      if (isNaN(updatedAtDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format for updatedAt." })
      }
      const formattedUpdatedAt = updatedAtDate.toISOString()
      fieldsToUpdate.updatedAt = formattedUpdatedAt
    }

    if (destroyTime) {
      const destroyTimeDate = new Date(destroyTime)
      if (isNaN(destroyTimeDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format for destroyTime." })
      }
      const formattedDestroyTime = destroyTimeDate.toISOString()
      fieldsToUpdate.destroyTime = formattedDestroyTime
    }

    console.log("🚀 ~ partiallyUpdateImage ~ fieldsToUpdate:", fieldsToUpdate)
    const foundImage = await Image.findOne({
      where: {
        id: imageId,
      },
      attributes: ["ownerId", "isFlagged"],
      paranoid: isAdmin ? false : true,
    })

    if (!foundImage) {
      return res.status(404).json({ error: "Image not found." })
    }

    if (!isAdmin && foundImage.dataValues.ownerId !== userId) {
      return res.status(403).json({ error: "Unauthorized to update this image." })
    }

    if (!isAdmin && foundImage.dataValues.isFlagged === true) {
      return res.status(403).json({ error: "This image has been flagged and cannot be changed!" })
    }

    // Only certain fields can be updated by non-admins.
    if (!isAdmin) {
      const allFields = Object.keys(fieldsToUpdate)
      const invalidFields = allFields.filter(
        (field) => fieldsToUpdate[field] !== undefined && !allowedFieldsByUsers.includes(field)
      )
      if (invalidFields.length > 0) {
        return res.status(403).json({ error: `Unauthorized to update these field(s): ${invalidFields.join(", ")}` })
      }
    }

    await Image.update(fieldsToUpdate, {
      where: {
        id: imageId,
      },
      paranoid: false,
    })

    const response = {
      message: "Image details updated successfully.",
      links: createImageLinks(imageId, isAdmin),
    }
    res.status(200).json(response)
  } catch (err) {
    console.error("Error during image update: ", err)
    const errorMessage = err?.errors?.[0]?.message || "Unknown error occurred."
    res.status(500).json({ error: "Failed to update the image.", details: errorMessage })
  }
}

const updateImage = async (req, res) => {
  try {
    let { imageId } = req.params
    imageId = Number(imageId)
    const userId = req.userId
    const isAdmin = req.isAdmin
    const { id, url, title, description, ownerId, tags, isFlagged, destroyTime, updatedAt, createdAt } = req.body

    if (!isAdmin) {
      return res.status(403).json({ error: "Only an admin can send the PUT request!" })
    }

    if (!id) {
      return res.status(400).json({ error: "Request must include id." })
    }

    if (!url) {
      return res.status(400).json({ error: "Request must include url." })
    }

    if (!title) {
      return res.status(400).json({ error: "Request must include title." })
    }

    if (!createdAt) {
      return res.status(400).json({
        error: "Request must include createdAt!",
      })
    }

    if (!updatedAt) {
      return res.status(400).json({
        error: "Request must include updatedAt!",
      })
    }

    if (typeof id !== "number" || typeof url !== "string" || typeof title !== "string") {
      return res.status(400).json({
        error: "Invalid data types for id, url, or title.",
      })
    }

    if (tags && !Array.isArray(tags)) {
      return res.status(400).json({
        error: "Tags should be provided as an array.",
      })
    }

    if (isFlagged && typeof isFlagged !== "boolean") {
      return res.status(400).json({
        error: "isFlagged should be provided as an array.",
      })
    }

    if (ownerId && typeof ownerId !== "number") {
      return res.status(400).json({
        error: "Invalid data type for number.",
      })
    }

    const createdAtDate = new Date(createdAt)
    const updatedAtDate = new Date(updatedAt)

    if (isNaN(createdAtDate.getTime()) || isNaN(updatedAtDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format." })
    }
    const formattedcreatedAt = createdAtDate.toISOString()
    const formattedupdatedAt = updatedAtDate.toISOString()

    if (destroyTime) {
      const destroyTimeDate = new Date(destroyTime)
      if (isNaN(destroyTimeDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format for destroyTime." })
      }
      const formattedDestroyTime = destroyTimeDate.toISOString()
      fieldsToUpdate.destroyTime = formattedDestroyTime
    }

    const foundImage = await Image.findOne({
      where: {
        id: imageId,
      },
      paranoid: isAdmin ? false : true,
    })

    if (!foundImage) {
      return res.status(404).json({ error: "Image not found." })
    }

    if (!isAdmin && foundImage.dataValues.ownerId !== userId) {
      return res.status(403).json({ error: "Unauthorized to update this image." })
    }

    await sequelize.query(
      `UPDATE "Images" SET id=?,"url"=?,title=?,description=?,"ownerId"=?,"updatedAt"=?,"createdAt"=?, "destroyTime"=?,tags=ARRAY[?]::VARCHAR[],"isFlagged"=? WHERE id=?`,
      {
        replacements: [
          id ?? imageId,
          url,
          title,
          description ?? null,
          ownerId ?? foundImage.dataValues.ownerId,
          formattedupdatedAt,
          formattedcreatedAt,
          destroyTime ?? null,
          tags ?? null,
          isFlagged ?? null,
          imageId,
        ],
        type: QueryTypes.UPDATE,
      }
    )

    const response = {
      message: "Image details updated successfully.",
      links: createImageLinks(imageId, isAdmin),
    }
    res.status(200).json(response)
  } catch (err) {
    console.error("Error during image update: ", err)
    const errorMessage = err?.errors?.[0]?.message || "Unknown error occurred."
    res.status(500).json({ error: "Failed to update the image.", details: errorMessage })
  }
}

export { createImage, getImageById, getBatchOfImages, getImagesByCommonTags, deleteImageById, partiallyUpdateImage, updateImage }
