import prisma from "../config/database.js"
import bcrypt from "bcrypt"

const register = async (reqData) => {
  const { username, email, password} = reqData

  // Hash Password
  const salt = await bcrypt.genSalt(10)
  const hashPassword = await bcrypt.hash(password, salt)

  // Store data new user on variable userFields
  const userFields = {
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password: hashPassword,
    role: "CUSTOMER"
  }

  try {
    // Create new user
    const result = await prisma.users.create({
      data: userFields,
    })

    return result
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

const getUserByToken = async (token) => {
  try {
    const result = await prisma.users.findFirst({
      where: { refresh_token: token },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        refresh_token: true,
      },
    })

    return result
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

const updateUserToken = async (userId, token) => {
  try {
    const result = await prisma.users.update({
      where: { id: userId },
      data: { refresh_token: token },
    })

    return result
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

const deleteUserToken = async (userId) => {
  try {
    const result = await prisma.users.update({
      where: { id: userId },
      data: { refresh_token: null },
    })

    return result
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

export default {
  register,
  getUserByToken,
  updateUserToken,
  deleteUserToken,
}
