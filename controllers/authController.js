import "dotenv/config"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import User from "../models/User.js"

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
    const { userName, password } = req.body
    if (!userName || !password) {
      return res.status(400).json({ error: "Please provide userName and password." })
    }

    const passwordToString = password.toString()
    const saltRounds = 15
    const hashedPassword = await bcrypt.hash(passwordToString, saltRounds)

    const newUser = await User.create({ userName: userName, password: hashedPassword })

    console.log(`A new user has registered with ID = ${newUser.id} & userName = '${newUser.userName}'`)
    const response = {
      message: "Successfully registered! Please login at /login route.",
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

    const user = await User.findOne({ where: { userName: userName } })
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
    //err["errors"][0]?.message
    res.status(500).json({ error: "Failed to login." })
  }
}

export { register, login }
