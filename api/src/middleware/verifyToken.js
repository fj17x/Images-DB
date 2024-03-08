import jwt from "jsonwebtoken"
import "dotenv/config"
import { User } from "../models/index.js"

const verifyToken = async (req, res, next) => {
  try {
    //Verify JWT token and get back user Id.
    const secretKey = process.env.SECRET_KEY ?? "THISISFUN"
    const token = req.cookies.jwt
    if (!token) {
      return res.status(401).json({ error: "Access token not provided." })
    }
    const decodedToken = jwt.verify(token, secretKey)
    const userId = decodedToken.userId
    req.userId = Number(userId)

    //Check whether user is an admin. If yes, make req.isAdmin true.
    const user = await User.findByPk(userId, { raw: true, attributes: ["userName", "isAdmin"] })
    if (!user) {
      return res.status(400).json({
        error:
          "The provided access token is invalid. Please ensure you are using the correct token or log in again to generate a new one.",
      })
    }
    req.userName = user.userName
    req.isAdmin = user.isAdmin ? true : false
    next()
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Access token expired." })
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid access token." })
    } else {
      console.error("Error verifying access token.", err)
      return res.status(500).json({ error: "Internal Server Error." })
    }
  }
}

export default verifyToken
