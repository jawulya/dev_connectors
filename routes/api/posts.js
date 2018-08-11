const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Post model
const Post = require('../../models/Post');
//Profile model
const Profile = require('../../models/Profile');
//Validation
const validatePostInput = require('../../validation/post');

// @route   GET api/posts/test
// @desc    Tests posts route
// @access  Public
router.get('/test', (req, res) => {
  res.json({msg: "Posts works"})
});

// @route   POST api/posts
// @desc    Create post
// @access  Private
router.post('/',
  passport.authenticate('jwt', { session: false}),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if(!isValid){
      return res.status(400).json(errors);
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });
    newPost.save().then(post => res.json(post));
  }
);
// @route   GET api/posts
// @desc    Fetch all posts
// @access  Public
router.get('/',
  (req, res) => {
    Post.find()
    .sort({ date: -1 })
    .then(posts => res.status(200).json(posts))
    .catch(err => res.status(404).json(err));
  }  
);

// @route   GET api/posts/:post_id
// @desc    Fetch post by id
// @access  Public
router.get('/:post_id',
  (req, res) => {
    Post.findOne({ _id: req.params.post_id })
      .then(post => {
        if(!post) {
          res.status(400).json({ nopost: 'Not find post by that id'})
        }
        res.status(200).json(post);
      })
      .catch(err => res.status(404).json(err));
  }
);
// @route   DELETE api/posts/:post_id
// @desc    DELETE post by id
// @access  Private
router.delete('/:post_id',
  passport.authenticate('jwt', { session: false}),
  (req, res) => {
    Profile.findOne({ user: req.user.id})
      .then(profile => {
        Post.findById(req.params.post_id)
          .then(post => {
            //check post owner
            if(post.user.toString() !== req.user.id) {
              return res.status(401).json({ notauthorized: 'User not authorized'})
            }
            //Delete
            post.remove().then(()=> { res.json({ success: true})});
          })
          .catch(err => res.status(404).json({ postnotfound: 'Not found post'}))
      })

  }
);

// @route   POST api/posts/like/:id
// @desc    like post by id
// @access  Private
router.post('/like/:id',
  passport.authenticate('jwt', { session: false}),
  (req, res) => {
    Profile.findOne({ user: req.user.id})
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {
           // Check for post owner
           if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
              return res.status(400).json({alreadyliked: 'User already liked post'})
           }
           // add user id to like array
           post.likes.unshift({user: req.user.id})
           post.save().then(post => res.json(post));
          })
          .catch(err => res.status(404).json({ postnotfound: 'Not found post'}))
      })

  }
);
// @route   POST api/posts/unlike/:id
// @desc    unlike post by id
// @access  Private
router.post('/unlike/:id',
  passport.authenticate('jwt', { session: false}),
  (req, res) => {
    Profile.findOne({ user: req.user.id})
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {
           // Check for post owner
           if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
              return res.status(400).json({ notliked: 'You have not like this post' })
           }
           // Get remove index
           const removeIndex = post.likes
           .map(item => item.user.toString())
           .indexOf(req.user.id);
           //splice out of array
           post.likes.splice(removeIndex, 1);
           //save
           post.save().then(post => res.json(post));
          })
          .catch(err => res.status(404).json({ postnotfound: 'Not found post'}))
      })

  }
);

// @route   POST api/posts/comment/:id
// @desc    Add comment to post
// @access  Private

router.post('/comment/:id',
  passport.authenticate('jwt', { session: false}),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    //check validation
    if(!isValid){
      //if any errors return error
      return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
      .then(post => {
        const newComment ={
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        }
        // Add to comments array
        post.comments.unshift(newComment);
        post.save().then(post => res.json(post))
      })
      .catch(err => res.json({postnotfound: 'No post found'}))
  }
);

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Delete comment from post
// @access  Private

router.delete('/comment/:id/:comment_id',
  passport.authenticate('jwt', { session: false}),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        //check to see if comment exist
        if (post.comments.filter(comment => comment._id.toString() ===req.params.comment_id)
        .length === 0) { 
          return res.status(404).json({ commentnotexist: 'Comment not exist'})
        }
        const removeIndex = post.comments
        .map(comment => comment._id.toString)
        .indexOf(req.params.comment_id);

        // Splice comment out from aaray
        post.comments.splice(removeIndex, 1);
        post.save().then(post => res.json(post));
      })
      .catch(err => res.json({postnotfound: 'No post found'}))
  }
);





module.exports = router;