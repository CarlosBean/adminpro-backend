const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;

exports.verifyToken = function (req, res, next) {
    // const token = req.query.token;
    const authHeader = req.header('Authorization');
    let token = '';

    if (authHeader) {
        token = authHeader.split(' ')[1];
    }

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

exports.verifyAdmin = function (req, res, next) {

    const user = req.currentUser;

    if (user.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(401).json({
            success: false,
            message: 'unauthorized access',
            errors: { message: 'must be admin for this operation' }
        });
    }
}

exports.verifyAdmin_or_sameUser = function (req, res, next) {

    const user = req.currentUser;
    const id = req.params.id;

    if (user.role === 'ADMIN_ROLE' || user._id === id) {
        next();
    } else {
        return res.status(401).json({
            success: false,
            message: 'unauthorized access',
            errors: { message: 'must be admin or owner info for this operation' }
        });
    }
}