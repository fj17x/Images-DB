import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"
import User from "../models/User.js"
import bcrypt from "bcrypt"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const usersFilePath = path.join(__dirname, "..", "db", "users.json")

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
    userId = Number(userId)

    //Get current JSON DB users as an object.
    const allUsersJSON = await fs.readFile(usersFilePath, "utf-8")
    const allUsersObject = JSON.parse(allUsersJSON)

    //Search for the user and return it.
    const foundUser = allUsersObject.users.find((user) => user.id === userId)
    if (!foundUser) {
      return res.status(404).json({ error: "User not found." })
    }

    if (foundUser.isDeleted) {
      return res.status(400).json({ error: "User has been deleted!." })
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

//Also fetches soft deleted users.
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
    let { limit = 10, offset = 0, sortBy = "createdAt", sortOrder = "asc" } = req.query
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
    const allUsersJSON = await fs.readFile(usersFilePath, "utf-8")
    const allUsersObject = JSON.parse(allUsersJSON)

    const usersWithoutDeleted = allUsersObject.users.filter((user) => !user.isDeleted)
    console.log(usersWithoutDeleted)
    const batchOfUsers = usersWithoutDeleted.slice(startIndex, endIndex)
    if (!batchOfUsers.length) {
      return res.status(404).json({ error: "No users found." })
    }

    batchOfUsers.sort((imageA, imageB) => {
      let comparison = 0
      if (imageA[sortBy] < imageB[sortBy]) {
        comparison = -1
      } else if (imageA[sortBy] > imageB[sortBy]) {
        comparison = 1
      }
      return sortOrder === "desc" ? comparison * -1 : comparison
    })

    // Generate links for each user in the batch
    const userLinks = batchOfUsers.map((user) => {
      return createUsersLinks(user.id)
    })

    const userData = batchOfUsers.map((user) => {
      return { ...user }
    })

    const response = {
      message: `Successfully fetched ${userData.length} users!`,
      data: userData,
      userLinks: userLinks,
    }
    res.status(200).json(response)
  } catch (err) {
    console.error("Error during fetching: ", err)
    res.status(500).json({ error: "Failed to fetch users." })
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
    const updatedData = req.body

    const allUsersJSON = await fs.readFile(usersFilePath, "utf-8")
    const allUsersObject = JSON.parse(allUsersJSON)

    const foundUserIndex = allUsersObject.users.findIndex((user) => user.id === Number(userId))

    if (foundUserIndex === -1) {
      return res.status(404).json({ error: "User not found." })
    }

    if (allUsersObject.users[foundUserIndex].isDeleted) {
      res.status(404).json({ error: "This user has been deleted." })
    }

    allUsersObject.users[foundUserIndex] = {
      ...allUsersObject.users[foundUserIndex],
      ...updatedData,
    }

    await fs.writeFile(usersFilePath, JSON.stringify(allUsersObject, null, 2))

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

    const allUsersJSON = await fs.readFile(usersFilePath, "utf-8")
    const allUsersObject = JSON.parse(allUsersJSON)
    const existingUser = allUsersObject.users.find((user) => user.userName === userName)
    console.log("existingUser: ", existingUser)
    if (existingUser) {
      return res.status(400).json({ error: "This userName already exists!." })
    }

    const newUserId = (allUsersObject.users?.length ?? 0) + 1
    const newUserObject = new User(newUserId, userName, hashedPassword)

    allUsersObject.users.push(newUserObject)
    await fs.writeFile(usersFilePath, JSON.stringify(allUsersObject, null, 2))
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

    const allUsersJSON = await fs.readFile(usersFilePath, "utf-8")
    const allUsersObject = JSON.parse(allUsersJSON)

    const foundIndex = allUsersObject.users.findIndex((user) => user.id === userId)
    if (foundIndex === -1) {
      return res.status(404).json({ error: "User not found." })
    }

    if (allUsersObject.users[foundIndex].isDeleted) {
      return res.status(404).json({ error: "User already softly deleted!" })
    }

    allUsersObject.users[foundIndex].isDeleted = true

    await fs.writeFile(usersFilePath, JSON.stringify(allUsersObject, null, 2), "utf-8")

    const response = {
      message: "This user has been deleted!",
    }
    res.status(200).json(response)
  } catch (err) {
    console.log("Error while deleting.", err)
    res.status(500).json({ error: "Failed to delete." })
  }
}

export { getUserById, fetchBatchOfUsers, updateUserById, createUser, deleteUserById }
