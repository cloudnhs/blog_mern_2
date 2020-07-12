const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const userModel = require('../models/user');


// @route GET user/test
// @desc Test user route
// @access Public


router.get('/test', (req, res) => {
    res.json({message : 'api test'});
})

// @route POST user/register
// @desc Register user
// @access Public
router.post('/register', (req, res) => {
    

    bcrypt.genSalt(10, (err, salt) =>{
        if(err) return err;
        console.log(salt);
        bcrypt.hash(req.body.password, salt, (err, hash) => {
            if(err) return err;
            const newUser = new userModel({
                name : req.body.name,
                email : req.body.email,
                password : hash
            });
        
            newUser
                .save()
                .then(user => {
                    res.json({
                        message : "saved user data",
                        userInfo : user
                    })
                })
                .catch(err => {
                    res.json({
                        message : err.message
                    });
                });
        

        })
    })








});



// @route POST user/login
// @desc login user, return jwt
// @access Public
router.post('/login', (req, res) => {

});

// @route GET user/current
// @desc current user
// @access Private
router.get('/current', (req, res) => {

});


module.exports = router;