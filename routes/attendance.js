const express = require('express');
const router = express.Router();
const users = require('../models/users')
const Student = require('../models/student');
const sendWhatsAppMessage = require('../sendMessage');

// Function to check attendance and send WhatsApp messages
async function checkAttendance() {
    try {
        const user = await users.findOne().populate('students');
        if (!user) {
            console.error('User not found');
            return;
        }
        const students = user.students;

        // Set the date to the previous day
        const previousDay = new Date();
        previousDay.setDate(previousDay.getDate() - 1);
        previousDay.setHours(0, 0, 0, 0); // Set to midnight for comparison

        let attendanceMarked = false;

        students.forEach(student => {
            student.attendanceRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
            const lastRecord = student.attendanceRecords.find(record => {
                const recordDate = new Date(record.date);
                return recordDate.getFullYear() === previousDay.getFullYear() &&
                       recordDate.getMonth() === previousDay.getMonth() &&
                       recordDate.getDate() === previousDay.getDate();
            });

            if (lastRecord) {
                attendanceMarked = true;
                const isPresent = lastRecord.attended ? 'Present' : 'Absent';
                //console.log(`${student.name} was ${isPresent} on ${previousDay.toDateString()}`);
            }else{
                const parentMessage = `Dear ${student.parentName},\nThis is to inform you that your child, ${student.name}, was absent on ${previousDay.toDateString()}. Please ensure your child attends the classes regularly. For any queries, feel free to contact the administration.\n\nSincerely,\nSATI College\nVidisha`;
                //console.log(parentMessage);
                //sendWhatsAppMessage(student.parentContactNo, parentMessage);
                const studentMessage = `Dear ${student.name},\nYour attendance has been marked as Absent on ${previousDay.toDateString()}. Please ensure you attend the classes regularly to avoid any academic issues.\n\nSincerely,\nSATI College\nVidisha`;
                //console.log(studentMessage);
                //sendWhatsAppMessage(student.studentContactNo, studentMessage);
            }
        });

        if (!attendanceMarked) {
            console.log(`No attendance marked for any student on ${previousDay.toDateString()}`);
        }
    } catch (error) {
        console.error('Error checking attendance:', error);
    }
}

router.get('/check-attendance', async (req, res) => {
    try {
        await checkAttendance();
        res.send('Attendance checked and messages sent.');
    } catch (error) {
        console.error('Error checking attendance:', error);
        res.status(500).send('Error checking attendance.');
    }
});

module.exports = {
  router,
  checkAttendance 
};