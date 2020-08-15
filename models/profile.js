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
        experience : [
            {
                title: {
                    type: String,
                    required: true
                },
                company: {
                    type: String,
                    required: true
                },
                location: {
                    type: String
                },
                from: {
                    type: Date,
                    required: true
                },
                to: {
                    type: Date
                },
                current: {
                    type: Boolean,
                    default: false
                },
                description: {
                    type: String
                }
            }
        ],
        education : [
            {
                school: {
                    type: String,
                    required: true
                },
                degree:{
                    type: String,
                    required: true
                },
                fieldofstudy: {
                    type: String,
                    required: true
                },
                from: {
                    type: Date,
                    required: true
                },
                to: {
                    type: Date
                },
                current: {
                    type: Boolean,
                    default: false
                },
                description: {
                    type: String
                }
            }
        ],
    },
    {
        timestamps : true
    }
);


module.exports = mongoose.model('profile', profileSchema);