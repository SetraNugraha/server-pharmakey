import express from 'express'
import CartsController from '../controllers/CartsController.js'

// Middleware
import { verifyToken, validateAdmin, validateCustomer } from '../middleware/auth.js'

const router = express.Router()

// GET Data Carts
router.get('/carts', CartsController.getAllCarts)
router.get('/carts/mycart', verifyToken, validateCustomer, CartsController.getCartUser)

// Add Product to Carts
router.post('/carts/add/:productId', verifyToken, validateCustomer, CartsController.addItemToCart)

// Delete Product from Carts
router.delete('/carts/delete/:productId', verifyToken, validateCustomer, CartsController.deleteItemCart)

export default router
