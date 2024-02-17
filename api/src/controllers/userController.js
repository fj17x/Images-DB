import bcrypt from "bcrypt"
import { QueryTypes, Op } from "sequelize"
import sequelize from "../config/connection.js"
import { User } from "../models/index.js"

// Function to create HATEOAS links.
const createUsersLinks = (userId) => {
  const links = [
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
      rel: "partially_update_user",
      method: "PATCH",
      href: `/users/${userId}`,
      description: "Partially update details of this user",
    },
    {
      rel: "update_user",
      method: "PUT",
      href: `/users/${userId}`,
      description: "Update details of this user",
    },
    {
      rel: "delete_user",
      method: "DELETE",
      href: `/users/${userId}`,
      description: "Delete this user",
    },
    {
      rel: "create_user",
      method: "POST",
      href: "/users",
      description: "Create a new user.",
    },
  ]

  return links
}

const createUser = async (req, res) => {
  try {
    const isAdmin = req.isAdmin
    if (!isAdmin) {
      return res.status(403).json({
        error: "Only the admin can create users using this route!",
      })
    }

    const { userName, password } = req.body
    if (!userName || !password) {
      return res.status(400).json({ error: "Please provide both username and password to create a user." })
    }

    const userNameMaxLength = 15
    if (userName.length > userNameMaxLength) {
      return res.status(400).json({
        error: "Username exceeds the maximum length of 15 characters.",
      })
    }

    const existingUser = await User.findOne({ where: { userName }, raw: true })
    if (existingUser) {
      return res.status(409).json({ error: "Username already exists." })
    }

    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const newUser = await User.create({ userName, password: hashedPassword })
    const newUserId = newUser.id

    console.info(`New user registered with ID: ${newUserId} and username: '${userName}'`)
    const response = {
      message: "User created successfully!",
      links: createUsersLinks(newUserId),
    }
    res.status(201).json(response)
  } catch (err) {
    console.error("Error creating user: ", err)
    const errorMessage = err?.errors?.[0]?.message || "An unknown error occurred."
    res.status(500).json({ error: "Failed to create user.", details: errorMessage })
  }
}

const fetchBatchOfUsers = async (req, res) => {
  try {
    const isAdmin = req.isAdmin
    if (!isAdmin) {
      return res.status(403).json({
        error: "Only the admin can use this route!",
      })
    }

    let {
      limit = 50,
      offset = 0,
      sortBy = "id",
      sortOrder = "ASC",
      showDeleted = "false",
      searchQuery,
      searchColumn = "id",
    } = req.query
    limit = Number(limit)
    offset = Number(offset)
    sortOrder = sortOrder.toUpperCase()
    sortOrder = sortOrder === "DESC" ? "DESC" : "ASC"

    if (isNaN(limit) || isNaN(offset) || limit < 1 || offset < 0) {
      return res.status(400).json({
        error: "Limit should be greater than or equal to 1, and offset should be greater than or equal to 0.",
      })
    }

    const whereCondition = isAdmin
      ? searchQuery
        ? sequelize.literal(`CAST("${searchColumn}" AS TEXT) ILIKE '%${searchQuery}%'`)
        : {}
      : {}

    const batchOfUsers = await User.findAll({
      limit,
      offset,
      order: [[sortBy, sortOrder]],
      paranoid: showDeleted === "false" ? true : false,
      raw: true,
      where: whereCondition,
    })

    const totalNeededUsers = await User.count({
      paranoid: showDeleted === "false" ? true : false,
      where: whereCondition,
    })

    const totalUsers = await User.count()

    if (!batchOfUsers.length) {
      return res.status(404).json({ error: "No users found." })
    }

    const userLinks = batchOfUsers.map((user) => createUsersLinks(user.id))
    const userData = batchOfUsers.map((user) => ({ ...user }))

    const response = {
      message: `Successfully fetched users!`,
      fetched: userData.length,
      data: userData,
      links: userLinks,
      totalUsers,
      totalNeededUsers,
    }
    res.status(200).json(response)
  } catch (err) {
    console.error("Error fetching users: ", err)
    const errorMessage = err?.errors?.[0]?.message || "An unknown error occurred."
    res.status(500).json({ error: "Failed to fetch users.", details: errorMessage })
  }
}

