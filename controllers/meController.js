import bcrypt from "bcrypt"
import User from "../models/User.js"

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
    const foundUser = await User.findByPk(userId)
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

    const foundUser = await User.findByPk(userId)
    if (!foundUser) {
      return res.status(404).json({ error: "User not found." })
    }

    if (userName) {
      const existingUser = await User.findOne({ where: { userName } })
      if (existingUser && existingUser.userName !== req.userName) {
        return res.status(400).json({ error: "This userName already exists! Change your userName to something else!" })
      }

      User.update({ userName }, { where: { id: userId } })
    }

    if (password) {
      const passwordToString = password.toString()
      const saltRounds = 15
      const hashedPassword = await bcrypt.hash(passwordToString, saltRounds)
      User.update({ password: hashedPassword }, { where: { id: userId } })
    }

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

    User.destroy({ where: { id: userId } })

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
