const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const passport = require('passport');
const sgMail = require('@sendgrid/mail');
const _ = require('lodash');

const checkAuth = passport.authenticate('jwt', {session : false});
sgMail.setApiKey(process.env.EMAIL_KEY);

const tokenGenerator = (payload, time) => {
    return jwt.sign(
        payload,
        process.env.SECRET_KEY,
        {expiresIn : time}
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
             }else{
                 // send email
                 const payload = {name, email, password}
                 const token = tokenGenerator(payload, "10m")

                 const emailData = {
                     from: process.env.EMAIL_FROM,
                     to: email,
                     subject: 'Account activation link',
                     html: `
                        <h1>Please use the following to activate your account</h1>
<!--                        <input type="button" onclick="window.open('http://localhost:3000/user/activate/${token}')" value="confirm">-->
                        <p>http://localhost:3000/user/activate/${token}</p>
                        <hr />
                        <p>This email may contain sensetive information</p>
                        <p>http://localhost:3000</p> 
                     `
                 }

                 sgMail
                     .send(emailData)
                     .then(() => {
                         res.status(200).json({
                             message: `Email has been sent to ${email}`
                         })
                     })
                     .catch(err => {
                         res.status(400).json({
                             success: false,
                             error: err
                         });
                     });


             }

        })
        .catch(err => {
            res.json({
                message : err.message
            });
        })
    

    



});

// @route POST user/activation
// @desc Activation account / confirm email
// @access Private
router.post('/activation', (req, res) => {
    const { token } = req.body;

    if(token) {
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if(err){
                return res.status(401).json({
                    errors: 'Expired link. Signup again'
                });
            }else{
                const {name, email, password} = jwt.decode(token)
                const newUser = new userModel({
                    name : name,
                    email : email,
                    password : password
                })
                newUser
                    .save()
                    .then(user => {
                        res.status(200).json({
                            success: true,
                            userInfo: user
                        })
                    })
                    .catch(err => {
                        res.status(400).json({
                            errors : err
                        })
                    })
            }
        })
    }
})



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
                        tokenInfo : 'bearer '+ tokenGenerator(payload, "7d")
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


// @route PUT user/forgotpassword
// @desc forgot password / send email
// @access Private

router.put('/forgotpassword', (req,res) => {
    const { email } = req.body;

    userModel
        .findOne({email})
        .then(user => {
            const payload = { _id: user._id };
            const token = tokenGenerator(payload, '20m');

            const emailData = {
                from: process.env.EMAIL_FROM,
                to: email,
                subject: "Password Reset Link",
                html: `
                <h1>Please use the following link to reset your password</h1>
                <p>http://localhost:3000/user/password/reset/${token}</p>
                <hr />
                <p>This email may contain sensetive information</p>
                <p>http://localhost:3000</p>
                `
            }

            return user
                .updateOne({ resetPasswordLink: token})
                .then(() => {
                    sgMail
                        .send(emailData)
                        .then(() => {
                            res.status(200).json({
                                message: `Email has been sent to ${email}. Follow the instruction to activate your account`
                            })
                        })
                        .catch(err => {
                            return res.status(404).json({
                                message: err.message
                            })
                        })
                })
                .catch(err => {
                    res.status(400).json({
                        error : 'Database connection error on user password forgot request'
                    })

                })

        })
        .catch(err => {
            res.status(500).json({
                error : err
            })
        })
})

// @route PUT user/resetpassword
// @desc reset password
// @access Private
router.put('/resetpassword', (req,res) => {
    const {resetPasswordLink, newPassword} = req.body;

    console.log(resetPasswordLink);

    if(resetPasswordLink){
        jwt.verify(resetPasswordLink, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(400).json({
                    error : 'Expired Link. Try again'
                });
            }else{
                userModel
                    .findOne({resetPasswordLink})
                    .then(user => {
                        const updateFields = {
                            password: newPassword,
                            resetPasswordLink: ''
                        }
                        console.log('before :', user)
                        // user
                        //     .findByIdAndUpdate(
                        //         user._id,
                        //         {$set: updateFields},
                        //         {new: true}
                        //     )
                        //     .then(user => {
                        //         res.status(200).json({
                        //             message : 'Great! Now you can login with new password'
                        //         })
                        //     })

                        user = _.extend(user, updateFields);
                        console.log('after :',user);

                        user
                            .save()
                            .then(user => {
                                res.status(200).json({
                                    message : 'Great! Now you can login with new password',
                                    userInfo : user
                                })
                            })
                            .catch(err =>{
                                return res.status(408).json({
                                    error: 'Error resetting user password'
                                });
                            })

                    })
                    .catch(err => {
                        return res.status(404).json({
                            error : 'Something went wrong. Try later'
                        })
                    })
            }
        })
    }
})


module.exports = router;