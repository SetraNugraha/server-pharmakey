import Carts from "../models/Carts.js"
import Users from "../models/Users.js"
import Products from "../models/Products.js"

const getAllCarts = async (req, res) => {
  try {
    const result = await Carts.getAllCarts()

    return res.status(200).json({
      success: true,
      message: "Success get all item carts",
      data: result,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

const getCartUser = async (req, res) => {
  try {
    const userId = parseInt(req.user.userId)

    // Validate user id
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      })
    }

    // Find exists user
    const existsUser = await Users.getUserById(userId)
    if (!existsUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const result = await Carts.getCartByUserId(existsUser.id)

    return res.status(200).json({
      success: true,
      message: "Get carts by user id success",
      data: result,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

const addItemToCart = async (req, res) => {
  try {
    const userId = parseInt(req.user.userId)
    const productId = parseInt(req.params.productId)

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      })
    }

    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      })
    }

    const currUser = await Users.getUserById(userId)
    if (!currUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const currProduct = await Products.getProductById(productId)
    if (!currProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    const result = await Carts.addItemToCart(userId, productId)

    return res.status(201).json({
      success: true,
      message: "Add item to cart success",
      data: result,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

const deleteItemCart = async (req, res) => {
  try {
    const userId = parseInt(req.user.userId)
    const productId = parseInt(req.params.productId)

    // Check user
    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      })
    }

    const currUser = await Users.getUserById(userId)
    if (!currUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Check Product
    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      })
    }

    const currProduct = await Products.getProductById(productId)
    if (!currProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    // Check Cart
    const cartUser = await Carts.getCartByUserId(userId)

    if (cartUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart is empty",
      })
    }

    const productExistsInCart = cartUser.some((cart) => cart.product.id === productId)

    if (!productExistsInCart) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      })
    }

    await Carts.deleteItemCart(userId, productId)

    return res.status(200).json({
      success: true,
      message: "Remove item success",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export default {
  getAllCarts,
  getCartUser,
  addItemToCart,
  deleteItemCart,
}
