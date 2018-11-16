var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ExternalsSchema = new Schema({
    mikve: Boolean,
    parking:Boolean,
    disabled_access:Boolean,
    shtiblach:Boolean,
});

var MinyanSchema = new Schema({
    minyan: String,
    hour: String,
    hour_float: Number,
    days: [Number],
    last_verified_at: Date
});

var LessonSchema = MinyanSchema;

var SynagogueSchema = new Schema({
    name: String,
    address: String,
    location: fields.PointField(blank=True),
    nosach: String,
    phone_number: String,
    externals: ExternalsSchema,
    minyans: [MinyanSchema],
    lessons: [LessonSchema],
    image: String,
    comments: String
});

module.exports = new mongoose.model('Synagogue', SynagogueSchema);