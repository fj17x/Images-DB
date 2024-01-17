import { QueryTypes, Op } from "sequelize"
import sequelize from "../db/connection.js"
import Image from "../models/Image.js"

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

    const foundImage = await Image.findByPk(imageId)

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
    res.status(500).json({ error: "Failed to fetch." })
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
      order: [[sortBy, sortOrder ?? "ASC"]],
      where: whereCondition,
      paranoid: paranoidCondition,
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

    const imagesWithCommonTags = await Image.findAll({
      where: {
        tags: {
          [Op.contains]: tagList,
        },
      },
    })

    //check flagged
    // const filteredImages = allImagesObject.images.filter((image) => {
    //   if (!image.isFlagged && !image.isDeleted && tagList.every((tag) => image.tags.includes(tag))) {
    //     if (isAdmin || image.ownerId === userId) {
    //       return true
    //     }
    //   }
    //   return false
    // })

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

    if (!imageId) {
      return res.status(400).json({ error: "Please provide imageId." })
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

    for (const key in fieldsToUpdate) {
      const value = fieldsToUpdate[key]
      if (value !== undefined) {
        if ((key === "title" || key === "description" || key === "url") && typeof value !== "string") {
          return res.status(400).json({ error: `${key} should be a string!` })
        }
        if (key === "tags" && !Array.isArray(value)) {
          return res.status(400).json({ error: `${key} should be an array!` })
        }
      }
    }

    await Image.update(fieldsToUpdate, {
      where: {
        id: imageId,
      },
    })

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

    const createdAtDate = new Date(createdAt)
    const updatedAtDate = new Date(updatedAt)

    if (isNaN(createdAtDate.getTime()) || isNaN(updatedAtDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format." })
    }
    const formattedcreatedAt = createdAtDate.toISOString()
    const formattedupdatedAt = updatedAtDate.toISOString()

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

    const x = await sequelize.query(
      `UPDATE "Images" SET id=?,"url"=?,title=?,description=?,"ownerId"=?,"updatedAt"=?,"createdAt"=?, "destroyTime"=?,tags=?,"isFlagged"=? WHERE id=?`,
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
    res.status(500).json({ error: "Failed to update the image." })
  }
}

export { createImage, getImageById, getBatchOfImages, getImagesByCommonTags, deleteImageById, partiallyUpdateImage, updateImage }
