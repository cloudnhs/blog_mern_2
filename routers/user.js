const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const passport = require('passport');
const checkAuth = passport.authenticate('jwt', {session : false});

function tokenGenerator(payload) {
    return jwt.sign(
        payload,
        process.env.SECRET_KEY,
        {expiresIn : 36000}
    );
}

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
    const {email,password} = req.body;
    // email matching -> password matching -> return jwt
    // const newUser = new userModel
    userModel
        .findOne({email})
        .then(user => {
            if(!user){
                return res.json({
                    message : "user not found"
                });
            }else {
                user.comparePassword(password, (err, result) => {
                    console.log("comparePassword : " + result);
                    if(err || result === false) {
                        return res.json({
                            message : "password incorrect"
                        })
                    };
                    // 토큰 발행
                    const payload = {id: user._id, name: user.name, email: user.email, avatar: user.avatar};

                    //sign token
                    // const token = jwt.sign(
                    //     payload, 
                    //     process.env.SECRET_KEY,
                    //     {expiresIn: 36000}
                    // );

                    res.json({
                        message : "login successful",
                        tokenInfo : 'bearer '+ tokenGenerator(payload)
                    })
                })
                // bcrypt
                //     .compare(password, user.password)
                //     .then(isMatch => {
                //         console.log(isMatch)   
                //         if(isMatch === false){
                //             return res.json({
                //                 message : "password incorrect"
                //             })
                //         }else{
                //             // 토큰 발행
                //             const payload = {id: user._id, name: user.name, email: user.email, avatar: user.avatar};

                //             //sign token
                //             const token = jwt.sign(
                //                 payload, 
                //                 process.env.SECRET_KEY,
                //                 {expiresIn: 36000}
                //             );

                //             res.json({
                //                 message : "login successful",
                //                 tokenInfo : 'bearer '+ token
                //             })
                //         }
                //     })
                //     .catch(err => {
                //         res.json({
                //             error : err.message
                //         });
                //     });
            }
            
        })
        .catch(err =>{
            res.json({
                message : err.message
            });
        })

});

// @route GET user/current
// @desc current user
// @access Private
router.get('/current', checkAuth, (req, res) => {
    res.json({
        id : req.user.id,
        email: req.user.email,
        name: req.user.name,
        avatar: req.user.avatar
    })

});


module.exports = router;