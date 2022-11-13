const express = require('express');
const fetch = require('node-fetch');
const {
  v4: uuid
} = require('uuid');

const db = require('../db');
const {
  refreshTimeline
} = require('../util');

const router = express.Router();

router.use(express.json());

router.use((req, res, next) => {
  if (!req.headers['x-jwt']) {
    res.status(401)
      .end();

    return;
  }

  next();
});

router.post('/connect', async (req, res) => {
  const {
    host
  } = req.body;
  const connection = await db.getConnection(host);

  if (!host) {
    res.status(400)
      .end();

    return;
  }
  else if (connection) {
    res.status(409)
      .end();

    return;
  }

  try {
    const result = await new Promise(async (resolve, reject) => {
      try {
        const handle = setTimeout(reject, 10 * 1000);
        let existingConnection = await db.getConnection(host);

        if (existingConnection && existingConnection.status !== 'unconfirmed') {
          console.log('existing non-pending connection');
          resolve(undefined);

          return;
        }
        else if (!existingConnection) {
          existingConnection = await db.createConnection({
            host,
            status: 'unconfirmed',
            token: uuid()
          });
        }
        const response = await fetch(`https://${host}/api/1/public/connectrequest`, {
          headers: {
            'X-ID': process.env.NODE_NAME,
            'X-JWT': existingConnection.token
          },
          method: 'POST'
        });

        if (response.status >= 400) {
          reject(response.status);

          return;
        }

        const x = await response.json();
        const updatedConnection = await db.updateConnection({
          ...existingConnection,
          status: 'follower'
        });

        clearTimeout(handle);
        resolve(updatedConnection);
      }
      catch (ex) {
        reject(ex);
      }
    });

    if (!result) {
      res.status(409)
        .end();
    }
    else {
      await db.createNotification({
        text: `you are now following ${host}`,
      });
      refreshTimeline();
      res.status(200)
        .json({ ok: true })
        .end();
    }
  }
  catch (ex) {
    console.log(ex?.message ?? 'unknown exception in /connect');
    res.status(500)
      .end();
  }
});

router.get('/explore', async (req, res) => {
    res.status(200)
    .json({
      topics: [
        'helloweb'
      ],
      users: []
    })
    .end();
});

router.get('/info', (req, res) => {
  res.status(200)
    .json({ username: 'danorz' })
    .end();
});

router.get('/notifications', async (req, res) => {
  const notifications = await db.getNotifications();

  res.status(200)
    .json(notifications)
    .end();
});

router.get('/notifications/stats', async (req, res) => {
  const notifications = await db.getNotifications();

  res.status(200)
    .json({ unread: notifications.filter((n) => n.new).length })
  .end();
});

router.get('/posts', async (req, res) => {
  try {
    const posts = await db.getPosts({
      limit: 1000
    });

    res.status(200)
      .json(posts)
      .end();
  }
  catch (ex) {
    console.error(ex.message);
    res.status(500)
      .end();
  }
});

router.post('/posts', async (req, res) => {
  const {
    permissions,
    tags,
    text,
    title
  } = req.body;

  if (!permissions || !tags || !text || !title) {
    res.status(400).end();
  }
  else {
    try {
      const newPost = await db.createPost({
        author: process.env.USER_NAME,
        original_host: process.env.NODE_NAME,
        permissions,
        tags,
        text,
        title
      });

      res.status(201)
        .json(newPost)
        .end();
    }
    catch (ex) {
      console.error(ex.message);
      res.status(500)
        .end();
    }
  }
});

router.get('/timeline', async (req, res) => {
  const posts = await db.getPosts({
    limit: 1000
  });
  const timelines = await refreshTimeline();
  const recentPosts = [
    ...posts,
    ...Object.values(timelines).flatMap((x) => x)
  ].sort((a, b) => b.published - a.published) // desc
    .slice(0, 50);

  res.status(200)
    .json(recentPosts)
    .end();
});

module.exports = router;
