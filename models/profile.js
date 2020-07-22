const mongoose = require('mongoose');
const schema = mongoose.Schema;

const profileSchema = new schema(
    {
        user : {
            type : schema.Types.ObjectId,
            ref : 'user',
            requried: true
        },
        introduce : {
            type : String,
            required: true,
            max : 40
        },
        company : {
            type : String
        },
        website : {
            type : String
        },
        location : {
            type : String
        },
        status : {
            type : String,
            required : true
        },
        skills : {
            type : [String],
            required : true
        },
        gender : {
            type : Boolean,
            default : true
        },
        age : {
            type : Number
        },
        experience : [],
        education : [],
    },
    {
        timestamps : true
    }
);


module.exports = mongoose.model('profile', profileSchema);