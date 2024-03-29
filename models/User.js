const mongoose = require('mongoose') ;
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    name:{
        type: String , 
    },
    email:{
        type: String ,
        unique: true,
        index : true,
        required: [true , 'Please add an email'],
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ , 'Please add a valid email']
    },
    password:{
        type: String ,
        required: [true , 'Please add a password'] ,
        minlength: 6 ,
        select: false ,
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        createdAt:{
            type: Date,
            default:Date.now
        }
    },
    role: {
        type: String ,
        enum: ['user' , 'admin'] ,
        default: 'user'
    },
    tel: {
        type: String ,
        match: [/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im]
    },
    imageurl : {
        type : String , 
        default : 'https://drive.usercontent.google.com/download?id=1ZJwdRn4YZWioLHBIpa9zTXMzAsFtcf1k&authuser=0'
    },
    reservation: {
        type: [{
            type:mongoose.Schema.ObjectId,
            ref: "Reservation"
        }]
    }

});

//Encrypt password using bcrypt
UserSchema.pre('save',async function(next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
});

//Sign JWT and return
UserSchema.methods.getSignedJwtToken=function(){
    return jwt.sign({id:this._id , type:'User'} , process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE
    });
}

//Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword , this.password) ;
}

module.exports = mongoose.model('User',UserSchema);