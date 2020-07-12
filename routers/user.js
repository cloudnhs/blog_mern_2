const express = require('express');
const router = express.Router();
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

    const {name, email, password} = req.body;

    // email matching -> password 암호화 -> database 저장
    userModel
        .findOne({email})
        .then(user => {
            if(user){
                return res.json({
                    message : 'email exists'
                })
            }
            userModel
                .findOne({name})
                .then(user => {
                    if(user){
                        return res.json({
                            message : 'name exists'
                        })
                    }

                    const newUser = new userModel({
                        name,
                        email,
                        password
                    });

                    newUser
                        .save()
                        .then(user => {
                            res.json({
                                message : "Successful newuser",
                                userInfo : user
                            });
                        })
                        .catch(err => console.log(err));

                    // const avatar = gravatar.url(req.body.email, {
                    //     s: '200',
                    //     r: 'pg',
                    //     d: 'mm'
                    // });
        
                    // bcrypt.genSalt(10, (err, salt) =>{
                    //     if(err) return err;
                    //     console.log(salt);
                    //     bcrypt.hash(req.body.password, salt, (err, hash) => {
                    //         if(err) return err;
                    //         const newUser = new userModel({
                    //             name : req.body.name,
                    //             email : req.body.email,
                    //             password : hash,
                    //             avatar : avatar
                    //         });
                        
                    //         newUser
                    //             .save()
                    //             .then(user => {
                    //                 res.json({
                    //                     message : "saved user data",
                    //                     userInfo : user
                    //                 })
                    //             })
                    //             .catch(err => {
                    //                 res.json({
                    //                     message : err.message
                    //                 });
                    //             });
                        
                
                    //     })
                    // })
                })
                .catch(err => {
                    res.json({
                        message : err.message
                    })
                })
            

        })
        .catch(err => {
            res.json({
                message : err.message
            });
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