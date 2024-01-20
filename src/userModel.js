const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    firstname: {type: String, required: true, minlength: 3},
    lastname: {type: String, required: true, minlength: 3},
    dateOfBirth: {type: Date},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, minlength: 6},
    dialingCode: {type: Number},
    phone: {type: String},
    country: {type: String, required: true}



});

userSchema.pre("save", function(next){
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, (err, salt) => {
        if(err){
            console.log("Error generating salt: ", err);
            return next(err);
        }

        bcrypt.hash(this.password, salt, (err, hashedPassword) => {
            if(err){
                console.log("Error hashing password: ", err);
                return next(err);
            }
             this.password=hashedPassword;
             next();
             
        })
    })
    
})

const User = mongoose.model('User', userSchema);

module.exports = User