const express = require('express');
const bodyParser = require('body-parser')
const User = require('../models/user');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

const app = express();

const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// get all users
app.get('/', (req, res, next) => {

    let from = req.query.from || 0;
    from = Number(from);

    User.find({})
        .skip(from)
        .limit(5)
        .exec((err, users) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'error loading users'
                });
            }

            User.countDocuments({}, (err, total) => {
                res.status(200).json({
                    success: true,
                    message: 'successful users',
                    data: users,
                    total
                });
            });

        });
})

// create user
app.post('/', (req, res) => {
    const body = req.body;

    const user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    user.save((err, savedUser) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: 'error create user',
                errors: err
            });
        }

        res.status(201).json({
            success: true,
            message: 'successful create',
            data: savedUser
        });
    });
});

// update user
app.put('/:id', [auth.verifyToken, auth.verifyAdmin_or_sameUser], (req, res) => {
    const id = req.params.id;
    const body = req.body;

    User.findById(id, (err, foundUser) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'error searching user'
            });
        }

        if (!foundUser) {
            return res.status(400).json({
                success: false,
                message: `user with id ${id} is not exist`,
                errors: { message: 'user not exist' }
            });
        }

        foundUser.name = body.name;
        foundUser.email = body.email;
        foundUser.role = body.role || foundUser.role;

        foundUser.save((err, savedUser) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: 'error update user',
                    errors: err
                });
            }

            const token = jwt.sign({ user: savedUser }, SEED, { expiresIn: 14400 });
            res.status(200).json({
                success: true,
                message: 'successful update',
                data: { token }
            });
        })
    });
});


app.delete('/:id', [auth.verifyToken, auth.verifyAdmin], (req, res) => {
    const id = req.params.id;

    User.findByIdAndRemove(id, (err, deletedUser) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'error delete user'
            });
        }

        if (!deletedUser) {
            return res.status(400).json({
                success: false,
                message: `user with id ${id} is not exist`,
                errors: { message: 'user not exist' }
            });
        }

        res.status(200).json({
            success: true,
            message: 'successful delete',
            data: deletedUser
        });
    });
});

module.exports = app;