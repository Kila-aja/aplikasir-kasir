const express = require('express');
const router = express.Router();
const produkController = require('../controllers/produkController');
const checkSession = require('../middleware/checkSession');
const checkRole = require('../middleware/checkRole');
const uploadImage = require('../middleware/uploadimage');


router.get('/', checkSession, produkController.getDaftarProduk);
router.get('/tambah', checkSession, checkRole(['admin', 'petugas']), produkController.getTambahProduk);
router.get('/edit/:id', checkSession, checkRole(['admin', 'petugas']), produkController.getEditProduk);
router.post('/tambah', checkSession, checkRole(['admin', 'petugas']), uploadImage.single('foto'), produkController.tambahProduk);
router.post('/edit/:id', checkSession, checkRole(['admin', 'petugas']), uploadImage.single('foto'), produkController.editProduk);
router.get('/delete/:id', checkSession, checkRole(['admin', 'petugas']), produkController.deleteProduk);
router.get('/pengguna', checkSession, produkController.getProdukPengguna);
router.get('/pendapatan', checkSession, checkRole(['admin', 'petugas']), produkController.getPendapatanProduk);
router.get('/beli/:id', checkRole(['pengguna']), produkController.getHalamanBeli);
router.post('/beli/:id', checkRole(['pengguna']), produkController.postPembelian);
router.get('/stok', checkRole(['admin', 'petugas']), produkController.getStokProduk);
router.get('/detail-penjualan', produkController.getDetailPenjualan);



module.exports = router;
