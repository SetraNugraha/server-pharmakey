import Category from "../models/Category.js"
import generateSlug from "../utils/generateSlug.js"
import { unlinkImage } from "../utils/unlinkImage.js"

const getAllCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

    const { result, totalCategories } = await Category.getAllCategory(page, limit)

    const totalPages = Math.ceil(totalCategories / limit)

    if (page > 1 && page > totalPages) {
      return res.status(400).json({
        success: false,
        message: "Page not found",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Get All Category Success",
      data: result,
      meta: {
        currPage: page,
        limit: limit,
        totalPages: totalPages,
        totalCategories: totalCategories,
        hasPrevState: page > 1,
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

const getCategoryById = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId)

    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category id",
      })
    }

    const result = await Category.getCategoryById(categoryId)

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Get Category By Id Success",
      data: result,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

const createCategory = async (req, res) => {
  try {
    const name = req.body.name
    const category_image = req.file ? req.file.filename : null
    const newCategorySlug = generateSlug(name)

    // validate name is required
    if (!name) {
      unlinkImage("categories", category_image)
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: [
          {
            path: "name",
            message: "Name is required",
          },
        ],
      })
    }

    // Validate Exists name use slug
    const existsName = await Category.findExistsNameCategory(newCategorySlug)
    if (existsName) {
      unlinkImage("categories", category_image)
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

    //  Prepare new data
    const newData = {
      name: name,
      slug: newCategorySlug,
      category_image: category_image,
    }

    // Create new category
    const result = await Category.createCategory(newData)

    res.status(201).json({
      success: true,
      message: "Create Category Success",
      data: result,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

const updateCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId)
    const name = req.body.name
    const category_image = req.file ? req.file.filename : null

    // Check Exists Category
    const currCategory = await Category.getCategoryById(categoryId)

    if (!currCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      })
    }

    // check category id
    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Category ID",
      })
    }

    // Validate Exists name use slug
    let categorySlug = currCategory.slug
    if (name && name !== currCategory.name) {
      categorySlug = generateSlug(name)
      const existsName = await Category.findExistsNameCategory(categorySlug)
      if (existsName) {
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

    // delete old image
    if (category_image && currCategory.category_image) {
      unlinkImage("categories", currCategory.category_image)
    }

    // Prepare New Data
    const newDataCategory = {
      name: name || currCategory.name,
      slug: name ? categorySlug : currCategory.slug,
      category_image: category_image ? category_image : currCategory.category_image,
    }

    //  check if any fields are difference
    const isFieldsUpdated = Object.keys(newDataCategory).some((key) => newDataCategory[key] !== currCategory[key])

    if (!isFieldsUpdated) {
      return res.status(400).json({
        success: false,
        message: "No fields are updated",
      })
    }

    const result = await Category.updateCategory(categoryId, newDataCategory)

    return res.status(200).json({
      success: true,
      message: "Update category success",
      data: result,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

const deleteCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId)

    // check cateogry id
    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Category ID",
      })
    }

    // Check category exists
    const currCategory = await Category.getCategoryById(categoryId)
    if (!currCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      })
    }

    // Delete Category Image From folder if have image
    if (currCategory.category_image) {
      unlinkImage("categories", currCategory.category_image)
    }

    // Process Delete
    await Category.deleteCategory(categoryId)
    return res.status(200).json({
      success: true,
      message: "Delete Category success",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

export default {
  getAllCategory,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
}
