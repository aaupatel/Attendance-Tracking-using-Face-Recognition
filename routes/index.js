const express = require('express');
const router = express.Router();
const passport = require('passport');
const localStrategy = require('passport-local');
const userModel = require('../models/users');
const upload = require("./multer");
const users = require('../models/users');

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
    res.render('attendance', { footer: false, students }); // Pass students data to attendance.ejs
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

    res.render('dashboard', { footer: true, students });
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
router.get('/facultydashboard', isLoggedIn, function(req, res) {
  res.render('facultydashboard', { footer: true });
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