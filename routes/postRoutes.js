const express = require('express');
const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const Post = require('../models/PostModel')

const router = express.Router();

//for getting all posts

router.get('/allPosts' ,requireLogin, async (req, res) => {
    let posts = await Post.find()
               .populate('postedBy', '_id name profilepic')
               .populate("comments.postedBy", "_id name")
               .sort("-createdAt")
    res.status(200).json(posts)

})

//for Create a new post
router.post('/createPost',requireLogin, async (req, res) => {
    const {body, photo} = req.body;
    if(!photo || !body){
        return res.status(422).json({error : 'All fields are required'})
    }
    req.user
    try{
        let post = new Post({ body, photo, postedBy : req.user})
         post  = await post.save() ;
        if(!post){
            return res.status(200).json({error : "Can't Post this"})
        }
        return res.status(200).json({post})
    }
    catch(error){
        console.log(error)
        return res.status(422).json({error : 'Server Error'});
    }

})

//For getting one's profiles' posts
router.get('/myposts', requireLogin, (req, res) => {
    Post.find({postedBy: req.user._id})
    .populate('postedBy', "_id name").populate("comments.postedBy", "_id name").sort("-createdAt")
    .then((myposts) => res.json(myposts) )
})

//like and unlike a post (like Update)
//PUT it is preferred to use exec as a callback it is same as the .then
router.put('/like', requireLogin, (req, res) => {
     Post.findByIdAndUpdate(req.body.postId, {
        $push : {likes : req.user._id}
     },{
        new : true    //so that the update is new
     }).populate('postedBy', '_id name profilepic')
     .then(result => res.status(200).json(result))
     .catch(err => console.error(err) )
})

//Unlike a post
router.put('/unlike', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
       $pull : {likes : req.user._id}
    },{
       new : true    //so that the update is new
    }).populate('postedBy', '_id name profilepic')
    .then(result => res.status(200).json(result))
    .catch(err => console.error(err) )
})

//Api for making comments on a post
router.put('/comments', requireLogin, (req, res) => {
    let commentObj = {
        comment : req.body.text,
        postedBy : req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId, {
        $push : {comments: commentObj}
    },
    {
        new  : true
    })
    .populate('postedBy', '_id name profilepic').populate("comments.postedBy", "_id name")
    .then(result => {
        console.log(result)
        res.status(200).json(result)})
     .catch(err => console.error(err) )
})


//API to delete a post
router.delete('/deletePost/:postId',requireLogin, (req, res) => {
    //we are using more security that's why we populate the postedBy to check wheter the user who is posted the post is deleting 

     Post.findOne({_id : req.params.postId})
     .populate('postedBy', '_id')
     .then(post => {
        // console.log(res.postedBy._id, req.user._id)
        // We can't compare two same objects directly because their memory refrences are different
        if(post.postedBy._id.toString() == req.user._id.toString()) {
            post.deleteOne()
            .then(result => {
                return res.status(200).json({message: 'Successfully deleted'})
            })
            .catch(err => console.log(err))
        }
        else{
            return res.status(400).json({error : "You can't delete this post"})
        }
     })
     .catch(err => console.error(err))

})

//Api for showing myFollowing postss

router.get('/myfollowingPosts', requireLogin, (req,res) => {
    //here we use $in using this in the following array's all id's = postedBy id's then it will return all those posts
    Post.find({postedBy : {$in : req.user.following}})
    .populate("postedBy", "_id name profilepic")
    .populate("comments.postedBy", "_id name")
    .then((posts) => {res.json(posts)})
    .catch((err) => console.log(err))
})






module.exports = router;