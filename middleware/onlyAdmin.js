import "dotenv/config"
import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const usersFilePath = path.join(__dirname, "..", "db", "users.json")

const onlyAdmin = async (req, res, next) => {
  const userId = req.userId
  const allUsersJSON = await fs.readFile(usersFilePath, "utf-8")
  const allUsersObject = JSON.parse(allUsersJSON)

  const user = allUsersObject.users.find((user) => user.id === userId)
  if (!user) {
    return res.status(400).json({ error: `Such a user with id:${userId} does not exist. Please register first.` })
  }
  if (!user.isAdmin) {
    return res.status(403).json({ error: "Only admin user can access this." })
  }
  next()
}

export default onlyAdmin
