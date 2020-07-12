const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");


// database setting


const dbAddress = "mongodb+srv://admin:admin@cluster0.b6cyc.mongodb.net/blog_exercise?retryWrites=true&w=majority";
const options = {
     useNewUrlParser: true,
     useUnifiedTopology: true 
}

mongoose
    .connect(dbAddress, options)
    .then(() => console.log("MONGODB connected..."))
    .catch(err => console.log(err.message));

// middleware setting
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));



const PORT = 9090;

app.listen(PORT, console.log("server started"));