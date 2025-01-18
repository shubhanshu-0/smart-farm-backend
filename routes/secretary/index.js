const express = require('express');
const router = express.Router();

const farmsInArea = require('./farmsInArea');

router.get('/' , (req , res) => {
    res.send('Welcome to Home !');
});

router.use('/farms' , farmsInArea);

module.exports = router;