const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const dotEnv = require('dotenv');
const router = require("./routers/user");



dotEnv.config();


const userRouter = require('./routers/user');
const productRouter = require('./routers/product');
const bugoRouter = require('./routers/bugo');


// database setting
require('./config/database');


// middleware setting
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));


app.use('/user', userRouter);
app.use('/product', productRouter);

app.use('/bugo', bugoRouter);







const PORT = process.env.PORT || 7070;

app.listen(PORT, console.log(`server started at ${PORT}`));