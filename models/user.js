const moongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
let mongooseHidden = require('mongoose-hidden')()

const Schema = moongoose.Schema;

const acceptedRoles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} is not allowed'
};

const userSchema = new Schema({
    name: { type: String, required: [true, 'name is required'] },
    email: { type: String, unique: true, required: [true, 'email is required'] },
    password: { type: String, required: [true, 'password is required'] },
    img: { type: String, required: false },
    role: { type: String, required: false, default: 'USER_ROLE', enum: acceptedRoles },
    google: { type: Boolean, default: false }
});

userSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' });
userSchema.plugin(mongooseHidden, { hidden: { _id: false, password: true } });

module.exports = moongoose.model('user', userSchema);