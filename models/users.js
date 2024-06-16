const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
const Student = require('./student');

const userSchema = new mongoose.Schema({
  username: String,
  branch: String,
  email: String,
  //students: [Student.schema],
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  password: String
});

userSchema.plugin(plm);

module.exports = mongoose.model('user',userSchema);