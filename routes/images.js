const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.get('/:collection/:img', (req, res) => {

    const collection = req.params.collection;
    const img = req.params.img;

    const imagePath = path.resolve(__dirname, `../uploads/${collection}/${img}`);
    const noImagePath = path.resolve(__dirname, `../assets/no-img.jpg`);

    fs.existsSync(imagePath) ? res.sendFile(imagePath) : res.sendFile(noImagePath);
});

module.exports = app;