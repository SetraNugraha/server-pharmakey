import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRoutes from "./src/routes/auth.js"
import categoryRoutes from "./src/routes/category.js"
import productsRoutes from "./src/routes/products.js"
import cartsRoutes from "./src/routes/carts.js"
import transactionsRoutes from "./src/routes/transactions.js"
import expressListEndpoints from "express-list-endpoints"
import path from "path"

const app = express()
const router = express.Router()

// Allow to get variable from .env
dotenv.config()

// Allow server to accept request from client
app.use(cors({ origin: "http://localhost:5173", credentials: true }))

// for processing cookies
app.use(cookieParser())

// for processing req.body
app.use(express.json())

// Upload Image
app.use("/images", express.static(path.join(process.cwd(), "public/images")))

// make sure first route path is '/api' => '/api/...some route/ .../ ...
app.use("/api", router)
router.use(
  authRoutes,
  categoryRoutes,
  productsRoutes,
  cartsRoutes,
  transactionsRoutes,
)

// get variable PORT from .env use library dotenv
const port = process.env.PORT
// console.table(expressListEndpoints(app))
// Run server
app.listen(port, () => {
  console.log(`Server running on PORT: ${port}`)
})
