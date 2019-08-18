// requires
const express = require('express');
const colors = require('colors');
const mongoose = require('mongoose');


// initialize variables
var app = express();

// connection to DB
mongoose.connect('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true },
    (err, res) => {
        if (err) throw err;
        console.log(`Database: ${'online'.green}`);
    });

//routes
app.get('/', (req, res, next) => {
    res.status(200).json({
        success: true,
        message: 'successful request'
    })
})

// listen requests
app.listen(3000, () => {
    console.log(`Express server port 3000: ${'online'.green}`);
});