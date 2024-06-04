const mongoose = require('mongoose');
const attendance = require('./attendance').schema;
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  name: String,
  enrollmentNo: String,
  images: [{
    imageName: String,
    imagePath: String
  }],
  attendanceRecords: [attendance],
});

module.exports = mongoose.model('Student', studentSchema);
