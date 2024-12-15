const generateSlug = (name) => {
  return name
    .toLowerCase() // Ubah huruf menjadi kecil
    .replace(/ /g, "-") // Ganti spasi dengan tanda "-"
    .replace(/[^\w-]+/g, "") // Hapus karakter non-alfanumerik
    .replace(/--+/g, "-") // Ganti tanda "-" ganda dengan satu
    .replace(/^-+/, "") // Hapus tanda "-" di awal string
    .replace(/-+$/, "") // Hapus tanda "-" di akhir string
}

export default generateSlug
