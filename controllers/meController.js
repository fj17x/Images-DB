import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"
import bcrypt from "bcrypt"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const usersFilePath = path.join(__dirname, "..", "db", "users.json")
const imagesFilePath = path.join(__dirname, "..", "db", "images.json")

//Function to create HATEOS links.
const createMeLinks = () => {
  const meLinks = []
  meLinks.push(
    {
      rel: "get_your_details",
      method: "GET",
      href: "/me",
      description: "Get your details.",
    },
    {
      rel: "update_your_details",
      method: "PUT",
      href: `/me`,
      description: "Update your details.",
    },
    {
      rel: "delete_your_account",
      method: "DELETE",
      href: `/me`,
      description: "Delete your account.",
    }
  )
  return meLinks
}

const getCurrentUserDetails = async (req, res) => {
  try {
    //Get ID of user from request.
    const userId = req.userId

    //Get current JSON DB users as an object.
    const allUsersJSON = await fs.readFile(usersFilePath, "utf-8")
    const allUsersObject = JSON.parse(allUsersJSON)

    //Search for the user and return his details.
    const foundUser = allUsersObject.users.find((user) => user.id === userId)
    if (!foundUser) {
      return res.status(404).json({ error: "User not found." })
    }
    //Return details of user.
    const { password, ...userDataToSend } = foundUser
    const response = {
      message: "Here are your details!",
      data: { ...userDataToSend },
      links: createMeLinks(),
    }
    res.status(200).json(response)
  } catch (err) {
    console.log("Error while fetching.", err)
    res.status(500).json({ error: "Failed to fetch." })
  }
}

const updateCurrentUserDetails = async (req, res) => {
  try {
    const userId = req.userId
    const { userName, password } = req.body

    if (!(userName || password)) {
      return res.status(400).json({ error: "userName or password is required. Please provide userName or password in the body." })
    }

    const allUsersJSON = await fs.readFile(usersFilePath, "utf-8")
    const allUsersObject = JSON.parse(allUsersJSON)

    const foundIndex = allUsersObject.users.findIndex((user) => user.id === userId)
    if (foundIndex === -1) {
      return res.status(404).json({ error: "User not found." })
    }

    const foundUser = allUsersObject.users[foundIndex]

    if (foundUser.isDeleted) {
      return res.status(400).json({ error: "User not found." })
    }
    if (userName) {
      const existingUser = allUsersObject.users.find((user) => user.userName === userName)
      if (existingUser && existingUser.userName !== req.userName) {
        return res.status(400).json({ error: "This username already exists! Change your username to something else!" })
      }
      foundUser.userName = userName

      //change username in all images.
      const allImagesJSON = await fs.readFile(imagesFilePath, "utf-8")
      const allImagesObject = JSON.parse(allImagesJSON)

      let userImages = allImagesObject.images.filter(
        (image) => !image.isFlagged && (req.isAdmin || image.ownerId === userId) && !image.isDeleted
      )

      userImages.map((image) => {
        if (image.ownerId === userId) {
          image.userName = userName
        }
        return image
      })
      await fs.writeFile(imagesFilePath, JSON.stringify(allImagesObject, null, 2), "utf-8")
    }

    if (password) {
      const passwordToString = password.toString()
      const saltRounds = 15
      const hashedPassword = await bcrypt.hash(passwordToString, saltRounds)
      foundUser.password = hashedPassword
    }
    console.log(foundUser)
    foundUser.modifiedAt = new Date()
    await fs.writeFile(usersFilePath, JSON.stringify(allUsersObject, null, 2), "utf-8")

    const response = {
      message: "Your details have been updated!",
      links: createMeLinks(),
    }
    res.status(200).json(response)
  } catch (err) {
    console.log("Error while updating.", err)
    res.status(500).json({ error: "Failed to update." })
  }
}

const deleteCurrentUser = async (req, res) => {
  try {
    const userId = req.userId
    const allUsersJSON = await fs.readFile(usersFilePath, "utf-8")
    const allUsersObject = JSON.parse(allUsersJSON)

    const foundIndex = allUsersObject.users.findIndex((user) => user.id === userId)
    const foundUser = allUsersObject.users[foundIndex]
    if (!foundUser) {
      return res.status(404).json({ error: "User not found." })
    }

    if (foundUser.isDeleted) {
      return res.status(404).json({ error: "User not found." })
    }

    foundUser.isDeleted = true
    foundUser.modifiedAt = new Date()
    await fs.writeFile(usersFilePath, JSON.stringify(allUsersObject, null, 2), "utf-8")

    const response = {
      message: "Your profile has been soft deleted!",
      links: createMeLinks(),
    }
    res.status(200).json(response)
  } catch (err) {
    console.log("Error while deleting.", err)
    res.status(500).json({ error: "Failed to delete." })
  }
}

export { getCurrentUserDetails, updateCurrentUserDetails, deleteCurrentUser }
