const express = require('express');
const router = express.Router();
const passport = require('passport');
const profileModel = require('../models/profile');
const _ = require('lodash');

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
// @route GET profile/
// @desc get profile from current user route
// @access Private
router.get('/', checkAuth, (req,res)=> {
    profileModel
        .findOne({user: req.user.id})
        .then(profile => {
            if(!profile){
                return res.status(200).json({
                    message : 'profile is not registered. please register your profile'
                })
            }
            res.status(200).json(profile);

        })
        .catch(err => res.status(400).json(err));
})

// 프로필 수정
// @route PUT profile/
// @desc update profile route
// @access Private
router.put('/', checkAuth, (req,res)=> {
    // const updateFields = {
    //     user: req.user.id,
    //     introduce: req.body.introduce,
    //     company: req.body.company,
    //     website: req.body.website,
    //     location: req.body.location,
    //     status: req.body.status,
    //     gender: req.body.gender,
    //     age: req.body.age
    // }

    const updateFields = {};
    updateFields.user = req.user.id;
    if (req.body.introduce) updateFields.introduce = req.body.introduce;
    if (req.body.company) updateFields.company = req.body.company;
    if (req.body.website) updateFields.website = req.body.website;
    if (req.body.location) updateFields.location = req.body.location;
    if (req.body.status) updateFields.status = req.body.status;
    if (req.body.gender) updateFields.gender = req.body.gender;
    if (req.body.age) updateFields.age = req.body.age;

    if(typeof req.body.skills !== 'undefined'){
        updateFields.skills = req.body.skills.split(',');
    }

    profileModel
        .findOne({user: req.user.id})
        .then(profile => {
            if(!profile){
                return res.status(404).json({
                    message : 'no profile register your profile first'
                })
            }else{
                profileModel
                    .findOneAndUpdate(
                        { user: req.user.id },
                        { $set: updateFields },
                        { new: true }
                    )
                    .then(profile =>{
                        return res.status(200).json(profile);
                    })
                    .catch(err => res.status(404).json(err));
            }
        })
        .catch(err => res.status(500).json(err));



    // const id = req.user.id;

    // profileModel
        // .findOne({user: id})
        // .then(profile => {
        //     console.log('profile')
        //     if(!profile){
        //         return res.status(404).json({
        //             message : 'no profile register your profile first'
        //         })
        //     }
            //
            // const updateFields = {
            //     user: id,
            //     introduce: req.body.introduce,
            //     company: req.body.company
            //     // website: req.body.website,
            //     // location: req.body.location,
            //     // status: req.body.status,
            //     // gender: req.body.gender,
            //     // age: req.body.age
            // }
            // console.log('before :',profile);
            // profile = _.extend(profile, updateFields)
            // console.log('after :',profile);
        //
        //     profile
        //         .save()
        //         .then(profile => {
        //             console.log('profile : ', profile)
        //             res.status(200).json({
        //                 message : 'your profile updated',
        //                 profileInfo : profile
        //             })
        //         })
        //         .catch(err =>{
        //             return res.status(408).json({
        //                 error: 'Error updating your profile'
        //             });
        //         })
        //
        // } )
        // .catch(err => {
        //     res.json({
        //         message : err
        //     })
        // })
})


// 프로필 삭제

// @route DELETE profile/
// @desc delete profile route
// @access Private
router.delete('/', checkAuth, (req, res) => {
    const  id = req.user.id
      //console.log(id);


    profileModel
        .findOneAndDelete(id)
        .then(() => {
            res.json({
                message : 'your profile deleted'
            })
        })
        .catch(err => {
            res.json({
                message : err
            })
        })
})


// exp add

// @route POST profile/experience
// @desc add experience to profile route
// @access Private

router.post('/experience', checkAuth, (req, res) => {
    profileModel
        .findOne({user: req.user.id})
        .then(profile => {

            const newExp = {
                title : req.body.title,
                company : req.body.company,
                location : req.body.location,
                from : req.body.from,
                to : req.body.to,
                current : req.body.current,
                description: req.body.description
            }

            profile.experience.unshift(newExp)
            profile
                .save()
                .then(profile => {
                    res.status(200).json(profile)
                })
                .catch(err => res.status(404).json(err));


        })
        .catch(err => res.status(400).json(err));
})

// edu add

// @route POST profile/education
// @desc add education to profile route
// @access Private

router.post('/education', checkAuth, (req,res) => {
    profileModel
        .findOne({user : req.user.id})
        .then(profile => {
            const newEdu = {
                school : req.body.school,
                degree : req.body.degree,
                fieldofstudy : req.body.fieldofstudy,
                from : req.body.from,
                to : req.body.to,
                current : req.body.current,
                description: req.body.description
            }
            console.log('before:' + profile);
            profile.education.unshift(newEdu);
            console.log('after:' + profile);
            profile
                .save()
                .then(profile => {
                    res.status(200).json(profile)
                })
                .catch(err=> res.status(404).json(err))
        })
        .catch(err => res.status(400).json(err))
})

// edu delete

// @route delete profile/education
// @desc put education to profile route
// @access Private

router.delete('/education/:edu_id', checkAuth, (req, res) => {
    profileModel
        .findOne({user : req.user.id})
        .then(profile => {
            const removeIndex = profile.education
                .map(item => item.id)
                .indexOf(req.params.edu_id)
            console.log(removeIndex)
            // profile.education.splice(removeIndex, 1)
            //
            // profile
            //     .save()
            //     .then(profile => res.status(200).json(profile))
            //     .catch(err => res.status(404).json(err))

        })
        .catch(err => res.status(404).json(err))
})


module.exports = router;