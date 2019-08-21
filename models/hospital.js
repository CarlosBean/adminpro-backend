const mongoose = require('mongoose');
let mongooseHidden = require('mongoose-hidden')()

const Schema = mongoose.Schema;

const hospitalSchema = new Schema({
    name: { type: String, required: [true, 'name is required'] },
    img: { type: String, required: false },
    user: { type: Schema.Types.ObjectId, ref: 'user' }
});

hospitalSchema.plugin(mongooseHidden, { hidden: { _id: false } });

module.exports = mongoose.model('hospital', hospitalSchema);