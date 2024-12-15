import prisma from "../config/database.js"

const getAllUsers = async (page, limit) => {
  try {
    const offset = (page - 1) * limit
    const result = await prisma.users.findMany({
      where: { role: "CUSTOMER" },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        profile_image: true,
        address: true,
        city: true,
        post_code: true,
        phone_number: true,
      },
      take: limit,
      skip: offset,
      orderBy: { id: "desc" },
    })

    const totalCustomers = await prisma.users.count({
      where: { role: "CUSTOMER" },
    })

    return { result, totalCustomers }
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

const getUserById = async (userId) => {
  try {
    const result = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        profile_image: true,
        address: true,
        city: true,
        post_code: true,
        phone_number: true,
      },
    })

    return result
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

const getUserByEmail = async (email) => {
  try {
    // const normalizedEmail = email.trim().toLowerCase()
    const result = await prisma.users.findUnique({
      where: { email: email },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        role: true,
      },
    })

    return result
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

const updateProfileUser = async (userId, reqData) => {
  try {
    const result = await prisma.users.update({
      where: { id: userId },
      data: reqData,
      select: {
        username: true,
        email: true,
        address: true,
        city: true,
        post_code: true,
        phone_number: true,
        profile_image: true,
      },
    })

    return result
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

const deleteUser = async (userId) => {
  try {
    const result = await prisma.users.delete({
      where: { id: userId, role: "CUSTOMER" },
    })

    return result
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

export default {
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateProfileUser,
  deleteUser,
}
