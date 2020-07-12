const mongoose = require('mongoose');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name : {
            type : String,
            required : true
        },
        email : {
            type : String,
            required : true
        },
        password : {
            type : String,
            required : true
        },
        avatar : {  
            type : String
       },
    },
    {
        timestamps: true
    }
);


userSchema.pre("save", async function (next){
    try{
        console.log('entered');
        const avatar = await gravatar.url(this.email, {
            s : '200',
            r : 'pg',
            d : 'mm'
        });
        this.avatar = avatar;

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(this.password, salt);
        this.password = passwordHash;
        console.log('exited');
        next();
    }
    catch (error){
        next(`password 암호화 또는 아바타에서 에러발생 : ${error}`)
    }
})





module.exports = mongoose.model('user', userSchema);
