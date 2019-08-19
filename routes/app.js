const express = require('express');
const app = express();

app.get('/', (req, res, next) => {
    res.status(200).json({
        success: true,
        message: 'successful request'
    })
})

module.exports = app;