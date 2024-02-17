import "dotenv/config"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { User } from "../models/index.js"

//For HATEOAS
const authLinks = [
  {
    rel: "register",
    method: "POST",
    href: "/register",
    description: "Register a new user.",
  },
  {
    rel: "sign in",
    method: "POST",
    href: "/signin",
    description: "Sign in with userName and password.",
  },
  {
    rel: "logout in",
    method: "GET",
    href: "/logout",
    description: "Log out from current account.",
  },
]

const register = async (req, res) => {
  try {
    const { userName, password } = req.body
    if (!userName || !password) {
      return res.status(400).json({ error: "Please provide userName and password." })
    }

    if (typeof userName !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Please provide userName and password as strings!" })
    }

    const userNameMaxLength = 15
    const passwordMaxLength = 30

    if (userName.length > userNameMaxLength) {
      return res.status(400).json({
        error: "Username exceeds maximum length (15 characters).",
      })
    }
    if (password.length > passwordMaxLength) {
      return res.status(400).json({
        error: "Password exceeds maximum length (30 characters).",
      })
    }

    const foundUser = await User.findOne({
      where: {
        userName,
      },
      raw: true,
    })

    if (foundUser) {
      return res.status(409).json({ error: "userName already exists!" })
    }

    const passwordToString = password.toString()
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(passwordToString, saltRounds)

    const newUser = await User.create({ userName: userName, password: hashedPassword })

    console.info(`A new user has registered with ID = ${newUser.id} & userName = '${newUser.userName}'`)
    const response = {
      message: "Successfully registered!",
      userId: Number(newUser.id),
      links: authLinks,
    }
    res.status(201).json(response)
  } catch (err) {
    console.error("Error during registering: ", err)
    const errorMessage = err?.errors?.[0]?.message || "Unknown error occurred."
    res.status(500).json({ error: "Failed to register.", details: errorMessage })
  }
}

const login = async (req, res) => {
  try {
    const secretKey = process.env.SECRET_KEY ?? "THISISFUN"
    const { userName, password } = req.body

    if (!userName || !password) {
      return res.status(400).json({ error: "Please provide userName and password." })
    }

    if (typeof userName !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Please provide userName and password as strings!" })
    }

    const userNameMaxLength = 15
    const passwordMaxLength = 30

    if (userName.length > userNameMaxLength) {
      return res.status(400).json({
        error: "Username exceeds maximum length (15 characters).",
      })
    }
    if (password.length > passwordMaxLength) {
      return res.status(400).json({
        error: "Password exceeds maximum length (30 characters).",
      })
    }

    const passwordToString = password.toString()

    const user = await User.findOne({ where: { userName: userName }, raw: true, attributes: ["password", "id"] })
    if (!user) {
      return res.status(400).json({ error: "Such a user does not exist. Please register first." })
    }

    const passwordMatches = await bcrypt.compare(passwordToString, user.password)
    if (!passwordMatches) {
      return res.status(401).json({ error: "Your password is incorrect." })
    }

    const expiresIn = "365d"
    const userId = user.id
    const jwtToken = jwt.sign({ userId }, secretKey, { expiresIn })
    const response = {
      message: "Successfully logged in!",
      jwtToken,
      links: authLinks,
    }
    res.cookie("jwt", jwtToken, {
      httpOnly: true,
      // secure: true,
      sameSite: "Strict",
    })
    console.info(`ID ${userId} requested for their token!`)
    res.status(200).json(response)
  } catch (err) {
    console.error("Error during logging in: ", err)
    const errorMessage = err?.errors?.[0]?.message || "Unknown error occurred."
    res.status(500).json({ error: "Failed to login.", details: errorMessage })
  }
}

const logout = async (req, res) => {
  try {
    res.clearCookie("jwt")
    res.status(200).json({ message: "Successfully logged out." })
  } catch (err) {
    console.error("Error during logout: ", err)
    res.status(500).json({ error: "Failed to logout.", details: err.message })
  }
}

export { register, login, logout }
