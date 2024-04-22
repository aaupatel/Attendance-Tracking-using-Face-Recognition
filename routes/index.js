const express = require('express');
const router = express.Router();
const passport = require('passport');
const localStrategy = require('passport-local');
const userModel = require('../models/users');
const upload = require("./multer");
const users = require('../models/users');
// const path = require('path');
// const faceapi = require('face-api.js');

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
    const user = await users.findOne({ username: req.user.username }).populate('students');
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
    const user = await users.findOne({ username: req.user.username }).populate('students');
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
router.post('/registerstudent', upload.single('studentImage'), async (req, res) => {
  const { name, enrollmentNo } = req.body;
  const imagePath = `/images/studentsImages/${req.file.filename}`;

  try {
      // Find the user by username (assuming the user is logged in)
      const user = await users.findOne({ username: req.user.username });
      if (!user) {
          return res.status(404).send('User not found');
      }

      // Create a new student object with details and image path
      const newStudent = {
          name,
          enrollmentNo,
          image: imagePath, // Store the image path
          attendance: []
      };

      // Push the new student object into the user's students array
      user.students.push(newStudent);

      // Save the updated user object to the database
      await user.save();

      console.log('Student registered successfully:', name, enrollmentNo, imagePath);
      res.status(200).send('Student registered successfully');
  } catch (error) {
      console.error('Error registering student:', error);
      res.status(500).send('Error registering student');
  }
});

// Route: Handle user logout
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