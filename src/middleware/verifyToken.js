import jwt from "jsonwebtoken"
import "dotenv/config"
import { User } from "../models/index.js"

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
    const decodedToken = jwt.verify(token, secretKey)
    const userId = decodedToken.userId
    req.userId = userId

    //Check whether user is an admin. If yes, make req.isAdmin true.
    const user = await User.findByPk(userId, { raw: true, attributes: ["userName", "isAdmin"] })
    if (!user) {
      return res
        .status(400)
        .json({ error: `Such a user with id:${userId} does not exist(from JWT token). Please register first.` })
    }
    req.userName = user.userName
    req.isAdmin = user.isAdmin ? true : false
    next()
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired." })
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token." })
    } else {
      console.error("Error verifying token.", err)
      return res.status(500).json({ error: "Internal Server Error." })
    }
  }
}

export default verifyToken
