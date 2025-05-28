// models/detailPenjualanModel.js
const mongoose = require("mongoose");

const detailPenjualanSchema = new mongoose.Schema({
  penjualan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Penjualan",
    required: true,
  },
  produk: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Produk",
    required: true,
  },
  jumlahProduk: {
    type: Number,
    required: true,
  },
  harga: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  }
});

module.exports = mongoose.model("DetailPenjualan", detailPenjualanSchema);