const getUserById = async (req, res) => {
  try {
    const isAdmin = req.isAdmin
    if (!isAdmin) {
      return res.status(403).json({
        error: "Only the admin can use this route! Please view your own details at /me route!",
      })
    }

    let { userId } = req.params
    let { showDeleted = "false" } = req.query
    userId = Number(userId)

    const foundUser = await User.findOne({ where: { id: userId }, paranoid: showDeleted === "false" ? true : false, raw: true })
    if (!foundUser) {
      return res.status(404).json({ error: "User not found." })
    }

    const response = {
      message: "Found user!",
      data: { ...foundUser },
      links: createUsersLinks(userId),
    }
    res.status(200).json(response)
  } catch (err) {
    console.error("Error fetching user: ", err)
    const errorMessage = err?.errors?.[0]?.message || "An unknown error occurred."
    res.status(500).json({ error: "Failed to fetch user.", details: errorMessage })
  }
}
const partiallyUpdateUserById = async (req, res) => {
  try {
    const isAdmin = req.isAdmin
    const fieldsToUpdate = req.body
    if (!isAdmin) {
      return res.status(403).json({
        error: "Only the admin can update users!",
      })
    }
    let { userId } = req.params
    userId = Number(userId)

    const foundUser = await User.findOne({ where: { id: userId }, paranoid: isAdmin ? false : true, raw: true })

    if (!foundUser) {
      return res.status(404).json({ error: "User not found." })
    }

    if (fieldsToUpdate.id !== undefined && typeof fieldsToUpdate.id !== "number") {
      return res.status(400).json({ error: "ID must be a number." })
    }

    if (fieldsToUpdate.userName !== undefined) {
      if (typeof fieldsToUpdate.userName !== "string") {
        return res.status(400).json({ error: "Username must be a string." })
      }
      const userNameMaxLength = 15
      if (fieldsToUpdate.userName.length > userNameMaxLength) {
        return res.status(400).json({
          error: "Username exceeds the maximum length of 15 characters.",
        })
      }
    }

    if (fieldsToUpdate.password !== undefined && typeof fieldsToUpdate.password !== "string") {
      return res.status(400).json({ error: "Password must be a string." })
    }

    await User.update(fieldsToUpdate, { where: { id: userId }, paranoid: isAdmin ? false : true })

    const response = {
      message: "User updated successfully.",
      links: createUsersLinks(userId),
    }
    res.status(200).json(response)
  } catch (err) {
    console.error("Error updating user: ", err)
    const errorMessage = err?.errors?.[0]?.message || "An unknown error occurred."
    res.status(500).json({ error: "Failed to update user.", details: errorMessage })
  }
}

const updateUserById = async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({
        error: "Only the admin can update users!",
      })
    }
    let { userId } = req.params
    userId = Number(userId)
    const { id, userName, password, createdAt, isAdmin, updatedAt, destroyTime } = req.body

    if (!id) {
      return res.status(400).json({
        error: "Request must include ID!",
      })
    }
    if (typeof id !== "number") {
      return res.status(400).json({ error: "ID must be a number." })
    }

    if (!userName) {
      return res.status(400).json({
        error: "Request must include username!",
      })
    }

    if (typeof userName !== "string") {
      return res.status(400).json({
        error: "Invalid data type for username. Please provide a string.",
      })
    }

    const userNameMaxLength = 15

    if (userName.length > userNameMaxLength) {
      return res.status(400).json({
        error: "Username exceeds the maximum length of 15 characters.",
      })
    }

    if (!password) {
      return res.status(400).json({
        error: "Request must include password!",
      })
    }

    if (typeof password !== "string") {
      return res.status(400).json({
        error: "Invalid data type for password. Please provide a string.",
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

    const createdAtDate = new Date(createdAt)
    const updatedAtDate = new Date(updatedAt)

    if (isNaN(createdAtDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format for createdAt." })
    }

    if (isNaN(updatedAtDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format for updatedAt." })
    }

    const formattedcreatedAt = createdAtDate.toISOString()
    const formattedupdatedAt = updatedAtDate.toISOString()

    const foundUser = await User.findOne({
      where: {
        id: userId,
      },
      raw: true,
      paranoid: false,
    })

    if (!foundUser) {
      return res.status(404).json({ error: "User not found." })
    }

    await sequelize.query(
      `UPDATE "Users" SET id=?, "userName"=?, password=?, "isAdmin"=?, "createdAt"=?, "updatedAt"=?, "destroyTime"=? WHERE id=?`,
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
      links: createUsersLinks(userId),
    }
    res.status(200).json(response)
  } catch (err) {
    console.error("Error updating user: ", err)
    const errorMessage = err?.errors?.[0]?.message || "An unknown error occurred."
    res.status(500).json({ error: "Failed to update user.", details: errorMessage })
  }
}

const deleteUserById = async (req, res) => {
  try {
    const isAdmin = req.isAdmin
    if (!isAdmin) {
      return res.status(403).json({
        error: "Only the admin can delete other users!",
      })
    }

    let { userId } = req.params
    userId = Number(userId)

    const foundUser = await User.findOne({
      where: {
        id: userId,
      },
      raw: true,
    })

    if (!foundUser) {
      return res.status(404).json({ error: "User not found." })
    }

    await User.destroy({
      where: {
        id: userId,
      },
    })

    const response = {
      message: "User deleted successfully!",
    }
    res.status(200).json(response)
  } catch (err) {
    console.error("Error deleting user: ", err)
    const errorMessage = err?.errors?.[0]?.message || "An unknown error occurred."
    res.status(500).json({ error: "Failed to delete user.", details: errorMessage })
  }
}

export { getUserById, fetchBatchOfUsers, updateUserById, createUser, deleteUserById, partiallyUpdateUserById }
