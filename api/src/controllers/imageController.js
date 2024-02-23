import { QueryTypes, Op } from "sequelize"
import sequelize from "../config/connection.js"
import { Image, User } from "../models/index.js"

//Function to create HATEOAS links.
const createImageLinks = (imageId) => {
  const links = [
    {
      rel: "self",
      method: "GET",
      href: `/images/${imageId}`,
      description: "Get details of this image",
    },
    {
      rel: "update_image",
      method: "PUT",
      href: `/images/${imageId}`,
      description: "Update the image.",
    },
    {
      rel: "partially_update_image",
      method: "PATCH",
      href: `/images/${imageId}`,
      description: "Partially update the image.",
    },
    {
      rel: "delete_image",
      method: "DELETE",
      href: `/images/${imageId}`,
      description: "Delete the image.",
    },
    {
      rel: "all_images",
      method: "GET",
      href: "/images",
      description: "Get all images.",
    },
    {
      rel: "upload_image",
      method: "POST",
      href: "/images",
      description: "Upload an image.",
    },
  ]

  return links
}

const createImage = async (req, res) => {
  try {
    //Get data provided in body.
    let { url, title, description, tags } = req.body
    const userId = req.userId
    const titleMaxLength = 65

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        error: "Please provide the url and ensure the type is a string.",
      })
    }

    if (!title || typeof title !== "string" || title.length > titleMaxLength) {
      return res.status(400).json({
        error: "Please provide the title and ensure the type is a string having length < 65 characters.",
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
      url,
      ownerId: userId,
      title,
      description,
      tags,
    })

    const newImageId = image.id

    const response = {
      message: `Successfully uploaded image!`,
      imageId: Number(newImageId),
      links: createImageLinks(newImageId),
    }

    res.status(201).json(response)
  } catch (err) {
    console.error("Error during uploading: ", err)
    const errorMessage = err?.errors?.[0]?.message || "Unknown error occurred."
    res.status(500).json({ error: "Failed to upload.", details: errorMessage })
  }
}

const getBatchOfImages = async (req, res) => {
  try {
    const userId = req.userId
    const isAdmin = req.isAdmin
    let tagList = []

    //Get limit and offset.
    let {
      limit = 50,
      offset = 0,
      sortBy = "id",
      sortOrder = "ASC",
      showDeleted = "false",
      showFlagged = "true",
      tags,
      searchQuery,
      searchColumn = "id",
    } = req.query

    if (tags && !Array.isArray(tags)) {
      return res.status(400).json({ error: "Provide tags as comma seperated values!" })
    }

    if (tags) {
      tagList = tags[0].split(",")
    }

    //Filter images based on tags.
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
      ? {
          tags: {
            [Op.contains]: tagList,
          },
          isFlagged: showFlagged === "true" ? { [Op.or]: [true, false] } : false,
          [Op.and]: [searchQuery ? sequelize.literal(`CAST("Image"."${searchColumn}" AS TEXT) ILIKE '%${searchQuery}%'`) : {}],
        }
      : {
          tags: {
            [Op.contains]: tagList,
          },
          isFlagged: false,
          ownerId: userId,
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
      raw: true,
    })

    const totalNeededImages = await Image.count({
      where: {
        tags: {
          [Op.contains]: tagList,
        },
        isFlagged: showFlagged === "true" ? { [Op.or]: [true, false] } : false,
        [Op.and]: [searchQuery ? sequelize.literal(`CAST("Image"."${searchColumn}" AS TEXT) LIKE '%${searchQuery}%'`) : {}],
      },
      paranoid: paranoidCondition,
    })

    let totalImages = await Image.count()

    if (!batchOfImages.length) {
      return res.status(404).json({ error: "No images found. " })
    }

    // Generate links for each image in the batch
    const imageLinks = batchOfImages.map((image) => {
      return createImageLinks(image.id)
    })

    const imageData = batchOfImages.map((image) => {
      return { ...image }
    })

    const response = {
      message: `Successfully fetched images!`,
      fetched: batchOfImages.length,
      data: imageData,
      links: imageLinks,
      totalImages,
      totalNeededImages,
    }

    res.status(200).json(response)
  } catch (err) {
    console.error("Error during fetching of images.: ", err)
    const errorMessage = err?.errors?.[0]?.message || "Unknown error occurred."
    res.status(500).json({ error: "Failed to fetch images.", details: errorMessage })
  }
}

