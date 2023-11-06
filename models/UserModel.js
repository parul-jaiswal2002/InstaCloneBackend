const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name:{
        type: 'string',
        required: true
    },
    userName:{
        type: 'string',
        required: true
    },
    email:{
        type: 'string',
        required: true
    },
    password:{
        type: 'string',
        required: true
    },
    profilepic : {
        type : 'String'
    },
    followers : [{type : ObjectId, ref: 'User'}],
    following : [{type : ObjectId, ref: 'User'}]
}, {timestamps:true})

module.exports = mongoose.model('User', userSchema);