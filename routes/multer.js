const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/studentsImages');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = `${Math.round(Math.random() * 1E9)}`;
        cb(null, `student_${uniqueSuffix}-${Date.now()}.jpg`); // with .jpg extension
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB file size limit
    }
});

module.exports = upload;