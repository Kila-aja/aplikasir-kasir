const mongoose = require('mongoose');

const produkSchema = new mongoose.Schema({
    nama: String,
    harga: Number,
    stok: Number,
    foto: String
});

module.exports = mongoose.model('Produk', produkSchema);
