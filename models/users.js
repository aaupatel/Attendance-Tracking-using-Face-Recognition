const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');
const Schema = mongoose.Schema;
const Student = require('./student');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/streaktrack', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

const userSchema = new Schema({
  username: String,
  branch: String,
  email: String,
  students: [Student.schema], 
  password: String
});

userSchema.plugin(plm);

module.exports = mongoose.model('user',userSchema);