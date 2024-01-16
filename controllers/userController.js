import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"
import User from "../models/User.js"
import bcrypt from "bcrypt"
import { QueryTypes } from "sequelize"
import sequelize from "../db/connection.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const usersFilePath = path.join(__dirname, "..", "db", "users.json")
const imagesFilePath = path.join(__dirname, "..", "db", "images.json")

//Function to create HATEOS links.
const createUsersLinks = (userId) => {
  const userLinks = []

  userLinks.push(
    {
      rel: "all_users",
      method: "GET",
      href: "/users",
      description: "Get all users",
    },
    {
      rel: "self",
      method: "GET",
      href: `/users/${userId}`,
      description: "Get details of this user",
    },
    {
      rel: "update_user",
      method: "PUT",
      href: `/users/${userId}`,
      description: "Update details of this user",
    },
    {
      rel: "partially_update_user",
      method: "PATCH",
      href: `/users/${userId}`,
      description: "Update details of this user",
    },
    {
      rel: "delete_user",
      method: "DELETE",
      href: `/users/${userId}`,
      description: "Delete this user",
    }
  )

  return userLinks
}

//Shows every user including soft deleted ones.
const getUserById = async (req, res) => {
  try {
    //Check if admin.
    const isAdmin = req.isAdmin
    if (!isAdmin) {
      return res.status(403).json({
        error: "Only the admin can see the users! Please view your own details at /me route!",
      })
    }

    //Get ID of user from request.
    let { userId } = req.params
    let { showDeleted = "false" } = req.query
    console.log("🚀 ~ getUserById ~ showDeleted:", showDeleted)
    userId = Number(userId)
    let returnOnlyDeleted = false

    if (showDeleted === "false") {
      returnOnlyDeleted = true
    } else {
      returnOnlyDeleted = false
    }

    //Search for the user and return it.
    const foundUser = await User.findOne({ where: { id: userId }, paranoid: returnOnlyDeleted })
    if (!foundUser) {
      return res.status(404).json({ error: "User not found." })
    }

    //Return details of user.
    const response = {
      message: "Found user!",
      data: { ...foundUser },
      links: createUsersLinks(userId),
    }
    res.status(200).json(response)
  } catch (err) {
    console.log("Error while fetching.", err)
    res.status(500).json({ error: "Failed to fetch." })
  }
}

const fetchBatchOfUsers = async (req, res) => {
  try {
    //Check if admin.
    const isAdmin = req.isAdmin
    if (!isAdmin) {
      return res.status(403).json({
        error: "Only the admin can see the users!",
      })
    }

    //Get limit and offset and calculate start and end index.
    let { limit = 10, offset = 0, sortBy = "id", sortOrder = "ASC", showDeleted = "false" } = req.query
    limit = Number(limit)
    offset = Number(offset)
    sortOrder = sortOrder.toUpperCase()
    let returnOnlyDeleted = false

    if (showDeleted === "false") {
      returnOnlyDeleted = true
    } else {
      returnOnlyDeleted = false
    }

    //Try to use findAndCountAll
    const batchOfUsers = await User.findAll({ limit, offset, order: [[sortBy, sortOrder ?? "ASC"]], paranoid: returnOnlyDeleted })

    if (!batchOfUsers.length) {
      return res.status(404).json({ error: "No users found." })
    }

    // Generate links for each user in the batch
    const userLinks = batchOfUsers.map((user) => {
      return createUsersLinks(user.id)
    })

    const userData = batchOfUsers.map((user) => {
      return { ...user }.dataValues
    })

    const response = {
      message: `Successfully fetched users!`,
      fetched: userData.length,
      data: userData,
      userLinks: userLinks,
    }
    res.status(200).json(response)
  } catch (err) {
    console.error("Error during fetching: ", err)
    res.status(500).json({ error: "Failed to fetch users." })
  }
}

