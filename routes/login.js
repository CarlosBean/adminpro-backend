const express = require('express');
const User = require('../models/user');
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/', (req, res, next) => {
    const body = req.body;

    User.findOne({ email: body.email }, (err, foundUser) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'error searching user'
            });
        }

        if (!foundUser || !body.password) {
            return res.status(400).json({
                success: false,
                message: 'invalid credentials',
                errors: { message: 'invalid credentials' }
            });
        }

        if (!bcrypt.compareSync(body.password, foundUser.password)) {
            return res.status(400).json({
                success: false,
                message: 'invalid credentials',
                errors: { message: 'invalid credentials' }
            });
        }

        // create token
        const token = jwt.sign({ user: foundUser }, SEED, { expiresIn: 14400 });

        res.status(200).json({
            success: true,
            message: 'successful login',
            data: { id: foundUser._id, token }
        });

    });
});

module.exports = app;