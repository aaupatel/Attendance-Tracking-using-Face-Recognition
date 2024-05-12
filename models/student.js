const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  name: String,
  enrollmentNo: String,
  images: [{
    imageName: String,
    imagePath: String
  }], 
  attendance: [Boolean] 
});

module.exports = mongoose.model('Student', studentSchema);
