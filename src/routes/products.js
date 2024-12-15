import express from "express"
import ProductsController from "../controllers/ProductsController.js"

// Middleware
import { verifyToken, validateAdmin } from "../middleware/auth.js"
import { uploadProduct } from "../middleware/uploadProduct.js"

const router = express.Router()

// Get data
router.get("/products", ProductsController.getAllProducts)
router.get("/products/:productId", ProductsController.getProductById)
router.get("/products/search/product", ProductsController.searchProducts)

//! Admin Only
// Create
router.post(
  "/products",
  verifyToken,
  validateAdmin,
  uploadProduct.single("product_image"),
  ProductsController.createProduct,
)

// Update
router.patch(
  "/products/:productId",
  verifyToken,
  validateAdmin,
  uploadProduct.single("product_image"),
  ProductsController.updateProduct,
)

// Delete
router.delete("/products/:productId", verifyToken, validateAdmin, ProductsController.deleteProduct)

export default router
