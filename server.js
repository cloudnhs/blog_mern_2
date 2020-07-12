const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const dotEnv = require('dotenv');

dotEnv.config();

// database setting

require('./config/database');


// middleware setting
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));



const PORT = process.env.PORT || 7070;

app.listen(PORT, console.log("server started"));