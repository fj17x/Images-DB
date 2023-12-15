import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const usersFilePath = path.join(__dirname, "..", "db", "users.json")

const getUserById = async (req, res) => {
  try {
    //Check if admin.
    if (!req.isAdmin) {
      return res.status(403).json({
        error: "Only admins can access this!",
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
    res.status(200).json({ ...foundUser })
  } catch (err) {
    console.log("Error while fetching.", err)
    res.status(500).json({ error: "Failed to fetch." })
  }
}

const fetchBatchOfUsers = async (req, res) => {
  try {
    //Check if admin.
    if (!req.isAdmin) {
      return res.status(403).json({
        error: "Only admins can access this!",
      })
    }

    //Get limit and offset and calculate start and end index.
    let { limit = 10, offset = 0, userId } = req.params

    limit = Number(limit)
    offset = Number(offset)

    //Get current JSON DB images as an object.
    const allUsersJSON = await fs.readFile(usersFilePath, "utf-8")
    const allUsersObject = JSON.parse(allUsersJSON)

    //Calculate start and end.
    const startIndex = offset
    const endIndex = startIndex + limit

    const batchOfUsers = allUsersObject.users.slice(startIndex, endIndex)
    if (!batchOfUsers.length) {
      return res.status(404).json({ error: "No users found." })
    }
    res.status(200).json({ batchOfUsers })
  } catch (err) {
    console.error("Error during fetching: ", err)
    res.status(500).json({ error: "Failed to fetch users." })
  }
}

export { getUserById, fetchBatchOfUsers }
