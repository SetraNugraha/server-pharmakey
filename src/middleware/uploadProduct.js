import multer from "multer"
import path from "path"

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const productsPath = path.join(
      process.cwd(),
      "public",
      "images",
      "products",
    )
    cb(null, productsPath)
  },
  filename: function (req, file, cb) {
    // GET DATE
    const timestamp = new Date().getTime()
    // GET only file name without extension
    const fileName = path.parse(file.originalname).name.toLowerCase()
    // GET file extension
    const fileExtension = path.extname(file.originalname)
    // result: image-date.jpg
    cb(null, `${fileName}-${timestamp}${fileExtension}`)
  },
})

// Filter file
const fileFilter = (req, file, cb) => {
  // Allowed iamge type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"]

  // Validate image type
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(
      new Error("Not a valid image! Please upload a PNG, JPG, or JPEG image."),
      false,
    )
  }
}

// Inisialisasi multer
export const uploadProduct = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // Limit 5MB
  },
})
