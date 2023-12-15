import jwt from "jsonwebtoken"
import "dotenv/config"

const verifyToken = (req, res, next) => {
  const secretKey = process.env.JWT_SECRET ?? "THISISFUN"

  if (!req.headers.authorization) {
    return res.status(400).json({ error: "Token not provided. Please provide token in Authorization header." })
  }

  const token = req.headers.authorization.split(" ")[1]
  if (!token) {
    return res.status(401).json({ error: "Token not provided. Please provide token in Authorization header." })
  }
  try {
    const userId = jwt.verify(token, secretKey)
    req.userId = userId.userId
    next()
  } catch (err) {
    console.log("Error verifying token", err)
    return res.status(401).json({ error: "Invalid token" })
  }
}

export default verifyToken
