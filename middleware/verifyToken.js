import jwt from "jsonwebtoken"
import "dotenv/config"
import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const usersFilePath = path.join(__dirname, "..", "db", "users.json")

const verifyToken = async (req, res, next) => {
  try {
    //Verify JWT token and get back user Id.
    const secretKey = process.env.SECRET_KEY ?? "THISISFUN"
    if (!req.headers.authorization) {
      return res.status(400).json({ error: "Token not provided. Please provide token in Authorization header." })
    }
    const token = req.headers.authorization.split(" ")[1]
    if (!token) {
      return res.status(401).json({ error: "Token not provided. Please provide token in Authorization header." })
    }
    let userId = jwt.verify(token, secretKey)
    userId = userId.userId
    req.userId = userId

    //Check whether user is an admin. If yes, make req.isAdmin true.
    const allUsersJSON = await fs.readFile(usersFilePath, "utf-8")
    const allUsersObject = JSON.parse(allUsersJSON)
    const user = allUsersObject.users.find((user) => user.id === userId)
    req.userName = user.username
    if (!user) {
      return res.status(400).json({ error: `Such a user with id:${userId} does not exist. Please register first.` })
    }
    if (user.isDeleted) {
      return res.status(400).json({ error: `The user with id:${userId} was deleted.` })
    }
    req.isAdmin = user.isAdmin ? true : false
    next()
  } catch (err) {
    console.log("Error verifying token.", err)
    return res.status(401).json({ error: "Invalid token." })
  }
}

export default verifyToken
