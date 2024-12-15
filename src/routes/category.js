import express from "express"
import CategoryController from "../controllers/CategoryController.js"
import { uploadCategory } from "../middleware/uploadCategory.js"

// Middleware
import { verifyToken, validateAdmin } from "../middleware/auth.js"

const router = express.Router()

router.get("/category", CategoryController.getAllCategory)
router.get("/category/:categoryId", CategoryController.getCategoryById)

// Admin Only
// Create
router.post(
  "/category",
  verifyToken,
  validateAdmin,
  uploadCategory.single("category_image"),
  CategoryController.createCategory,
)

router.patch(
  "/category/:categoryId",
  verifyToken,
  validateAdmin,
  uploadCategory.single("category_image"),
  CategoryController.updateCategory,
)

// Update, Delete
router.delete(
  "/category/:categoryId",
  verifyToken,
  validateAdmin,
  CategoryController.deleteCategory,
)

export default router
