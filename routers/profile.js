const express = require('express');
const router = express.Router();
const passport = require('passport');
const checkAuth = passport.authenticate('jwt',{session:false});

// @route POST profile/
// @desc Register profile route
// @access Private

router.post('/', checkAuth ,(req,res) => {

});



module.exports = router;