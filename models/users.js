const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
const Schema = mongoose.Schema;
const Student = require('./student');

const userSchema = new Schema({
  username: String,
  branch: String,
  email: String,
  students: [Student.schema], 
  password: String
});

userSchema.plugin(plm);

module.exports = mongoose.model('user',userSchema);