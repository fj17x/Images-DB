import bcrypt from "bcrypt"
import User from "../models/User.js"
import Image from "../models/Image.js"

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

    //Search for the user and return his details.
    const foundUser = await User.findByPk(userId, {
      include: [
        {
          model: Image,
          attributes: ["id"],
          as: "images",
        },
      ],
    })
    if (!foundUser) {
      return res.status(404).json({ error: "User not found." })
    }
    const userPlainObject = foundUser.get({ plain: true })
    const { password, images, ...userDataToSend } = userPlainObject
    const imagesUploaded = images.map((image) => image.id)

    //Return details of user.
    const response = {
      message: "Here are your details!",
      data: { ...userDataToSend, imagesUploaded },
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
    //Get details and do checking.
    const userId = req.userId
    const { userName, password } = req.body

    if (!(userName || password)) {
      return res.status(400).json({ error: "userName or password is required. Please provide userName or password in the body." })
    }

    const foundUser = await User.findByPk(userId)
    if (!foundUser) {
      return res.status(404).json({ error: "User not found." })
    }

    //If userName is given, update it.
    if (userName) {
      const existingUser = await User.findOne({ where: { userName } })
      if (existingUser && existingUser.userName !== req.userName) {
        return res.status(400).json({ error: "This userName already exists! Change your userName to something else!" })
      }

      User.update({ userName }, { where: { id: userId } })
    }

    //If password is given, update it.
    if (password) {
      const passwordToString = password.toString()
      const saltRounds = 15
      const hashedPassword = await bcrypt.hash(passwordToString, saltRounds)
      User.update({ password: hashedPassword }, { where: { id: userId } })
    }

    //Return response.
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
    //Retrieve userId from request.
    const userId = req.userId

    //Soft delete the user.
    User.destroy({ where: { id: userId } })

    //Return response.
    const response = {
      message: "Your profile has been deleted!",
      links: createMeLinks(),
    }
    res.status(200).json(response)
  } catch (err) {
    console.log("Error while deleting.", err)
    res.status(500).json({ error: "Failed to delete." })
  }
}

export { getCurrentUserDetails, updateCurrentUserDetails, deleteCurrentUser }
