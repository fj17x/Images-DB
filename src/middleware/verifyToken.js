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
    let userId = jwt.verify(token, secretKey)
    userId = userId.userId
    req.userId = userId

    //Check whether user is an admin. If yes, make req.isAdmin true.
    const user = await User.findByPk(userId)
    if (!user) {
      return res
        .status(400)
        .json({ error: `Such a user with id:${userId} does not exist(from JWT token). Please register first.` })
    }
    req.userName = user.userName
    req.isAdmin = user.isAdmin ? true : false
    next()
  } catch (err) {
    console.log("Error verifying token.", err)
    return res.status(401).json({ error: "Invalid token." })
  }
}

export default verifyToken
