const express = require('express');
const router = express.Router();
const checkRole = require('../middleware/checkRole');
const penjualanController = require("../controllers/penjualanController");

// Halaman riwayat penjualan (sekarang bisa diakses oleh admin, petugas, dan pengguna)
router.get('/riwayat', checkRole(['admin', 'petugas', 'pengguna']), penjualanController.getRiwayatPenjualan);

// Halaman daftar semua penjualan (sekarang juga bisa diakses oleh semua role)
router.get('/', checkRole(['admin', 'petugas', 'pengguna']), penjualanController.getDaftarPenjualan);

// PDF hanya untuk admin & petugas
router.get('/generate/pdf', checkRole(['admin', 'petugas','pengguna']), penjualanController.generatePDF);
router.post("/penjualan/:id/hapus", penjualanController.hapusRiwayat);

module.exports = router;