const partiallyUpdateUserById = async (req, res) => {
  try {
    const isAdmin = req.isAdmin
    if (!isAdmin) {
      return res.status(403).json({
        error: "Only the admin can update the users!",
      })
    }
    let { userId } = req.params
    userId = Number(userId)
    const updatedData = req.body

    await User.update(updatedData, { where: { id: userId } })

    //Make sure when username changed, images change too.
    // if (updatedData.userName) {
    //   const allImagesJSON = await fs.readFile(imagesFilePath, "utf-8")
    //   const allImagesObject = JSON.parse(allImagesJSON)
    //   let userImages = allImagesObject.images.filter(
    //     (image) => !image.isFlagged && (req.isAdmin || image.ownerId === userId) && !image.isDeleted
    //   )

    //   userImages.map((image) => {
    //     if (image.ownerId === userId) {
    //       image.ownerUserName = updatedData.userName
    //     }
    //     return image
    //   })
    //   await fs.writeFile(imagesFilePath, JSON.stringify(allImagesObject, null, 2), "utf-8")
    // }

    const response = {
      message: "User updated successfully.",
      userLinks: createUsersLinks(userId),
    }
    res.status(200).json(response)
  } catch (err) {
    console.error("Error while updating user: ", err)
    res.status(500).json({ error: "Failed to update user." })
  }
}

const updateUserById = async (req, res) => {
  try {
    const isAdmin = req.isAdmin
    if (!isAdmin) {
      return res.status(403).json({
        error: "Only the admin can update the users!",
      })
    }
    let { userId } = req.params
    userId = Number(userId)
    const { id, userName, password, createdAt, updatedAt, destroyTime } = req.body

    if (!id || !userName || !password) {
      return res.status(400).json({
        error: "Request must include id, userName, and password.",
      })
    }

    if (typeof id !== "number" || typeof userName !== "string" || typeof password !== "string") {
      return res.status(400).json({
        error: "Invalid data types for id, userName, or password.",
      })
    }

    await sequelize.query(
      `UPDATE "Users" SET id=?,"userName"=?,password=?,"isAdmin"=?,"createdAt"=?,"updatedAt"=?,"destroyTime"=? WHERE id=?`,
      {
        replacements: [
          id,
          userName,
          password,
          isAdmin ?? null,
          createdAt ?? null,
          updatedAt ?? null,
          destroyTime ?? null,
          userId,
        ],
        type: QueryTypes.UPDATE,
      }
    )

    const response = {
      message: "User updated successfully.",
      userLinks: createUsersLinks(userId),
    }
    res.status(200).json(response)
  } catch (err) {
    console.error("Error while updating user: ", err)
    res.status(500).json({ error: "Failed to update user." })
  }
}

const createUser = async (req, res) => {
  try {
    const isAdmin = req.isAdmin
    if (!isAdmin) {
      return res.status(403).json({
        error: "Only the admin can update the users!",
      })
    }
    const { userName, password } = req.body
    if (!userName || !password) {
      return res.status(400).json({ error: "Please provide userName and password of the user to create." })
    }

    const passwordToString = password.toString()
    const saltRounds = 15
    const hashedPassword = await bcrypt.hash(passwordToString, saltRounds)

    const newUser = await User.create({ userName: userName, password: hashedPassword })
    const newUserId = newUser.id

    console.log(`A new user has registered with ID = ${newUserId} & userName = '${userName}'`)
    const response = {
      message: "Successfully created this user!",
      links: createUsersLinks(newUserId),
    }
    res.status(201).json(response)
  } catch (err) {
    console.log("Error during creating: ", err)
    res.status(500).json({ error: "Failed to create." })
  }
}

const deleteUserById = async (req, res) => {
  try {
    const isAdmin = req.isAdmin
    if (!isAdmin) {
      return res.status(403).json({
        error: "Only the admin can see the users!",
      })
    }

    let { userId } = req.params
    userId = Number(userId)

    await User.destroy({
      where: {
        id: userId,
      },
    })

    const response = {
      message: "This user has been deleted!",
    }
    res.status(200).json(response)
  } catch (err) {
    console.log("Error while deleting.", err)
    res.status(500).json({ error: "Failed to delete." })
  }
}

export { getUserById, fetchBatchOfUsers, updateUserById, createUser, deleteUserById, partiallyUpdateUserById }
