const express = require('express');
const mongoose = require('mongoose');
const Post = require('../models/PostModel')
const User = require('../models/UserModel')
const requireLogin = require('../middlewares/requireLogin')


const router = express.Router();

//To get other User's profile
router.get('/:id', (req, res) => {
    const id = req.params.id
    User.findOne({_id: id}).select('-password')
    .then(user => {
        Post.find({postedBy : id})
        .populate("postedBy", "_id")
        .then(posts => {
            return res.status(200).json({user, posts})
        })
        .catch(err => {
            return res.status(500).json({error : err})
        }) 
    })
    .catch(err => console.log(err))
})


//to Follow one's profile
router.put('/follow', requireLogin, async (req, res) => {
    try {
        // First, add your user to the 'followers' array of the user you're following.
        const followedUser = await User.findByIdAndUpdate(
            req.body.followId,
            { $push: { followers: req.user._id } },
            { new: true }
        );

        // Next, add the user you're following to your 'following' array.
        const currentUser = await User.findByIdAndUpdate(
            req.user._id,
            { $push: { following: req.body.followId } },
            { new: true }
        );

        // Send a response with the updated user object.
        res.status(200).json(currentUser);
    } catch (err) {
        res.status(400).json({ error: err });
    }
});


//to unFollow one's profile
router.put('/unfollow', requireLogin, async (req, res) => {
    try {
        // First, pull your profile to the 'followers' array of the user you're following.
        const unfollowedUser = await User.findByIdAndUpdate(
            req.body.followId,
            { $pull: { followers: req.user._id } },
            { new: true }
        );

        // Next, pull the user's profile you're following to your 'following' array.
        const currentUser = await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { following: req.body.followId } },
            { new: true }
        );

        // Send a response with the updated user object.
        res.status(200).json(currentUser);
    } catch (err) {
        res.status(400).json({ error: err });
    }
});


//to upload profile pic
//$set will replace the old pic
router.post('/uploadProfilePic', requireLogin, (req, res) => {
    User.findByIdAndUpdate(req.user._id, {
        $set : {profilepic : req.body.profilepic}
    }, {
        new : true
    })
    .then((result => res.json(result)))
    .catch(err => {
        return res.status(422).json({ error: err });
    })
})
module.exports = router

