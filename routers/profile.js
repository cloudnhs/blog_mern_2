const express = require('express');
const router = express.Router();
const passport = require('passport');
const profileModel = require('../models/profile');
const checkAuth = passport.authenticate('jwt',{session:false});

// @route POST profile/
// @desc Register profile route
// @access Private

router.post('/', checkAuth ,(req,res) => {
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.introduce) profileFields.introduce = req.body.introduce;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.gender) profileFields.gender = req.body.gender;
    if (req.body.age) profileFields.age = req.body.age;

    if(typeof req.body.skills !== 'undefined'){
        profileFields.skills = req.body.skills.split(',');
    }

    profileModel
        .findOne({user: req.user.id})
        .then(profile => {
            if(profile){
                return res.json({
                    message : '등록된 프로필이 있습니다.'
                })
            }
            new profileModel(profileFields)
                .save()
                .then(profile => res.json(profile))
                .catch(err => res.json(err));
        })
        .catch(err => {
            res.json({
                message : err.models
            })
        })

});

// 접속된 프로필 불러오기 (private)
// 프로필 수정
// 프로필 삭제

module.exports = router;