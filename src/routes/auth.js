import express from "express"
import AuthController from "../controllers/AuthController.js"
import UsersController from "../controllers/UsersController.js"

// Middleware
import { validateRegister, validateLogin, verifyToken, validateCustomer, validateAdmin } from "../middleware/auth.js"
import { uploadCustomerImage } from "../middleware/uploadCustomerImage.js"

const router = express.Router()
// LOGIN ADMIN
router.post("/admin/login", validateLogin, AuthController.loginAdmin)
// LOGIN CUSTOMER
router.post("/customer/login", validateLogin, AuthController.loginCustomer)

router.post("/register", validateRegister, AuthController.register)
router.get("/token", AuthController.refreshToken)

// LOGOUT
router.delete("/logout", AuthController.logout)

// GET Users
router.get("/users", UsersController.getAllUsers)
router.get("/users/:userId", UsersController.getUserById)

// UPDATE
router.patch(
  "/users/update/:userId",
  verifyToken,
  validateCustomer,
  uploadCustomerImage.single("profile_image"),
  UsersController.updateProfileUser,
)

// DELETE
router.delete("/users/delete/:userId", verifyToken, validateAdmin, UsersController.deleteUser)

export default router
