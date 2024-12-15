import { unlink } from "fs"
import Users from "../models/Users.js"
import { unlinkImage } from "../utils/unlinkImage.js"
import { body } from "express-validator"

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    const { result, totalCustomers } = await Users.getAllUsers(page, limit)

    const totalPages = Math.ceil(totalCustomers / limit)

    if (page > 1 && page > totalPages) {
      return res.status(400).json({
        success: false,
        message: "Page not found",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Get all users success",
      data: result,
      meta: {
        currPage: page,
        limit: limit,
        totalPages: totalPages,
        totalCustomers: totalCustomers,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

const getUserById = async (req, res) => {
  const userId = parseInt(req.params.userId)

  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: "Invalid user id" })
  }

  try {
    const result = await Users.getUserById(userId)

    if (!result) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    return res.status(200).json({
      success: true,
      message: "Get user by id success",
      data: result,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

const updateProfileUser = async (req, res) => {
  try {
    // Get user id from verifyToken middleware
    const userId = req.user.userId

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      })
    }

    const { username, email, address, city, post_code, phone_number } = req.body
    // const normalizedEmail = email && email.toLowerCase().trim()
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    const profile_image = req.file ? req.file.filename : null

    // Find exists user
    const existsUser = await Users.getUserById(userId)
    if (!existsUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Format Email
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: [
          {
            path: "email",
            message: "Invalid email format",
          },
        ],
      })
    }

    // Find Exists Email
    if (email) {
      const existsEmail = await Users.getUserByEmail(email)
      if (existsEmail && email === existsEmail.email) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: [
            {
              path: "email",
              message: "Email already exists",
            },
          ],
        })
      }
    }

    if (post_code && isNaN(post_code)) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: [
          {
            path: "post_code",
            message: "Post code must be a number",
          },
        ],
      })
    }

    // Unlink Profile Image
    if (profile_image && existsUser.profile_image !== null) {
      unlinkImage("customers", existsUser.profile_image)
    }

    // Prepare data user
    const newDatauser = {
      username: username || existsUser.username,
      email: email || existsUser.email,
      address: address || existsUser.address,
      city: city || existsUser.city,
      post_code: post_code ? parseInt(post_code) : existsUser.post_code,
      phone_number: phone_number || existsUser.phone_number,
      profile_image: profile_image || existsUser.profile_image,
    }

    // Compare prepare data with exists user data
    const isFieldsUpdated = Object.keys(newDatauser).some((key) => newDatauser[key] !== existsUser[key])

    if (!isFieldsUpdated) {
      return res.status(400).json({
        success: false,
        message: "No fields are updated",
      })
    }

    const result = await Users.updateProfileUser(parseInt(userId), newDatauser)

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: result,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId)

    if (userId && isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "User id must be a number",
      })
    }

    const existsUser = await Users.getUserById(userId)
    if (!existsUser) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      })
    }

    if (existsUser.profile_image) {
      unlink("customer", existsUser.profile_image)
    }

    await Users.deleteUser(userId)
    return res.status(200).json({
      success: true,
      message: "Delete user success",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export default { getAllUsers, getUserById, updateProfileUser, deleteUser }
