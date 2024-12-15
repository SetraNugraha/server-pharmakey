import express from "express"
import TransactionsController from "../controllers/TransactionsController.js"

// Middleware
import { verifyToken, validateAdmin, validateCustomer } from "../middleware/auth.js"
import { uploadProof } from "../middleware/uploadProof.js"

const router = express.Router()

// GET All Transactions
router.get("/transactions", verifyToken, validateAdmin, TransactionsController.getAllTransactions)

// GET Transaction By ID
router.get("/transactions/:transactionId", verifyToken, TransactionsController.getTransactionById)

// GET Transaction By Customer ID
// Customer ID From decode token middleware
router.get(
  "/transactions/customer/mytransactions",
  verifyToken,
  validateCustomer,
  TransactionsController.getCustomerTransaction,
)

// CHECKOUT
router.post("/transactions/checkout", verifyToken, validateCustomer, TransactionsController.checkout)

// CUSTOMER UPLOAD PROOF
router.put(
  "/transactions/customer/proof/:transactionId",
  verifyToken,
  validateCustomer,
  uploadProof.single("proof"),
  TransactionsController.uploadProof,
)

// Update Is Paid Success
router.put("/transactions/:transactionId/:newStatus", verifyToken, validateAdmin, TransactionsController.updateIsPaid)

export default router
