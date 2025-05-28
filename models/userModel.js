const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    alamat: String,
    telepon: { type: String, unique: true },
    akun: {
        username: { type: String, unique: true },
        password: String,
        role: { type: String, default: 'user' }
    }
});

module.exports = mongoose.model('User', userSchema);
    