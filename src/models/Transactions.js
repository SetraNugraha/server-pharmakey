import prisma from "../config/database.js"

const getAllTransactions = async (page, limit) => {
  try {
    const offset = (page - 1) * limit

    const result = await prisma.transactions.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
    })

    const totalTransactions = await prisma.transactions.count()

    return { result, totalTransactions }
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

const getTransactionById = async (transactionId) => {
  try {
    const result = await prisma.transactions.findUnique({
      where: { id: transactionId },
      include: {
        transaction_detail: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
                product_image: true,
              },
            },
          },
        },
      },
    })

    return result
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

const getCustomerTransaction = async (customerId) => {
  try {
    const result = await prisma.transactions.findMany({
      where: { user_id: customerId },
      orderBy: { id: "desc" },
    })

    return result
  } catch (error) {
    console.error(error.message)
    throw new Error("Internal server error")
  }
}

const createTransactionDetail = async (reqData) => {
  try {
    const result = await prisma.Transaction_Details.createMany({
      data: reqData,
    })

    return result
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

const checkout = async (reqData) => {
  try {
    const result = await prisma.transactions.create({
      data: reqData,
    })

    return result
  } catch (error) {
    console.error(error.message)
    throw new Error("Internal server error")
  }
}

const uploadProof = async (transactionId, customerId, proofImage) => {
  try {
    const result = await prisma.transactions.update({
      where: {
        id: transactionId,
        user_id: customerId,
      },
      data: {
        proof: proofImage,
      },
    })

    return result
  } catch (error) {
    console.error(error.message)
    throw new Error("Internal Server Error")
  }
}

const updateIsPaid = async (transactionId, newStatus) => {
  try {
    const result = await prisma.transactions.update({
      where: { id: transactionId },
      data: {
        is_paid: newStatus,
      },
    })

    return result
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

export default {
  getAllTransactions,
  getTransactionById,
  getCustomerTransaction,
  createTransactionDetail,
  checkout,
  uploadProof,
  updateIsPaid,
}
