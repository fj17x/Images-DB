import "dotenv/config"
import jwt from "jsonwebtoken"
import fs from "fs/promises"
import bcrypt from "bcrypt"
import User from "../models/User.js"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const usersFilePath = path.join(__dirname, "..", "db", "users.json")

//For HATEOS
const authLinks = [
  {
    rel: "register",
    method: "POST",
    href: "/register",
    description: "Register a new user",
  },
  {
    rel: "login",
    method: "POST",
    href: "/login",
    description: "Login with userName and password",
  },
]

const register = async (req, res) => {
  try {
    const secretKey = process.env.SECRET_KEY ?? "THISISFUN"
    const { userName, password } = req.body

    if (!userName || !password) {
      return res.status(400).json({ error: "Please provide userName and password." })
    }

    const passwordToString = password.toString()
    const saltRounds = 15
    const hashedPassword = await bcrypt.hash(passwordToString, saltRounds)

    const allUsersJSON = await fs.readFile(usersFilePath, "utf-8")
    const allUsersObject = JSON.parse(allUsersJSON)

    const existingUser = allUsersObject.users.find((user) => user.userName === userName)
    if (existingUser) {
      return res.status(400).json({ error: "userName already exists. Choose a different userName." })
    }

    const newUserId = (allUsersObject.users?.length ?? 0) + 1
    const newUserObject = new User(newUserId, userName, hashedPassword)

    allUsersObject.users.push(newUserObject)
    await fs.writeFile(usersFilePath, JSON.stringify(allUsersObject, null, 2))

    const jwtToken = jwt.sign({ userId: newUserId }, secretKey)
    console.log(`A new user has registered with ID = ${newUserId} & userName = '${userName}'`)
    const response = {
      message: "Successfully registered!",
      jwtToken,
      links: authLinks,
    }
    res.status(201).json(response)
  } catch (err) {
    console.log("Error during registering: ", err)
    res.status(500).json({ error: "Failed to register." })
  }
}

const login = async (req, res) => {
  try {
    const secretKey = process.env.SECRET_KEY ?? "THISISFUN"
    const { userName, password } = req.body

    if (!userName || !password) {
      return res.status(400).json({ error: "Please provide userName and password." })
    }

    const passwordToString = password.toString()
    const allUsersJSON = await fs.readFile(usersFilePath, "utf-8")
    const allUsersObject = JSON.parse(allUsersJSON)

    const user = allUsersObject.users.find((user) => user.userName === userName)
    if (!user) {
      return res.status(400).json({ error: "Such a user does not exist. Please register first." })
    }

    const passwordMatches = await bcrypt.compare(passwordToString, user.password)
    if (!passwordMatches) {
      return res.status(401).json({ error: "Your password is incorrect." })
    }

    const userId = user.id
    const jwtToken = jwt.sign({ userId }, secretKey)
    console.log(`ID ${userId} requested for their token!`)
    const response = {
      message: "Successfully logged in!",
      jwtToken,
      links: authLinks,
    }
    res.status(200).json(response)
  } catch (err) {
    console.log("Error during logging in: ", err)
    res.status(500).json({ error: "Failed to login." })
  }
}

export { register, login }
