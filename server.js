const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const dotEnv = require('dotenv');
const passport = require('passport');

dotEnv.config();


const userRouter = require('./routers/user');
const profileRouter = require('./routers/profile');


// database setting
require('./config/database');


// middleware setting
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

// passport middleware
app.use(passport.initialize());

// passport config
require('./config/passport')(passport);

app.use('/user', userRouter);
app.use('/profile', profileRouter);

const PORT = process.env.PORT || 7070;

app.listen(PORT, console.log(`server started at ${PORT}`));
