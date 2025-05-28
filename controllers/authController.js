const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const authController = {
    // Tampilkan halaman register
    getRegister: (req, res) => {
        res.render('register');
    },

    // Tampilkan halaman login
    getLogin: (req, res) => {
        res.render('login');
    },

    // Proses registrasi
    register: async (req, res) => {
        try {
            const { nama, alamat, telepon, username, password } = req.body;
            const name = nama;

            // Cek apakah username sudah digunakan
            const existingUser = await User.findOne({ "akun.username": username });
            if (existingUser) {
                return res.status(400).send("Username sudah digunakan");
            }

            // Cek apakah telepon sudah digunakan
            const existingTelepon = await User.findOne({ telepon });
            if (existingTelepon) {
                return res.status(400).send("Nomor telepon sudah digunakan");
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Buat user baru dengan role default 'pengguna'
            const newUser = new User({
                name,
                alamat,
                telepon,
                akun: {
                    username,
                    password: hashedPassword,
                    role: 'pengguna'
                }
            });

            await newUser.save();

            // Simpan data login ke session (login otomatis)
            req.session.user = {
                id: newUser._id,
                username: newUser.akun.username,
                role: newUser.akun.role
            };

            // Redirect sesuai role
            switch (newUser.akun.role) {
                case 'admin':
                case 'petugas':
                    res.redirect('/produk');
                    break;
                case 'pengguna':
                default:
                    res.redirect('/produk/pengguna');
            }

        } catch (error) {
            console.error(error);
            res.status(500).send("Terjadi kesalahan saat registrasi");
        }
    },

    // Proses login
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            // Cari user berdasarkan username
            const user = await User.findOne({ "akun.username": username });
            if (!user) {
                return res.status(400).send("Username atau password salah");
            }

            // Bandingkan password
            const validPassword = await bcrypt.compare(password, user.akun.password);
            if (!validPassword) {
                return res.status(400).send("Username atau password salah");
            }

            // Simpan ke session
            req.session.user = {
                id: user._id,
                username: user.akun.username,
                role: user.akun.role
            };

            // Redirect sesuai role
            switch (user.akun.role) {
                case 'admin':
                case 'petugas':
                    res.redirect('/produk');
                    break;
                case 'pengguna':
                default:
                    res.redirect('/produk/pengguna');
            }

        } catch (error) {
            console.error(error);
            res.status(500).send("Terjadi  saat login");
        }
    },

    // Proses logout
    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Terjadi kesalahan saat logout");
            }
            res.redirect("/auth/login");
        });
    },
};

module.exports = authController;
