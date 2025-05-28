const Produk = require("../models/produkModel");
const Penjualan = require("../models/penjualanModel");
const DetailPenjualan = require('../models/detailPenjualanModel');

const path = require("path");
const fs = require("fs");

const produkController = {
  // Salah satu controller, misalnya getDetailPenjualan
// Tambahkan ini di dalam produkController
getDetailPenjualan: async (req, res) => {
  try {
    const detailList = await DetailPenjualan.find()
      .populate({
        path: "produk",
        select: "name" // pastikan field ini sesuai dengan schema Produk kamu
      })
      .populate({
        path: "penjualan",
        populate: {
          path: "user",
          select: "name" // harus sesuai dengan field User schema kamu
        }
      });

    res.render("daftarDetailPenjualan", { detailList });
  } catch (error) {
    console.error("Gagal mengambil detail penjualan:", error);
    res.status(500).send("Internal Server Error");
  }
},


  
  postPenjualan: async (req, res) => {
    try {
      const { produkId, jumlah } = req.body;
      const user = req.session.user;

      const produk = await Produk.findById(produkId);
      if (!produk) {
        return res.status(404).send("Produk tidak ditemukan");
      }

      if (produk.stok < jumlah) {
        return res.status(400).send("Stok tidak mencukupi");
      }

      // Kurangi stok
      produk.stok -= jumlah;
      await produk.save();

      // Buat data penjualan
      const penjualanBaru = new Penjualan({
        user: user.id,
      });
      await penjualanBaru.save();

      // Buat detail penjualan
      const subtotal = produk.harga * jumlah;
      const detail = new DetailPenjualan({
        penjualanId: penjualanBaru._id,
        produkId,
        jumlahProduk: jumlah,
        subtotal,
      });
      await detail.save();

      res.send("Penjualan berhasil disimpan!");
    } catch (err) {
      console.error(err);
      res.status(500).send("Terjadi kesalahan saat menyimpan penjualan");
    }
  },
  // Menampilkan semua produk untuk admin
  getDaftarProduk: async (req, res) => {
    try {
      const produkList = await Produk.find();
      res.render("daftarProdukPengguna", { produkList });
    } catch (err) {
      console.error("Gagal mengambil daftar produk:", err);
      res.status(500).send("Internal Server Error");
    }
  },
  getHalamanBeli: async (req, res) => {
    try {
      const produk = await Produk.findById(req.params.id);
      if (!produk) return res.status(404).send("Produk tidak ditemukan");
      res.render("formPembelian", { produk });
    } catch (error) {
      console.error(error);
      res.status(500).send("Terjadi kesalahan");
    }
  },
    // Tambahkan di dalam objek produkController:
 postPembelian: async (req, res) => {
  try {
    const produkId = req.params.id;
    const jumlah = parseInt(req.body.jumlah);
    console.log('Jumlah produk yang dibeli:', jumlah);

    const produk = await Produk.findById(produkId);
    if (!produk) {
      return res.status(404).send('Produk tidak ditemukan');
    }

    if (produk.stok < jumlah) {
      return res.status(400).send('Stok tidak mencukupi');
    }

    // Kurangi stok
    produk.stok -= jumlah;
    await produk.save();

    // Buat data penjualan
    const penjualan = new Penjualan({
      tanggal: new Date(),
      user: req.session.user.id, // pastikan session user ada
      total: produk.harga * jumlah
    });
    await penjualan.save();

    // Buat detail penjualan
    const detail = new DetailPenjualan({
      penjualan: penjualan,
      produk: produk,
      jumlahProduk: jumlah,
      harga: produk.harga,
      subtotal: produk.harga * jumlah
    });
    await detail.save();

    res.status(200).send('Pembelian berhasil dan tercatat!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Terjadi kesalahan saat pembelian');
  }
},
// Tambahkan di controller: contoh getDetailPenjualan
// getDetailPenjualan: async (req, res) => {
//   try {
//     const detailList = await DetailPenjualan.find()
//       .populate({
//         path: "produk",
//         select: "nama"
//       })
//       .populate({
//         path: "penjualan",
//         populate: {
//           path: "user",
//           select: "nama"
//         }
//       });

//     res.render("daftarDetailPenjualan", { detailList });
//   } catch (error) {
//     console.error("Gagal mengambil detail penjualan:", error);
//     res.status(500).send("Internal Server Error");
//   }
// },





  // Menampilkan form tambah produk
  getTambahProduk: (req, res) => {
    res.render("formTambahProduk"); // pastikan file views/formTambahProduk.ejs ada
  },

  // Menyimpan produk baru ke database
  tambahProduk: async (req, res) => {
    try {
      const { nama, deskripsi, harga, stok } = req.body;
      const foto = req.file?.filename;

      if (!foto) {
        return res.status(400).send("Foto wajib diunggah");
      }
       const hargaNumber = parseInt(harga.replace(/[^0-9]/g, ''), 10);

      const produkBaru = new Produk({
        nama,
        deskripsi,
        harga: hargaNumber,
        stok,
        foto: req.file.filename
      });

      await produkBaru.save();
      res.redirect("/produk");
    } catch (err) {
      console.error("Gagal menambah produk:", err);
      res.status(500).send("Internal Server Error");
    }
  },

  // Menampilkan form edit produk
  getEditProduk: async (req, res) => {
    try {
      const produkId = req.params.id;
      const produk = await Produk.findById(produkId);
      res.render("formEditProduk", { produk });
    } catch (error) {
      console.error("Error fetching produk for edit:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  editProduk: async (req, res) => {
    try {
      const produkId = req.params.id;
      const { nama, deskripsi, harga, stok } = req.body;
      const fotoPath = req.file ? req.file.filename : null;

      const produk = await Produk.findById(produkId);
      if (!produk) {
        return res.status(404).send("Produk tidak ditemukan");
      }

      if (fotoPath && produk.foto) {
        // Hapus foto lama jika ada
        const oldFotoPath = path.join(
          __dirname,
          "../public/uploads",
          produk.foto
        );
        if (fs.existsSync(oldFotoPath)) {
          fs.unlinkSync(oldFotoPath);
        }
      }
      produk.nama = nama || produk.nama;
      produk.deskripsi = deskripsi || produk.deskripsi;
      produk.harga = harga || produk.harga;
      produk.stok = stok || produk.stok;
      produk.foto = fotoPath || produk.foto;

      await produk.save();
      res.redirect("/produk");
    } catch (error) {
      console.error("Error updating produk:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  deleteProduk: async (req, res) => {
    try {
      const produkId = req.params.id;
      const produk = await Produk.findById(produkId);

      if (!produk) {
        return res.status(404).send("Produk tidak ditemukan");
      }
      if (produk.foto) {
        const fotoPath = path.join(__dirname, "../public/uploads", produk.foto);
        if (fs.existsSync(fotoPath)) {
          fs.unlinkSync(fotoPath); // Hapus file foto
        }
      }
      await Produk.findByIdAndDelete(produkId);
      res.redirect("/produk");
    } catch (error) {
      console.error("Error deleting produk:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  // Menampilkan daftar produk untuk pengguna
  getProdukPengguna: async (req, res) => {
    try {
      const produkList = await Produk.find();
      res.render("daftarProdukPengguna", { produkList });
    } catch (error) {
      console.error("Error fetching produk for pengguna:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  getPendapatanProduk: async (req, res) => {
    try {
      const produkList = await Produk.find();

      // Hitung total pendapatan: harga * stok
      const totalPendapatan = produkList.reduce((total, produk) => {
        return total + produk.harga * produk.stok;
      }, 0);

      res.render("pendapatanProduk", { produkList, totalPendapatan });
    } catch (err) {
      console.error("Gagal menghitung pendapatan:", err);
      res.status(500).send("Internal Server Error");
    }
  },
  getStokProduk: async (req, res) => {
        try {
            const produkList = await Produk.find();
            res.render('stokProduk', { produkList });
        } catch (err) {
            console.error(err);
            res.status(500).send("Gagal mengambil data produk");
        }
    }
};

module.exports = produkController;
