const express = require('express');
const router = express.Router();
const passport = require('passport');

const checkAuth = passport.authenticate('jwt',{session:false});

// @route Post /post
// @desc Register post
// @access Private

router.post('/', (req,res) => {

})





module.exports = router;