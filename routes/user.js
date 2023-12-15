import express from "express"
import jwt from "jsonwebtoken"
import fs from "fs/promises"
import bcrypt from "bcrypt"
import "dotenv/config"
import User from "../models/user.js"

const userRouter = express.Router()

userRouter.post("/register", async (req, res) => {
  try {
    //Get secret key,username and hashed password.
    const secretKey = process.env.JWT_SECRET_KEY ?? "THISISFUN"
    const { userName, password } = req.body
    if (!userName) {
      return res.status(400).json({ error: "Please provide the username." })
    }
    if (!password) {
      return res.status(400).json({ error: "Please provide the password." })
    }
    const passwordToString = password.toString()

    const saltRounds = 15
    const hashedPassword = await bcrypt.hash(passwordToString, saltRounds)

    //Get current JSON DB as an object.
    const allUsersJSON = await fs.readFile("db/users.json", "utf-8")
    const allUsersObject = JSON.parse(allUsersJSON)

    //Check whether username already exists.
    const existingUser = allUsersObject.users.find((user) => user.username === userName)
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists. Choose a different username." })
    }

    //Create new User object.
    const newUserId = (allUsersObject.users?.length ?? 0) + 1
    const newUserObject = new User(newUserId, userName, hashedPassword)

    //Push user into users object and write on the JSON DB.
    allUsersObject.users.push(newUserObject)
    await fs.writeFile("db/users.json", JSON.stringify(allUsersObject, null, 2))

    //Sign with secret key and send token as json.
    const jwtToken = jwt.sign({ userId: newUserId }, secretKey)
    console.log(`A new user has registered with ID = ${newUserId} & username = '${userName}'`)
    res.status(200).json({ jwtToken, message: "Sucessfully registered!" })
  } catch (err) {
    console.log("Error while registering", err)
    res.status(500).json({ error: "Failed to register." })
  }
})

userRouter.post("/login", async (req, res) => {
  try {
    //Get secret key and user Id.
    const secretKey = process.env.JWT_SECRET_KEY ?? "THISISFUN"
    const { userName, password } = req.body
    const passwordToString = password.toString()

    if (!userName) {
      return res.status(400).json({ error: "Please provide the username." })
    }
    if (!password) {
      return res.status(400).json({ error: "Please provide the password." })
    }

    //Get current JSON DB.
    const allUsersJSON = await fs.readFile("db/users.json", "utf-8")
    const allUsersObject = JSON.parse(allUsersJSON)

    //Check if the user exists and get their ID.
    const user = allUsersObject.users.find((user) => user.username === userName)
    if (!user) {
      return res.status(400).json({ error: "Such a user does not exist. Please register first." })
    }

    //Check whether password matches.
    const passwordMatches = await bcrypt.compare(passwordToString, user.password)
    if (!passwordMatches) {
      return res.status(401).json({ error: "Your password is incorrect." })
    }

    //Sign with secret key and send token as json.
    const userId = user.id
    const jwtToken = jwt.sign({ userId }, secretKey)
    console.log(`ID ${userId} requested for their token!`)
    res.status(200).json({ jwtToken, message: "Sucessfully logged in!" })
  } catch (err) {
    console.log("Error while logging in.", err)
    res.status(500).json({ error: "Failed to login." })
  }
})

export default userRouter
