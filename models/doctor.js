var mongoose = require('mongoose');
let mongooseHidden = require('mongoose-hidden')()

var Schema = mongoose.Schema;

var doctorSchema = new Schema({
    name: { type: String, required: [true, 'name is required'] },
    img: { type: String, required: false },
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    hospital: {
        type: Schema.Types.ObjectId,
        ref: 'hospital',
        required: [true, 'hospital id is required']
    }
});

doctorSchema.plugin(mongooseHidden, { hidden: { _id: false } });

module.exports = mongoose.model('doctor', doctorSchema);