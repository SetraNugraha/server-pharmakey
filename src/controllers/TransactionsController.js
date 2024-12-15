import Transactions from "../models/Transactions.js"
import Users from "../models/Users.js"
import Carts from "../models/Carts.js"

const getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 7

    const { result, totalTransactions } = await Transactions.getAllTransactions(page, limit)

    const totalPages = Math.ceil(totalTransactions / limit)

    if (page > 1 && page > totalPages) {
      return res.status(400).json({
        success: false,
        message: "Page not found",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Get all data transactions success",
      data: result,
      meta: {
        currPage: page,
        limit: limit,
        totalPages: totalPages,
        totalTransactions: totalTransactions,
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

const getTransactionById = async (req, res) => {
  try {
    const transactionId = parseInt(req.params.transactionId)

    if (transactionId && isNaN(transactionId)) {
      return res.status(400).json({
        success: false,
        message: "Transaction id must be a number",
      })
    }

    const result = await Transactions.getTransactionById(transactionId)

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Get Transaction By Transaction Id success",
      data: result,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

const getCustomerTransaction = async (req, res) => {
  try {
    // GET customer id from Middleware verifyToken & validateCustomer
    const customerId = parseInt(req.user.userId)

    if (!customerId) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      })
    }

    if (customerId && isNaN(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer id, id must be a number",
      })
    }

    const result = await Transactions.getCustomerTransaction(customerId)
    return res.status(200).json({
      success: true,
      message: "GET Transaction Customer success",
      data: result,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

const checkout = async (req, res) => {
  try {
    // GET userId from middleware verifyToken
    const userId = parseInt(req.user.userId)
    const { address, city, post_code, phone_number, notes, payment_method } = req.body
    const currUser = await Users.getUserById(userId)

    if (!currUser) {
      return res.status(404).json({
        success: false,
        message: "User not found or not logged in",
      })
    }

    // Validate post code
    if (post_code && isNaN(post_code)) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: [
          {
            path: "post_code",
            message: "Post code must be a number",
          },
        ],
      })
    }

    if (post_code && post_code < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: [
          {
            path: "post_code",
            message: "Post code cannot be negative",
          },
        ],
      })
    }

    if (post_code && post_code.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: [
          {
            path: "post_code",
            message: "Post code cannot be more than 5 digits",
          },
        ],
      })
    }

    // Detail Address user
    const userAddress = address ?? currUser.address ?? ""
    const userCity = city ?? currUser.city ?? ""
    const userPostCode = post_code ?? currUser.post_code ?? ""
    const userPhoneNumber = phone_number ?? currUser.phone_number ?? ""

    // validate address user
    if (!userAddress || !userCity || !userPostCode || !userPhoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Incomplete address information",
      })
    }

    //! CARTS
    const currUserCarts = await Carts.getCartByUserId(userId)
    if (currUserCarts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No items in carts",
      })
    }

    // Sub Total
    const subTotal = currUserCarts.reduce((total, cart) => total + cart.product.price * cart.quantity, 0)

    // Tax 10%
    const tax = (10 / 100) * subTotal
    // Delicery Fee
    const deliveryFee = (2 / 100) * subTotal
    // Grand Total
    const grandTotalPrice = subTotal + tax + deliveryFee

    if (!payment_method) {
      return res.status(400).json({
        success: false,
        message: "Please select a payment method",
      })
    }

    if (!["TRANSFER", "COD"].includes(payment_method)) {
      return res.status(404).json({
        success: false,
        message: "Invalid payment method, allowed are TRANSFER or COD",
      })
    }

    // Create Transaction
    const newTransaction = await Transactions.checkout({
      user_id: userId,
      sub_total: subTotal,
      tax: tax,
      delivery_fee: deliveryFee,
      total_amount: grandTotalPrice,
      is_paid: "PENDING",
      notes: notes || null,
      payment_method: payment_method,
      proof: null,
      address: userAddress,
      city: userCity,
      post_code: Number(userPostCode),
      phone_number: userPhoneNumber,
    })

    // Mapping Items in Carts to Transaction_Details
    const itemsCart = currUserCarts.map((cart) => ({
      transaction_id: newTransaction.id,
      product_id: cart.product_id,
      price: cart.product.price,
      quantity: cart.quantity,
    }))

    // Create Transaction_Detail
    await Transactions.createTransactionDetail(itemsCart)

    // Delete Items on user Cart
    await Carts.deleteAllItemCart(userId)

    return res.status(201).json({
      success: true,
      message: "Checkout success",
      data: newTransaction,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

const uploadProof = async (req, res) => {
  try {
    const customerId = parseInt(req.user.userId)
    const transactionId = parseInt(req.params.transactionId)
    const proofImage = req.file ? req.file.filename : null

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer not found",
      })
    }

    if (customerId && isNaN(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Customer id must be a number",
      })
    }

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction not found",
      })
    }

    if (transactionId && isNaN(transactionId)) {
      return res.status(400).json({
        success: false,
        message: "Transaction id must be a number",
      })
    }

    const result = await Transactions.uploadProof(transactionId, customerId, proofImage)

    if (result) {
      return res.status(200).json({
        success: true,
        message: "Upload proof success",
      })
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

const updateIsPaid = async (req, res) => {
  try {
    const transactionId = parseInt(req.params.transactionId)
    const newStatus = String(req.params.newStatus).trim().toUpperCase()

    if (isNaN(transactionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid, transaction id must be a number",
      })
    }

    if (typeof newStatus !== "string" || newStatus.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Status must be a string",
      })
    }

    const currTransaction = await Transactions.getTransactionById(transactionId)

    if (!currTransaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      })
    }

    if (currTransaction.is_paid.trim().toUpperCase() !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Transaction status already updated",
      })
    }

    // Validate proof not null
    if (newStatus === "SUCCESS" && currTransaction.proof === null) {
      return res.status(404).json({
        success: false,
        message: "Customer must include proof of payment first",
      })
    }

    if (newStatus === "SUCCESS") {
      await Transactions.updateIsPaid(currTransaction.id, newStatus)
    } else if (newStatus === "CANCELLED") {
      await Transactions.updateIsPaid(currTransaction.id, newStatus)
    } else {
      return res.status(404).json({
        success: false,
        message: "Invalid status, must be success or cancelled",
      })
    }

    return res.status(200).json({
      success: true,
      message: `Transaction ${newStatus}`,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export default { getAllTransactions, getTransactionById, getCustomerTransaction, checkout, uploadProof, updateIsPaid }
