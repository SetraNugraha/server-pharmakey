import fs from "fs"
import path from "path"

export const unlinkImage = (folderName, fileName) => {
  if (!fileName) {
    return false
  }

  const pathImages = path.join(process.cwd(), "public", "images")
  const result = path.join(pathImages, folderName, fileName)

  fs.unlink(result, (err) => {
    if (err) {
      console.log("Error deleting image: ", err)
    }
  })
}
