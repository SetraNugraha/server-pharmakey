import Category from "../models/Category.js"
import Products from "../models/Products.js"
import generateSlug from "../utils/generateSlug.js"
import { unlinkImage } from "../utils/unlinkImage.js"

const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5

    const { result, totalProducts } = await Products.getAllProducts(page, limit)

    const totalPages = Math.ceil(totalProducts / limit)

    if (page > 1 && page > totalPages) {
      return res.status(400).json({
        success: false,
        message: "Page not found",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Get all data products success",
      data: result,
      meta: {
        currPage: page,
        limit: limit,
        totalPages: totalPages,
        totalProducts: totalProducts,
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

const getProductById = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId)

    if (productId && isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID",
      })
    }

    const result = await Products.getProductById(productId)

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Get product by slug and id success",
      data: result,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

const searchProducts = async (req, res) => {
  try {
    const query = req.query.query

    if (!query || query.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      })
    }

    const result = await Products.searchProducts(query)

    return res.status(200).json({
      success: true,
      message: "product found",
      data: result,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

const createProduct = async (req, res) => {
  try {
    const { category_id, name, price, description } = req.body
    const product_image = req.file ? req.file.filename : null

    if (!category_id) {
      return res.status(400).json({
        success: false,
        message: "Category are required",
      })
    }

    if (category_id && isNaN(category_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category id",
      })
    }

    const existsCategory = await Category.getCategoryById(parseInt(category_id))

    if (!existsCategory) {
      return res.status(404).json({
        success: false,
        message: "Validate error",
        errors: [
          {
            path: "category",
            message: "Category not found",
          },
        ],
      })
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Validate error",
        errors: [
          {
            path: "name",
            message: "Name are required",
          },
        ],
      })
    }

    // Check exists name product
    const productSlug = generateSlug(name)
    const existsName = await Products.findExistsNameProduct(productSlug)
    if (existsName) {
      return res.status(400).json({
        success: false,
        message: "Validate error",
        errors: [
          {
            path: "name",
            message: "Name already exists",
          },
        ],
      })
    }

    if (!price) {
      return res.status(400).json({
        success: false,
        message: "Validate error",
        errors: [
          {
            path: "price",
            message: "Price are required",
          },
        ],
      })
    }

    if (price && isNaN(price)) {
      return res.status(400).json({
        success: false,
        message: "Validate error",
        errors: [
          {
            path: "price",
            message: "Price must be a number",
          },
        ],
      })
    }

    if (price && price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Validate error",
        errors: [
          {
            path: "price",
            message: "Price cannot be negatif",
          },
        ],
      })
    }

    const newDataProduct = {
      category_id: parseInt(category_id),
      name: name,
      slug: productSlug,
      product_image: product_image,
      price: parseFloat(price),
      description: description || null,
    }

    const result = await Products.createProduct(newDataProduct)

    return res.status(201).json({
      success: true,
      message: "Create product success",
      data: result,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

const updateProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId)
    const { category_id, name, price, description } = req.body
    const product_image = req.file ? req.file.filename : null

    // make sure product exists
    const currProduct = await Products.getProductById(productId)
    if (!currProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    // Check Category
    if (category_id && category_id !== currProduct.category_id) {
      const existsCategory = await Category.getCategoryById(parseInt(category_id))
      if (!existsCategory) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        })
      }
    }

    // Check name
    let productSlug = currProduct.slug
    if (name && name !== currProduct.name) {
      productSlug = generateSlug(name)
      const currProductName = await Products.findExistsNameProduct(productSlug)

      if (currProductName) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: [
            {
              path: "name",
              message: "Name already exists",
            },
          ],
        })
      }
    }

    if ((name && name === null) || name === "") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: [
          {
            path: "name",
            message: "Name cannot be empty",
          },
        ],
      })
    }

    // Check Price
    if (price && isNaN(price)) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: [
          {
            path: "price",
            message: "Price must be a number",
          },
        ],
      })
    }

    if (price && price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: [
          {
            path: "price",
            message: "Price cannot be 0 or negative",
          },
        ],
      })
    }

    // delete old image
    if (product_image && currProduct.product_image) {
      unlinkImage("products", currProduct.product_image)
    }

    const newDataProduct = {
      category_id: category_id ? parseInt(category_id) : currProduct.category_id,
      name: name || currProduct.name,
      slug: name ? productSlug : currProduct.slug,
      price: price ? parseFloat(price) : currProduct.price,
      description: description || null,
      product_image: product_image || currProduct.product_image,
    }

    // Check if any fields are difference
    const isFieldsUpdated = Object.keys(newDataProduct).some((key) => newDataProduct[key] !== currProduct[key])

    if (!isFieldsUpdated) {
      return res.status(400).json({
        success: false,
        message: "No fields are updated",
      })
    }

    // update product
    const result = await Products.updateProduct(parseInt(productId), newDataProduct)

    return res.status(200).json({
      success: true,
      message: "Update product success",
      data: result,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

const deleteProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId)

    if (isNaN(productId)) {
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

    if (currProduct.product_image) {
      unlinkImage("products", currProduct.product_image)
    }

    await Products.deleteProduct(productId)
    return res.status(200).json({
      success: true,
      message: "Delete product success",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export default {
  getAllProducts,
  getProductById,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
}
