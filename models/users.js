const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  enrollmentNo: String,
  image: String, // Add a field to store the captured Image
  attendance: [Boolean]
});


const userSchema = mongoose.Schema({
  username: String,
  branch: String,
  email: String,
  students: [studentSchema],
  password: String
});

userSchema.plugin(plm);

module.exports = mongoose.model('user',userSchema)
