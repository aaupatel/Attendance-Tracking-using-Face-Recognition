const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/studentsImages');
    },
    filename: function (req, file, cb) {
        cb(null, `student_${Date.now()}.jpg`); // Save with .jpg extension
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Example: 5 MB file size limit
    }
});

module.exports = upload;