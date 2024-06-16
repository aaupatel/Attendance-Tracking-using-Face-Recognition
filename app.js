require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const cron = require('node-cron');
const expressSession = require('express-session');

const indexRouter = require('./routes/index');
const usersRouter = require('./models/users');
const checkAttendance = require('./routes/attendance').checkAttendance;

// Schedule the checkAttendance function to run every day at 7:00 PM
cron.schedule('0 19 * * *', () => {
    checkAttendance();
});
// for every 1 minutes
// cron.schedule('*/1 * * * *', () => {
//   checkAttendance();
// });

const app = express();

const uri = process.env.DATABASE_URL;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected', uri))
.catch(err => console.error('MongoDB connection error:', err));
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET || 'defaultsecret'
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/public', express.static('public'));

app.use(passport.initialize())
app.use(passport.session())
app.use(express.json());
passport.serializeUser(usersRouter.serializeUser())
passport.deserializeUser(usersRouter.deserializeUser())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/routes', express.static('routes'));
app.use('/models', express.static(path.join(__dirname, 'models')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
