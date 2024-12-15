import prisma from "../config/database.js"

const getAllProducts = async (page, limit) => {
  try {
    const offset = (page - 1) * limit

    const result = await prisma.products.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
    })

    const totalProducts = await prisma.products.count()

    return { result, totalProducts }
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

const getProductById = async (productId) => {
  try {
    const result = await prisma.products.findUnique({
      where: { id: productId },
    })

    return result
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

const findExistsNameProduct = async (slug) => {
  try {
    const result = await prisma.products.findUnique({
      where: { slug: slug },
    })

    return result
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

const searchProducts = async (query) => {
  try {
    const result = await prisma.products.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            category: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        ],
      },
      include: {
        category: true,
      },
    })

    return result
  } catch (error) {
    console.error(error.message)
    throw new Error("Internal server error")
  }
}

const createProduct = async (reqData) => {
  try {
    const { category_id, name, slug, product_image, price, description } = reqData

    const result = await prisma.products.create({
      data: {
        category_id: parseInt(category_id),
        name: name,
        slug: slug,
        product_image: product_image,
        price: parseFloat(price),
        description: description,
      },
    })

    return result
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

const updateProduct = async (productId, reqData) => {
  const { category_id, name, slug, product_image, price, description } = reqData

  try {
    const result = await prisma.products.update({
      where: { id: parseInt(productId) },
      data: { category_id, name, slug, price, description, product_image },
    })

    return result
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

const deleteProduct = async (productId) => {
  try {
    const result = await prisma.products.delete({
      where: { id: productId },
    })

    return result
  } catch (error) {
    console.log(error.message)
    throw new Error("Internal server error")
  }
}

export default {
  getAllProducts,
  getProductById,
  findExistsNameProduct,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
}
