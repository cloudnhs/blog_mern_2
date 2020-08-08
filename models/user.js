const mongoose = require('mongoose');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name : {
            type : String,
            required : true,
            unique : true
        },
        email : {
            type : String,
            match: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
            required : true
        },
        password : {
            type : String,
            required : true
        },
        avatar : {  
            type : String
       },
        resetPasswordLink: {
            data: String,
            default: ''
        }
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

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if(err) return err//throw err;
        // if(err || isMatch === false){
        //     cb(err)
        //}
        cb(null, isMatch);
    })
}



module.exports = mongoose.model('user', userSchema);
