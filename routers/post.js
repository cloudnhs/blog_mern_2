const express = require('express');
const router = express.Router();
const passport = require('passport');
const postModel = require('../models/post');

const checkAuth = passport.authenticate('jwt',{session:false});

// @route Post /post
// @desc Register post
// @access Private

router.post('/', checkAuth,(req,res) => {

    const newPost = new postModel({
        user : req.user.id,
        text :  req.body.text,
        name : req.user.name,
        avatar : req.user.avatar
    })
    newPost
        .save()
        .then(post => {
            res.status(200).json({
                success: true,
                postInfo: post
            })
        })
        .catch(err => {
            res.status(400).json({
                errors : err
            })
        })

})


// @route Get /post
// @desc total get post
// @access Public
router.get('/', (req,res)=>{
    postModel
        .find()
        .sort({date:-1})
        .populate("user", ["email", "avatar"])
        .then(posts => {
            if(posts.length === 0){
                return res.status(200).json({
                    message : 'there is no post. please register your post'
                })
            }
            res.status(200).json({
                count : posts.length,
                posts :  posts
            });
        })
        .catch(err => res.status(400).json(err));
})

// @route Get /post/detail
// @desc  get detail post
// @access Public
router.get('/:postid',(req,res) => {
    postModel
        .findById(req.params.postid)
        .then(post => {
            if(!post){
                return res.status(200).json({
                    message : 'there is no post yet'
                })
            }
            res.status(200).json(post);
        })
        .catch(err => res.status(400).json(err));
})


// @route delete /post
// @desc delete  post
// @access Private

router.delete('/:postid', checkAuth, (req,res) => {

    postModel
        .findById(req.params.postid)
        .then(post => {
            console.log("------------->", post)
            console.log(req.user.id);
            console.log(post.user)
            if(post.user.toString() === req.user.id ) {
                post
                    .remove()
                    .then(() => {
                        return res.json({
                            message: req.params.postid +'is deleted'
                        })
                    })
                    .catch(err => res.status(400).json(err))
                // postModel
                //     .findByIdAndDelete(req.params.postid)
                //     .then(() => {
                //         return res.json({
                //         message: req.params.postid +'is deleted'}
                //         )
                //     })
                //     .catch(err => res.status(400).json(err))
            }
            else{
                return res.json({
                    message: 'not allowed'
                })
            }
        })
        .catch(err => res.status(404).json(err))
})


module.exports = router;