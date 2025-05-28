const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img');
    },
    filename: function (req, file, cb) {
        const safeName = file.originalname
            .replace(/\s+/g, '-')       // ganti spasi jadi tanda hubung
            .replace(/[^\w.-]/g, '')    // hapus karakter aneh
            .toLowerCase();
        cb(null, Date.now() + '-' + safeName);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
