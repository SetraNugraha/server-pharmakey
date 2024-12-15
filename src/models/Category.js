import prisma from "../config/database.js"

const getAllCategory = async (page, limit) => {
  try {
    const offset = (page - 1) * limit
    const result = await prisma.category.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
    })

    const totalCategories = await prisma.category.count()

    return { result, totalCategories }
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

const getCategoryById = async (categoryId) => {
  try {
    const result = await prisma.category.findUnique({
      where: { id: categoryId },
    })

    return result
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

const findExistsNameCategory = async (slug) => {
  try {
    const result = await prisma.category.findUnique({
      where: { slug: slug },
    })

    return result
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

const createCategory = async (reqData) => {
  try {
    const { name, slug, category_image } = reqData

    const result = await prisma.category.create({
      data: {
        name,
        slug,
        category_image,
      },
    })

    return result
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

const updateCategory = async (categoryId, reqData) => {
  try {
    const { name, slug, category_image } = reqData

    const result = await prisma.category.update({
      where: { id: categoryId },
      data: { name, slug, category_image },
    })

    return result
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

const deleteCategory = async (categoryId) => {
  try {
    const result = await prisma.category.delete({
      where: { id: categoryId },
    })

    return result
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

export default {
  getAllCategory,
  getCategoryById,
  findExistsNameCategory,
  createCategory,
  updateCategory,
  deleteCategory,
}
