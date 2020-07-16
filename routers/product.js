const express = require('express');
const router = express.Router();

const productModel = require('../routers/product');

// @route GET product 
// @desc all product
// @access Public

router.get('/', (req,res) => {
    res.json({
        message : 'Product were fetched'
    });
})

// @route POST product/register
// @desc product register
// @access Public

router.post('/register', (req, res) => {
    const newProduct = new productModel({
        name : req.body.productName,
        price : req.body.productPrice
    });

    newProduct
        .save()
        .then(result => {
            res.json({
                message : 'saved data',
                productInfo : result
            })
        })
        .catch(err => {
            res.json({
                error : err.message
            });
        });
});

// @route PATCH product/
// @desc product update
// @access Public



// @route DELETE product/
// @desc product delete
// @access Public



module.exports = router;