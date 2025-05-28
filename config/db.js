// db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/kasir', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Terhubung ke MongoDB');
    } catch (err) {
        console.error('Gagal terhubung ke MongoDB:', err);
        process.exit(1); // keluar dari proses jika gagal koneksi
    }
};

module.exports = connectDB;
