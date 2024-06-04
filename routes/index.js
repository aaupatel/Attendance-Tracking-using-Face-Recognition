const express = require('express');
const router = express.Router();
const passport = require('passport');
const localStrategy = require('passport-local');
const userModel = require('../models/users');
const upload = require("./multer");
const users = require('../models/users');
const Student = require('../models/student');
const Attendance = require('../models/attendance');
const ExcelJS = require('exceljs');

passport.use(new localStrategy(userModel.authenticate()));

// Middleware to check if user is authenticated
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/loginfaculty');
}

// Route: Render home page
router.get('/', function(req, res, next) {
  res.render('index', { footer: false });
});

// Route to render the attendance page
router.get('/attendance',isLoggedIn, async (req, res) => {
  try {
    const user = await users.findOne({ _id: req.user._id }).populate('students');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const students = user.students;
    res.render('attendance', { footer: false, students });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route: Render dashboard with user's registered students
router.get('/dashboard', isLoggedIn, async (req, res) => {
  try {
    const user = await users.findOne({ _id: req.user._id }).populate('students');
    if (!user) {
      return res.status(404).send('User not found');
    }
    const students = user.students;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    res.render('dashboard', { footer: true, students, currentMonth, currentYear });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route: Render login page
router.get('/loginfaculty', (req, res) => {
  res.render('loginfaculty', { footer: false });
});

// Route: Render student registration form
router.get('/registerstudent', isLoggedIn, function(req, res) {
  res.render('registerstudent', { footer: true });
});

// Route: Render faculty dashboard
router.get('/facultydashboard', isLoggedIn,async function(req, res) {
  try {
    const user = await users.findOne({ _id: req.user._id }).populate('students');
    if (!user) {
      return res.status(404).send('User not found');
    }
    const students = user.students;

    res.render('facultydashboard', { footer: true, students });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route: Handle user registration
router.post('/register', function(req, res) {
  var userData = new userModel({
    username: req.body.username,
    branch: req.body.branch,
    email: req.body.email
  });

  userModel.register(userData, req.body.password)
    .then(function(registeredUser) {
      console.log('Registered User:', registeredUser);
      passport.authenticate('local')(req, res, function() {
        res.redirect('/facultydashboard');
      });
    })
    .catch(function(error) {
      console.error('Error registering user:', error);
      res.status(500).send('Failed to register user');
    });
});

// Route: faculty login
router.post('/loginfaculty', passport.authenticate('local', {
  successRedirect: '/facultydashboard',
  failureRedirect: '/loginfaculty'
}));

// Route: student registration
router.post('/registerstudent', upload.array('studentImages', 3),async (req, res) => {
  try {
    const { name, enrollmentNo } = req.body;
    const uploadedImages = req.files;

    const user = await users.findOne({ username: req.user.username });
    if (!user) {
      return res.status(404).send('User not found');
    }

    const studentImages = [];

    uploadedImages.forEach(async (file) => {
      const imageName = file.filename;
        const imagePath = `/images/studentsImages/${file.filename}`;

        studentImages.push({imageName, imagePath});
    });

    const newStudent = {
      name,
      enrollmentNo,
      images: studentImages, // Store the image path
      attendance: []
    };
    user.students.push(newStudent);
    await user.save();
    console.log(newStudent)
    res.status(200).json({ message: 'Student registered successfully'});
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to check if attendance is already marked for a student on a specific date
router.post('/attendance', async (req, res) => {
  const { studentId, currentDate, currentTime } = req.body;

  try {
    const user = await users.findOne({ 'students._id': studentId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const foundStudent = user.students.find(student => student._id.toString() === studentId);

    if (!foundStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }
    console.log(foundStudent.name);

    // Check if attendance is already marked for the current date
    const attendanceRecord = foundStudent.attendanceRecords.find(record => {
      return record.date.toDateString() === new Date(currentDate).toDateString();
    });

    if (attendanceRecord) {
      // Attendance already marked for this date
      return res.json({
        attended: true,
        message: `${foundStudent.name}'s Attendance already marked at ${attendanceRecord.time}`
      });
    } else {
      // Attendance not yet marked for this date, mark attendance
      const newAttendanceRecord = {
        date: new Date(currentDate),
        attended: true,
        time: currentTime
      };

      foundStudent.attendanceRecords.push(newAttendanceRecord);

      await user.save();

      return res.json({
        marked: true,
        message: `${foundStudent.name}'s Attendance marked successfully at ${currentTime}`
      });
    }
  } catch (error) {
    console.error('Error handling attendance request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/updateAttendance', async (req, res) => {
  const updates = req.body;
  try {
    for (const update of updates) {
      const { studentId, date, attendanceStatus } = update;
      const attended = attendanceStatus === 'P';
      
      const user = await users.findOne({ 'students._id': studentId });

      if (!user) {
        console.error(`User not found for studentId: ${studentId}`);
        continue;
      }

      const student = user.students.id(studentId);
      if (!student) {
        console.error(`Student not found for studentId: ${studentId}`);
        continue;
      }

      let attendanceRecord = student.attendanceRecords.find(record => 
        record.date.toISOString().substring(0, 10) === date.substring(0, 10)
      );

      if (attendanceRecord) {
        attendanceRecord.attended = attended;
      } else {
        student.attendanceRecords.push({
          date: new Date(date),
          attended: attended,
          time: new Date().toTimeString().split(' ')[0]
        });
      }

      await user.save();
    }
    
    res.status(200).send('Attendance updated successfully');
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).send('Error updating attendance');
  }
});

router.get('/download-attendance', isLoggedIn, async (req, res) => {
  try {
    const user = await users.findOne({ _id: req.user._id }).populate('students');
    if (!user) {
      return res.status(404).send('User not found');
    }
    const students = user.students;

    const openDaysSet = new Set();
    students.forEach(student => {
      student.attendanceRecords.forEach(record => {
        if (record.attended) {
          openDaysSet.add(record.date.toISOString().substring(0, 10));
        }
      });
    });
    const openDays = Array.from(openDaysSet).sort((a, b) => new Date(a) - new Date(b));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');

    const headers = ['Sr.', 'Name', 'Enrollment No', ...openDays.map(day => new Date(day).toLocaleDateString('en-GB')), 'Total Classes', 'Classes Attended'];
    worksheet.addRow(headers);

    students.forEach((student, index) => {
      const row = [
        index + 1,
        student.name,
        student.enrollmentNo,
      ];

      let classesAttended = 0;
      openDays.forEach(day => {
        const attendanceRecord = student.attendanceRecords.find(record => record.date.toISOString().substring(0, 10) === day);
        const attendanceStatus = attendanceRecord ? (attendanceRecord.attended ? 'P' : 'A') : 'A';
        if (attendanceStatus === 'P') {
          classesAttended++;
        }
        row.push(attendanceStatus);
      });

      row.push(openDays.length);
      row.push(classesAttended);
      worksheet.addRow(row);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating Excel file:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) {
      console.error('Error logging out:', err);
      return res.status(500).send('Failed to logout');
    }
    res.redirect('/loginfaculty');
  });
});

module.exports = router;