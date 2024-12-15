import jwt from "jsonwebtoken"
import { check } from "express-validator"

export const verifyToken = (req, res, next) => {
  // Get Token from headers
  const authHeader = req.headers["authorization"]

  // must have one space on split (' ')
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized, token not provided" })
  }

  // Verify Token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
    if (err) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" })
    }

    req.user = {
      userId: decode.userId,
      email: decode.email,
      role: decode.role,
    }
    next()
  })
}

export const validateAdmin = (req, res, next) => {
  // get req.user from verifyToken middleware
  const { role } = req.user

  if (role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Access denied, admin only",
    })
  }

  next()
}

export const validateCustomer = (req, res, next) => {
  // get req.user from verifyToken middleware
  const { role } = req.user

  if (role !== "CUSTOMER") {
    return res.status(403).json({
      success: false,
      message: "Accesss denied, customer only",
    })
  }

  next()
}

export const validateRegister = [
  check("username").notEmpty().withMessage("Username is required"),

  check("email")
    .trim()
    .exists()
    .withMessage("email is required'")
    .notEmpty()
    .withMessage("email cannot be empty")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  check("password")
    .exists()
    .withMessage("Password is required")
    .notEmpty()
    .withMessage("Password cannot be empty")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 character"),

  check("confirmPassword")
    .notEmpty()
    .withMessage("Please confirm your password"),
]

export const validateLogin = [
  check("email")
    .trim()
    .exists()
    .withMessage("email is required'")
    .notEmpty()
    .withMessage("email cannot be empty")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  check("password")
    .exists()
    .withMessage("Password is required")
    .notEmpty()
    .withMessage("Password cannot be empty")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 character"),
]
