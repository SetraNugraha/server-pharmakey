import prisma from "../config/database.js"

const getAllCarts = async () => {
  try {
    const result = await prisma.carts.findMany()

    return result
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

const getCartByUserId = async (userId) => {
  try {
    const result = await prisma.carts.findMany({
      where: { user_id: userId },
      include: {
        product: true
      },
    })

    return result
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

const addItemToCart = async (userId, productId) => {
  try {
    const existsProduct = await prisma.carts.findFirst({
      where: {
        user_id: userId,
        product_id: productId,
      },
    })

    if (!existsProduct) {
      const addNewItem = await prisma.carts.create({
        data: {
          user_id: userId,
          product_id: productId,
          quantity: 1,
        },
      })

      return addNewItem
    } else {
      const updateQuantity = await prisma.carts.update({
        where: {
          user_id_product_id: {
            user_id: userId,
            product_id: productId,
          },
        },
        data: {
          quantity: existsProduct.quantity + 1,
        },
      })

      return updateQuantity
    }
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

const deleteItemCart = async (userId, productId) => {
  try {
    const existsProduct = await prisma.carts.findFirst({
      where: {
        user_id: userId,
        product_id: productId,
      },
    })

    if (existsProduct.quantity > 1) {
      const updateQuantity = await prisma.carts.update({
        where: {
          user_id_product_id: {
            user_id: userId,
            product_id: productId,
          },
        },
        data: {
          quantity: existsProduct.quantity - 1,
        },
      })

      return updateQuantity
    } else {
      const deleteItem = await prisma.carts.delete({
        where: {
          user_id_product_id: {
            user_id: userId,
            product_id: productId,
          },
        },
      })

      return deleteItem
    }
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

const deleteAllItemCart = async (userId) => {
  try {
    const result = await prisma.carts.deleteMany({
      where: { user_id: userId },
    })

    return result
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

export default {
  getAllCarts,
  getCartByUserId,
  addItemToCart,
  deleteItemCart,
  deleteAllItemCart
}
