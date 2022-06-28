const mongoose = require('mongoose');

const signUpSchema = new mongoose.Schema({
    fname:{
        type: String,
        required: true
    },
    lname:{
        type: String,
        required: true
    },
    age:{
        type: Number,
        required: true
    },
    gender:{
        type : String,
        required: true
    },
    email:{
        type:String,
        required:true,
        unique : [true,"This email is already in use"]
    },
    password:{
        type : String,
        required : true
    },
    conPassword:{
        type:String,
        required:true
    }
});

const Register = new mongoose.model("signup",signUpSchema);
module.exports = Register;