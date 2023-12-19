import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const usersFilePath = path.join(__dirname, "..", "db", "users.json")

//Function to create HATEOS links.
const createUsersLinks = (userId, isAdmin) => {
  const userLinks = []
  if (isAdmin) {
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
      }
    )
  }
  return userLinks
}

const getUserById = async (req, res) => {
  try {
    //Check if admin.
    const isAdmin = req.isAdmin
    if (!isAdmin) {
      return res.status(403).json({
        error: "Only the admin can see the users!",
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
    //Return details of user.
    const response = {
      message: "Found user!",
      data: { ...foundUser },
      links: createUsersLinks(userId, isAdmin),
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
    const allUsersJSON = await fs.readFile(usersFilePath, "utf-8")
    const allUsersObject = JSON.parse(allUsersJSON)

    const batchOfUsers = allUsersObject.users.slice(startIndex, endIndex)
    if (!batchOfUsers.length) {
      return res.status(404).json({ error: "No users found." })
    }

    // Generate links for each user in the batch
    const userLinks = batchOfUsers.map((user) => {
      return createUsersLinks(user.id, isAdmin)
    })

    const userData = batchOfUsers.map((user) => {
      return { ...user }
    })

    const response = {
      message: "Successfully fetched users!",
      data: userData,
      userLinks: userLinks,
    }
    res.status(200).json(response)
  } catch (err) {
    console.error("Error during fetching: ", err)
    res.status(500).json({ error: "Failed to fetch users." })
  }
}

export { getUserById, fetchBatchOfUsers }
