const {
  Feed
} = require('feed');
const express = require('express');

const db = require('../db');

const router = express.Router();

function dbToRss(post) {
  return {
    author: {
      name: 'danorz',
    },
    content: post.text,
    date: new Date(post._meta.createdAt),
    id: `${process.env.NODE_NAME}/blog/${post._id}`,
    link: `${process.env.NODE_NAME}/blog/${post._id}`,
    title: post.title
  };
}

router.get('/posts.rss', async (req, res) => {
  const {
    'x-id': remoteHost
  } = req.headers;
  const connection = (await db.getConnections())[remoteHost];

  if (connection?.status === 'blocked') {
    res.status(403).end();
  }
  else {
    let posts = await db.getPosts();

    if (connection?.status !== 'mutual') {
      posts = posts.filter(
        (post) => post._meta.groups.includes('public')
      );
    }

    const feed = new Feed({
      author: {
        name: 'danorz'
      },
      description: 'latest blog posts',
      id: process.env.NODE_NAME,
      link: process.env.NODE_NAME,
      title: 'blog posts'
    });

    feed.addCategory('social');

    posts.slice(0, 50).forEach(
      (post) => feed.addItem(dbToRss(post))
    );

    res.status(200)
      .header({ 'Content-Type': 'application/rss+xml' })
      .send(feed.rss2())
      .end();
  }
});

module.exports = router;