const getImageById = async (req, res) => {
  try {
    //Get ID of image needed to be searched for.
    let { imageId } = req.params
    imageId = Number(imageId)
    const userId = req.userId
    let isAdmin = req.isAdmin
    if (!imageId) {
      return res.status(400).json({ error: "Please provide imageId." })
    }

    const foundImage = await Image.findByPk(imageId, {
      include: {
        model: User,
        as: "owner",
        attributes: ["userName"],
      },
      raw: true,
      paranoid: isAdmin ? false : true,
      isFlagged: isAdmin ? { [Op.or]: [true, false] } : false,
    })

    if (!foundImage) {
      return res.status(404).json({ error: "Image not found." })
    }

    if (!isAdmin && foundImage.isFlagged) {
      return res.status(403).json({ error: "This image has been flagged by the admin and cannot be accessed." })
    }

    if (!isAdmin && foundImage.ownerId !== userId) {
      return res.status(403).json({ error: "You can only access images you have uploaded." })
    }

    const response = {
      message: "Successfully found image!",
      data: { ...foundImage },
      links: createImageLinks(imageId),
    }
    //Return details of image.
    res.status(200).json(response)
  } catch (err) {
    console.error("Error while fetching.", err)
    const errorMessage = err?.errors?.[0]?.message || "Unknown error occurred."
    res.status(500).json({ error: "Failed to fetch image.", details: errorMessage })
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
      },
      raw: true,
    })
    if (!foundImage) {
      return res.status(404).json({ error: "Image not found." })
    }

    if (!isAdmin && foundImage.ownerId !== userId) {
      return res.status(403).json({ error: "Unauthorized to delete this image." })
    }

    await Image.destroy({
      where: {
        id: imageId,
      },
    })

    const response = {
      message: "Image deleted.",
    }
    res.status(200).json(response)
  } catch (err) {
    console.error("Error during deleting. ", err)
    const errorMessage = err?.errors?.[0]?.message || "Unknown error occurred."
    res.status(500).json({ error: "Failed to delete the image.", details: errorMessage })
  }
}

const deleteAllOwnImages = async (req, res) => {
  try {
    const userId = req.userId

    const deletedCount = await Image.destroy({
      where: {
        ownerId: userId,
      },
    })

    if (deletedCount === 0) {
      return res.status(404).json({ error: "No images found to delete." })
    }

    const response = {
      message: "All of your images deleted successfully.",
      deletedCount: deletedCount,
    }

    return res.status(200).json(response)
  } catch (err) {
    console.error("Error during deleting all images. ", err)
    const errorMessage = err?.errors?.[0]?.message || "Unknown error occurred."
    res.status(500).json({ error: "Failed to delete all images.", details: errorMessage })
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
    const titleMaxLength = 65

    if (id && typeof id !== "number") {
      return res.status(400).json({ error: "Id should be provided as an number." })
    }

    if (url && typeof url !== "string") {
      return res.status(400).json({ error: "URL should be provided as an string." })
    }

    if (description && typeof description !== "string") {
      return res.status(400).json({ error: "Description should be provided as an string." })
    }

    if (title) {
      if (typeof title !== "string") {
        return res.status(400).json({ error: "Title should be provided as a string." })
      } else if (title.length > titleMaxLength) {
        return res.status(400).json({ error: "The title should be less than 65 characters." })
      }
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

    if (id === imageId || id === null) {
      delete fieldsToUpdate.id
    }

    const foundImage = await Image.findOne({
      where: {
        id: imageId,
      },
      attributes: ["ownerId", "isFlagged"],
      paranoid: isAdmin ? false : true,
      raw: true,
    })

    if (!foundImage) {
      return res.status(404).json({ error: "Image not found." })
    }

    if (!isAdmin && foundImage.ownerId !== userId) {
      return res.status(403).json({ error: "Unauthorized to update this image." })
    }

    if (!isAdmin && foundImage.isFlagged === true) {
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
      links: createImageLinks(imageId),
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
    const isAdmin = req.isAdmin
    const { id, url, title, description, ownerId, tags, isFlagged, destroyTime, updatedAt, createdAt } = req.body
    const titleMaxLength = 65

    if (!isAdmin) {
      return res.status(403).json({ error: "Only an admin can send the PUT request!" })
    }

    if (!id) {
      return res.status(400).json({ error: "Request must include ID." })
    }

    if (typeof id !== "number") {
      return res.status(400).json({ error: "ID should be provided as an number." })
    }

    if (!url) {
      return res.status(400).json({ error: "Request must include url." })
    }

    if (!title || title.length > titleMaxLength) {
      return res.status(400).json({
        error: !title ? "Request must include title." : "Title length should be less than 65 characters.",
      })
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

    if (typeof url !== "string" || typeof title !== "string") {
      return res.status(400).json({
        error: "Invalid data types for url or title.",
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
        error: "Invalid data type for ownerId.",
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
      raw: true,
    })

    if (!foundImage) {
      return res.status(404).json({ error: "Image not found." })
    }

    await sequelize.query(
      `UPDATE "Images" SET id=?,"url"=?,title=?,description=?,"ownerId"=?,"updatedAt"=?,"createdAt"=?, "destroyTime"=?,tags=ARRAY[?]::VARCHAR[],"isFlagged"=? WHERE id=?`,
      {
        replacements: [
          id ?? imageId,
          url,
          title,
          description ?? null,
          ownerId ?? null,
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
      links: createImageLinks(imageId),
    }
    res.status(200).json(response)
  } catch (err) {
    console.error("Error during image update: ", err)
    const errorMessage = err?.errors?.[0]?.message || "Unknown error occurred."
    res.status(500).json({ error: "Failed to update the image.", details: errorMessage })
  }
}

export { createImage, getImageById, getBatchOfImages, deleteImageById, partiallyUpdateImage, updateImage, deleteAllOwnImages }
