import express from "express"
import jwt from "jsonwebtoken"
import fs from "fs/promises"
import "dotenv/config"
import User from "../models/user.js"

const userRouter = express.Router()

userRouter.post("/register", async (req, res) => {
  try {
    //Get secret key and user name if provided
    const secretKey = process.env.JWT_SECRET_KEY ?? "THISISFUN"
    const userName = req.body.userName ?? "Unknown User"
    console.log("req.body.userName: ", req.body)

    //Get current JSON DB
    const allUsersJSON = await fs.readFile("db/users.json", "utf-8")
    const allUsersObject = JSON.parse(allUsersJSON)

    //Create new User object
    const newUserId = allUsersObject.users.length + 1
    const newUserObject = new User(newUserId, userName)

    //Push user into users object and write JSON DB.
    allUsersObject.users.push(newUserObject)
    await fs.writeFile("db/users.json", JSON.stringify(allUsersObject, null, 2))

    //Sign with secret key and send token as json.
    const jwtToken = jwt.sign({ userId: newUserId }, secretKey)
    console.log(`A new user has registered with ID = ${newUserId} & username = '${userName}'`)
    res.status(200).json({ jwtToken })
  } catch (err) {
    console.log("Error while registering", err)
    res.status(500).json({ error: "Failed to register." })
  }
})

userRouter.post("/loginWithId", async (req, res) => {
  try {
    //Get secret key and user Id
    const secretKey = process.env.JWT_SECRET_KEY ?? "THISISFUN"
    const userId = req.body.userId

    if (!userId) {
      return res.status(400).json({ error: "Please provide the userId." })
    }

    //Get current JSON DB
    const allUsersJSON = await fs.readFile("db/users.json", "utf-8")
    const allUsersObject = JSON.parse(allUsersJSON)

    //Check if the user exists
    const userExists = allUsersObject.users.some((user) => user.id === userId)

    if (!userExists) {
      return res.status(400).json({ error: "Such a user does not exist. Please register first." })
    }

    //Sign with secret key and send token as json.
    const jwtToken = jwt.sign({ userId }, secretKey)
    console.log(`ID ${userId} requested for their token!`)
    res.status(200).json({ jwtToken })
  } catch (err) {
    console.log("Error while logging in.", err)
    res.status(500).json({ error: "Failed to login." })
  }
})

export default userRouter
