const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;

exports.verifyToken = function (req, res, next) {
    const token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'unauthorized access',
                errors: err
            });
        }

        req.currentUser = decoded.user;
        next();
    })
}