const express = require('express');
const mongodb = require('mongodb');

const db = require('../data/database');

const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.get('/', function(req, res) {
  res.redirect('/posts');
});

router.get('/posts', async function(req, res) {
  const posts = await db
   .getDb()
   .collection('posts')
   .find({})
   .project({ title: 1, summary: 1, 'author.name': 1 })
   .toArray();
  res.render('posts-list', { posts: posts });
});

router.get('/new-post', async function(req, res) {
  const authors = await db.getDb().collection('authors').find().toArray();
  res.render('create-post', { authors: authors });
});

router.post('/posts',async function(req, res){
  const authorId = new ObjectId(req.body.author);
  const author = await db.getDb().collection('authors').findOne({_id: authorId});

  const newPost = {
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content,
    date: new Date(),
    author: {
      id: authorId,
      name: author.name,
      email: author.email
    }
  };

  const result = await db.getDb().collection('posts').insertOne(newPost);
  console.log(result);
  res.redirect('/posts');
});

router.get('/posts/:id', async function(req,res,next){
  let postId = req.params.id;

  try{
    postId = new ObjectId(postId)
  }
  catch(error){
    res.status(404).render('404');
    // return next(error);
  }
  const post = await db
    .getDb()
    .collection('posts')
    .findOne({_id: postId},{ summary: 0 });

  if(!post){
    return res.status(404).render('404');
  }

  post.humanReadableDate = post.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  post.date = post.date.toISOString();
  res.render('post-detail', { post: post })
});

router.get('/posts/:id/edit', async function(req, res){
  const postId = req.params.id;
  const post = await db
    .getDb()
    .collection('posts')
    .findOne({_id: new ObjectId(postId)},{ title: 1, summary: 1, body: 1 });
  
  if(!post){
    return res.status(404).render('404');
  }
  res.render('update-post', { post: post });
});

router.post('/posts/:id/edit', async function(req, res){
  const postId = new ObjectId(req.params.id);
  const result = await db.getDb()
    .collection('posts')
    .updateOne(
      {_id: postId},
      { 
        $set: {
          title: req.body.title,
          summary: req.body.summary,
          body: req.body.content,
          // date: new Date()
        },
      } 
    );

  res.redirect('/posts');
});

router.post('/posts/:id/delete', async function(req, res){
  const postId = new ObjectId(req.params.id);
  const result = await db
    .getDb()
    .collection('posts')
    .deleteOne({_id: postId});
  res.redirect('/posts')
});

router.get('/new-author',async function(req,res){
  res.render('create-author');
});

router.post('/new-author',async function(req,res){
  const newAuthor = {
    name: req.body.name,
    email: req.body.email
  };

  const result = db.getDb().collection('authors').insertOne(newAuthor);
  res.redirect('/posts');
});

module.exports = router;
/*
we added "projection" to only fetch selected fields from the database - this was done via:

... // other code
.find({}, { title: 1, summary: 1, 'author.name': 1 })
This the correct syntax when using the MongoDB shell but it's actually not correct when using the NodeJS driver (to be precise: when working with the latest version of that driver).

Instead, you should use the separate project() method to add projection - like this:

... // other code
.find({})
.project({ title: 1, summary: 1, 'author.name': 1 })
*/