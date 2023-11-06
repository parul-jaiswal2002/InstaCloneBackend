const mongoose = require('mongoose');
const User = require('../models/UserModel');
const jwt = require('jsonwebtoken')
const SECRET = process.env.SECRET


module.exports = (req, res, next) => {
    const {authorization} = req.headers;
    if(!authorization) {
        return res.status(403).json({error: 'You must be logged in'})
    }
    const token = authorization.split(" ")[1] 
    try{
        jwt.verify(token, SECRET, (err, payload) => {
            if(err){
                return res.status(403).json({error: 'You must be logged in'}) 
            }
            const {_id} = payload;
            User.findById(_id).then((userData) => {
                req.user = userData
                next()
            });
        })
    }
    catch(err){
        console.log(err)
        res.status(401).json({error : " Request is not authorized"})
    }
  
}