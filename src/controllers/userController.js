import bcrypt from "bcrypt"
import { QueryTypes } from "sequelize"
import sequelize from "../db/connection.js"
import User from "../models/User.js"

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
        error: "Only the admin can use this route! Please view your own details at /me route!",
      })
    }

    //Get ID of user from request.
    let { userId } = req.params
    let { showDeleted = "false" } = req.query
    userId = Number(userId)

    //Search for the user and return it.
    const foundUser = await User.findOne({ where: { id: userId }, paranoid: showDeleted === "false" ? true : false })
    if (!foundUser) {
      return res.status(404).json({ error: "User not found." })
    }

    //Return details of user.
    const response = {
      message: "Found user!",
      data: { ...foundUser }.dataValues,
      links: createUsersLinks(userId),
    }
    res.status(200).json(response)
  } catch (err) {
    console.log("Error while fetching.", err)
    const errorMessage = err?.errors?.[0]?.message || "Unknown error occurred."
    res.status(500).json({ error: "Failed to fetch.", details: errorMessage })
  }
}

const fetchBatchOfUsers = async (req, res) => {
  try {
    //Check if admin.
    const isAdmin = req.isAdmin
    if (!isAdmin) {
      return res.status(403).json({
        error: "Only the admin can use this route!",
      })
    }

    //Get limit and offset.
    let { limit = 10, offset = 0, sortBy = "id", sortOrder = "ASC", showDeleted = "false" } = req.query
    limit = Number(limit)
    offset = Number(offset)
    sortOrder = sortOrder.toUpperCase()

    if (isNaN(limit) || isNaN(offset) || limit < 1 || offset < 0) {
      return res.status(400).json({
        error: "Limit should be >= 1, and offset should be >= 0.",
      })
    }

    //Try to use findAndCountAll
    const batchOfUsers = await User.findAll({
      limit,
      offset,
      order: [[sortBy, sortOrder ?? "ASC"]],
      paranoid: showDeleted === "false" ? true : false,
    })

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
    const errorMessage = err?.errors?.[0]?.message || "Unknown error occurred."
    res.status(500).json({ error: "Failed to fetch users.", details: errorMessage })
  }
}

const partiallyUpdateUserById = async (req, res) => {
  try {
    const isAdmin = req.isAdmin
    const fieldsToUpdate = req.body
    if (!isAdmin) {
      return res.status(403).json({
        error: "Only the admin can update the users!",
      })
    }
    let { userId } = req.params
    userId = Number(userId)
    const updatedData = req.body

    for (const key in fieldsToUpdate) {
      const value = fieldsToUpdate[key]
      if (value !== undefined) {
        if ((key === "userName" || key === "password") && typeof value !== "string") {
          return res.status(400).json({ error: `${key} should be a string!` })
        }
      }
    }
    await User.update(updatedData, { where: { id: userId } })

    const response = {
      message: "User updated successfully.",
      userLinks: createUsersLinks(userId),
    }
    res.status(200).json(response)
  } catch (err) {
    console.error("Error while updating user: ", err)
    const errorMessage = err?.errors?.[0]?.message || "Unknown error occurred."
    res.status(500).json({ error: "Failed to update user.", details: errorMessage })
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

    if (!id) {
      return res.status(400).json({
        error: "Request must include id!",
      })
    }

    if (!userName) {
      return res.status(400).json({
        error: "Request must include userName!",
      })
    }

    if (!password) {
      return res.status(400).json({
        error: "Request must include password!",
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

    if (typeof id !== "number" || typeof userName !== "string" || typeof password !== "string") {
      return res.status(400).json({
        error: "Invalid data types for id(number), userName(string), or password(string).",
      })
    }

    const createdAtDate = new Date(createdAt)
    const updatedAtDate = new Date(updatedAt)

    if (isNaN(createdAtDate.getTime()) || isNaN(updatedAtDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format." })
    }
    const formattedcreatedAt = createdAtDate.toISOString()
    const formattedupdatedAt = updatedAtDate.toISOString()

    await sequelize.query(
      `UPDATE "Users" SET id=?,"userName"=?,password=?,"isAdmin"=?,"createdAt"=?,"updatedAt"=?,"destroyTime"=? WHERE id=?`,
      {
        replacements: [
          id,
          userName,
          password,
          isAdmin ?? null,
          formattedcreatedAt,
          formattedupdatedAt,
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
    const errorMessage = err?.errors?.[0]?.message || "Unknown error occurred."
    res.status(500).json({ error: "Failed to update user.", details: errorMessage })
  }
}

const createUser = async (req, res) => {
  try {
    const isAdmin = req.isAdmin
    if (!isAdmin) {
      return res.status(403).json({
        error: "Only the admin can create the users using this route!",
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
    const errorMessage = err?.errors?.[0]?.message || "Unknown error occurred."
    res.status(500).json({ error: "Failed to create.", details: errorMessage })
  }
}

const deleteUserById = async (req, res) => {
  try {
    const isAdmin = req.isAdmin
    if (!isAdmin) {
      return res.status(403).json({
        error: "Only the admin can delete the other users!",
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
    const errorMessage = err?.errors?.[0]?.message || "Unknown error occurred."
    res.status(500).json({ error: "Failed to delete.", details: errorMessage })
  }
}

export { getUserById, fetchBatchOfUsers, updateUserById, createUser, deleteUserById, partiallyUpdateUserById }
