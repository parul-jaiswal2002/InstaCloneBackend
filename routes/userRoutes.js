const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/UserModel')
const validator = require('validator')
const jwt = require('jsonwebtoken');


const createToken = (_id) => {    //ye jo id h ye islei send kr rhe h kyuki yhi payload h
    return jwt.sign({_id } , process.env.SECRET, {expiresIn : '3d'}) //3 args first one is payload, secret key, onption
 }


const router = express.Router();


router.post ('/signup', async (req, res) => {
    const {name, userName, password , email} = req.body;
    if(!name || !userName || !password || !email){
        return res.status(404).send({error : 'All Fields are mandatory'});
    }
    if(!validator.isEmail(email)){
        return res.status(404).send({error : 'Invalid Email'});
    }
    if(!validator.isStrongPassword(password)){
        return res.status(404).send({error : 'Password must be strong'});
    }
    try{
        const exist = await User.findOne({email});
        if(exist){
            return res.status(400).send({error: 'Email exists'});
        }
        const existUserName = await User.findOne({userName});
        if(existUserName){
            return res.status(400).send({error: 'Username exists'});
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const user =  new User({name, email, userName, password : hashedPassword});
        const user1 = await user.save();
        if(user1){
            
            return res.status(200).json({ message: 'Registration successful'});
        }
        return res.status(401).send({error: 'Server error'});
        
    }
    catch(err){
        console.log(err)
        return res.status(500).send({error: 'Registration failed'});
    }

})

router.post('/signin', async (req, res) => {
    const {email, password} = req.body;
    if(!password || !email){
        return res.status(404).send({error : 'All Fields are mandatory'});
    }
    try{
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).send({error : 'User not Registered'});
        }
        let isMatched = await bcrypt.compare(password, user.password);
        if(!isMatched){
            return res.status(404).send({error : 'Incorrect Password'});
        }
        // const {_id, name, email, userName} = user
        const token =  createToken(user._id)
        console.log({token, user})
        return res.status(200).send({token, message : 'Signed in successfully', user});

    }
    catch(err){
        return res.status(500).send({error : 'Server Error'});
    }
})






module.exports = router;
