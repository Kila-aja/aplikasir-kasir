const Penjualan = require("../models/penjualanModel");
const DetailPenjualan = require("../models/detailPenjualanModel");
const Produk = require("../models/produkModel");
const User = require("../models/userModel");
const PDFDocument = require("pdfkit");
const moment = require("moment");
const { model } = require("mongoose");

const penjualanController = {
 getDaftarPenjualan: async (req, res) => {
  try {
    const data = await DetailPenjualan.find()
      .populate({
        path: "produk",
        select: "name",
      })
      .populate({
        path: "penjualan",
        select: "tanggal user",
        populate: {
          path: "user",
          select: "name", // pastikan select name
        },
      });

    res.render("riwayat", { detailList: data });
  } catch (err) {
    console.error(err);
    res.status(500).send("Gagal mengambil data");
  }
},
getRiwayatPenjualan: async (req, res) => {
  try {
    const detailList = await DetailPenjualan.find()
      .populate({
        path: "penjualan",
        populate: { path: "user", select: "name" }, // tambahkan select nama di sini juga
      })
      .populate("produk");

    res.render("riwayatPenjualan", { detailList });
  } catch (error) {
    console.error(error);
    res.status(500).send("Terjadi kesalahan saat mengambil riwayat");
  }
},

  // getListPenjualan: async (req, res) => {
  //     try {
  //         const penjualanList = await Penjualan.find()
  //             .populate('user');
  //         res.render('penjualanList', { penjualanList });
  //     } catch (err) {
  //         console.error(err);
  //         res.status(500).send("Gagal mengambil data penjualan");
  //     }
  // },

  hapusRiwayat: async (req, res) => {
  try {
    const penjualanId = req.params.id;

    // Hapus semua detail penjualan terkait
    await DetailPenjualan.deleteMany({ penjualan: penjualanId });

    // Hapus penjualannya
    await Penjualan.findByIdAndDelete(penjualanId);

    res.redirect("/riwayat"); // sesuaikan dengan nama route riwayat kamu
  } catch (err) {
    console.error(err);
    res.status(500).send("Gagal menghapus riwayat penjualan");
  }
},


 generatePDF: async (req, res) => {
  try {
    const detailList = await DetailPenjualan.find()
      .populate({
        path: "penjualan",
        populate: { path: "user", select: "name" },
      })
      .populate("produk");

    const doc = new PDFDocument({ margin: 40, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="riwayat_penjualan.pdf"');

    doc.pipe(res);

    doc.fontSize(16).text("Riwayat Penjualan", { align: "center" });
    doc.moveDown();

    // Koordinat awal dan lebar kolom
    const startY = 100;
    const rowHeight = 20;
    const cols = {
      no: 40,
      id: 70,
      name: 170,
      produk: 280,
      tanggal: 380,
      jumlah: 450,
      subtotal: 510,
    };

    // Header tabel
    doc.fontSize(10).text("No", cols.no, startY);
    doc.text("ID Detail", cols.id, startY);
    doc.text("Nama Pembeli", cols.nama, startY);
    doc.text("Produk", cols.produk, startY);
    doc.text("Tanggal", cols.tanggal, startY);
    doc.text("Jumlah", cols.jumlah, startY);
    doc.text("Subtotal", cols.subtotal, startY);

    // Garis bawah header
    doc
      .moveTo(40, startY + 12)
      .lineTo(570, startY + 12)
      .stroke();

    // Data isi tabel
    let y = startY + 20;
    detailList.forEach((detail, index) => {
      doc.fontSize(10);
      doc.text(index + 1, cols.no, y);
      doc.text(String(detail._id).slice(-6), cols.id, y);

      // Ambil nama pembeli dari relasi user pada penjualan
      let namaPembeli = "-";
      if (
        detail.penjualan &&
        detail.penjualan.user &&
        typeof detail.penjualan.user === "object" &&
        detail.penjualan.user.nama
      ) {
        namaPembeli = detail.penjualan.user.nama;
      }
      doc.text(namaPembeli, cols.nama, y, { width: 100 });

      const namaProduk = detail.produk && detail.produk.nama ? detail.produk.nama : "-";
      doc.text(namaProduk, cols.produk, y, { width: 90 });

      const tanggal = detail.penjualan && detail.penjualan.tanggal
        ? moment(detail.penjualan.tanggal).format("DD/MM/YYYY")
        : "-";
      doc.text(tanggal, cols.tanggal, y);

      doc.text((detail.jumlahProduk ?? "-").toString(), cols.jumlah, y);

      const subtotal = detail.subtotal ?? detail.total ?? "-";
      doc.text(subtotal.toString(), cols.subtotal, y);

      y += rowHeight;

      if (y > 720) {
        doc.addPage();
        y = 50;
      }
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Gagal menghasilkan PDF");
  }
},
};

// ✅ Export hanya sekali
module.exports = penjualanController;
