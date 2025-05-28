const express = require('express');
const app = express(); 
const path = require('path');
const session = require('express-session');
const connectDB = require('./config/db');
const User = require('./models/userModel');
const penjualanRoutes = require('./routes/penjualanRoutes');
const bcrypt = require('bcrypt');
require('dotenv').config();

const port = process.env.PORT || 3000;

const authRoutes = require('./routes/authRoutes');
const produkRoutes = require('./routes/produkRoutes');

// Middleware parsing (pindahkan ke sini)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine & static
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
    secret: 'rahasia',
    resave: false,
    saveUninitialized: false
}));

// Routes
app.use("/", require("./routes/penjualanRoutes"));
app.use('/produk', produkRoutes);
app.use('/penjualan', penjualanRoutes);
app.use("/auth", authRoutes);
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.get("/", (req, res) => {
    res.redirect("/auth/login");
});

// DB Connection + Akun default
connectDB().then(() => {
    console.log("✅ Terhubung ke MongoDB");
    buatAkunDefault();
});

// Buat akun default
async function buatAkunDefault() {
    const defaultUsers = [
        {
            name: 'Admin Utama',
            alamat: 'Kantor Pusat',
            telepon: '081111111111',
            akun: {
                username: 'admin',
                password: 'admin123',
                role: 'admin'
            }
        },
        {
            name: 'Petugas Gudang',
            alamat: 'Gudang',
            telepon: '082222222222',
            akun: {
                username: 'petugas',
                password: 'petugas123',
                role: 'petugas'
            }
        }
    ];

    for (const userData of defaultUsers) {
        const existing = await User.findOne({ "akun.username": userData.akun.username });
        if (!existing) {
            const hashedPassword = await bcrypt.hash(userData.akun.password, 10);
            userData.akun.password = hashedPassword;
            await User.create(userData);
            console.log(`✅ Akun '${userData.akun.username}' berhasil dibuat`);
        } else {
            console.log(`ℹ️  Akun '${userData.akun.username}' sudah ada`);
        }
    }
}

app.listen(port, () => {
    console.log(`🚀 Server berjalan di http://localhost:${port}`);
});
