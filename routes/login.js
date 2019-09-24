const express = require('express');
const User = require('../models/user');
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;
const CLIENT_ID = require('../config/config').CLIENT_ID;
const auth = require('../middleware/auth');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// renew token 
app.get('/newtoken', auth.verifyToken, (req, res) => {
    const token = jwt.sign({ user: req.currentUser }, SEED, { expiresIn: 14400 });
    res.status(200).json({
        success: true,
        message: 'token has been refreshed',
        data: { id: req.currentUser._id, token }
    });
});

// google authentication
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        name: payload.name,
        lastname: payload.family_name,
        picture: payload.picture,
        email: payload.email,
        google: true
    }
}

app.post('/google', async (req, res) => {
    const token = req.body.token;

    try {
        const googleUser = await verify(token);
        User.findOne({ email: googleUser.email }, (err, foundUser) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'error searching user'
                });
            }

            // validate if it is a registered user
            if (foundUser) {

                //validate if it is NOT a registered user by google sign in
                if (!foundUser.google) {
                    return res.status(400).json({
                        success: false,
                        message: 'must be used normal authentication'
                    });
                } else {
                    const token = jwt.sign({ user: foundUser }, SEED, { expiresIn: 14400 });
                    res.status(200).json({
                        success: true,
                        message: 'successful login',
                        data: { id: foundUser._id, token }
                    });
                }
            } else {
                // if is NOT a registered user then create an user with google payload auth
                const user = new User();

                user.name = googleUser.name;
                user.email = googleUser.email;
                user.img = googleUser.picture;
                user.google = true;
                user.password = 'default';

                user.save((err, savedUser) => {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: 'error saving google authenticated user on db',
                            errors: err
                        });
                    }

                    const token = jwt.sign({ user: savedUser }, SEED, { expiresIn: 14400 });
                    res.status(200).json({
                        success: true,
                        message: 'successful login',
                        data: { id: savedUser._id, token }
                    });
                });
            }
        })
    } catch (e) {
        return res.status(403).json({
            success: true,
            message: 'invalid token'
        });
    }
});

// normal authentication 
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
                message: 'login error',
                errors: { message: 'invalid credentials' }
            });
        }

        if (!bcrypt.compareSync(body.password, foundUser.password)) {
            return res.status(400).json({
                success: false,
                message: 'login error',
                errors: { message: 'invalid credentials' }
            });
        }

        // create token
        const token = jwt.sign({ user: foundUser }, SEED, { expiresIn: 14400 });

        return res.status(200).json({
            success: true,
            message: 'successful login',
            data: { id: foundUser._id, token }
        });

    });
});

module.exports = app;