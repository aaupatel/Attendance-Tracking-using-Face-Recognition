const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  date: {
    type: Date,
    default: new Date('1990-01-01')
  },
  attended: {
    type: Boolean,
    default: false
  },
  time:String,
  holidayReason:String
});


module.exports = mongoose.model('Attendance', attendanceSchema);