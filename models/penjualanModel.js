// models/penjualanModel.js
const mongoose = require("mongoose");
const penjualanSchema = new mongoose.Schema({
  tanggal: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  total: {
    type: Number,
    required: true,
  }
});

module.exports = mongoose.model("Penjualan", penjualanSchema);
