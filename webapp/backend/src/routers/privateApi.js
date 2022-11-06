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

router.get('/timeline', async (req, res) => {
  const posts = await db.getPosts({
    limit: 1000
  });
  const timelines = await db.getTimelines();
  const recentPosts = [
    ...posts,
    ...Object.values(timelines).flatMap((x) => x)
  ].sort((a, b) => b.published - a.published) // desc
    .slice(0, 50);

  res.status(200)
    .json(recentPosts)
    .end();
});

router.post('/connect', async (req, res) => {
  const {
    host
  } = req.query;
  const connection = (await db.getConnections())[host];

  if (connection) {
    res.status(409)
      .end();
  }
  else {
    try {
      await new Promise(async (resolve, reject) => {
        try {
          const handle = setTimeout(reject, 10 * 1000);
          const token = uuid();

          await db.createConnection(host, {
            status: 'unconfirmed',
            token
          });

          const response = await fetch(`${host}/api/1/public/connectrequest?token=${token}`, {
            headers: {
              'X-ID': process.env.NODE_NAME
            }
          });
          const payload = await response.json();

          await db.updateConnection(host, {
            status: 'follower',
            token: payload.token
          });
          clearTimeout(handle);
          resolve();
        }
        catch (ex) {
          reject(ex);
        }
      });

      await db.createNotification({
        message: `you are now following ${host}`,
        new: true
      });
      refreshTimeline();
      res.status(200)
        .json({ ok: true })
        .end();
    }
    catch (ex) {
      console.log(ex.message);
      res.status(500)
        .end();
    }
  }
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

router.post('/posts', async (req, res) => {
  const {
    groups,
    tags,
    text,
    title
  } = req.body;

  if (!groups || !tags || !text || !title) {
    res.status(400).end();
  }
  else {
    try {
      await db.createPost({
        author: process.env.USER_NAME,
        tags,
        text,
        title
      }, groups ?? [ 'public' ]);

      res.status(201)
        .json((await db.getPosts()).at(-1))
        .end();
    }
    catch (ex) {
      res.status(500)
        .end();
    }
  }
});

router.get('/info', (req, res) => {
  res.status(200)
    .json({ username: 'danorz' })
    .end();
});

module.exports = router;
