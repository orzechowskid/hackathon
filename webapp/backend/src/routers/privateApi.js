const express = require('express');
const fetch = require('node-fetch');
const {
  v4: uuid
} = require('uuid');

const db = require('../db');
const {
  ensureHostWithProtocol,
  ensureHostWithoutProtocol,
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

  if (!host) {
    res.status(400)
      .end();

    return;
  }

  const hostWithoutProtocol = ensureHostWithoutProtocol(host);
  const connection = await db.getConnection(hostWithoutProtocol);

  if (connection) {
    res.status(409)
      .end();

    return;
  }

  try {
    const result = await new Promise(async (resolve, reject) => {
      try {
        const hostWithProtocol = ensureHostWithProtocol(host);
        const handle = setTimeout(reject, 10 * 1000);
        let existingConnection = await db.getConnection(hostWithoutProtocol);

        if (existingConnection && existingConnection.status !== 'unconfirmed') {
          console.log('existing non-pending connection');
          resolve(undefined);

          return;
        }
        else if (!existingConnection) {
          existingConnection = await db.createConnection({
            host: hostWithoutProtocol,
            status: 'unconfirmed',
            token: uuid()
          });
        }
        const response = await fetch(`${hostWithProtocol}/api/1/public/connectrequest`, {
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
        console.log({ex});
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
      const allConnections = await db.getConnections();
      refreshTimeline(allConnections);
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

router.get('/timeline', async (req, res) => {
  const posts = await db.getPosts({
    limit: 1000
  });
  const connections = await db.getConnections();
  const timelines = await refreshTimeline(connections);
  const recentPosts = [
    ...posts,
    ...Object.values(timelines).flatMap((x) => x)
  ].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 50);

  res.status(200)
    .json(recentPosts)
    .end();
});

router.post('/timeline', async (req, res) => {
  /** @type {Partial<db.TimelineDTO>} */
  const {
    author,
    host,
    original_host,
    permissions,
    text
  } = req.body;

  if (!permissions || !text) {
    res.status(400)
      .end();

    return;
  }

  try {
    const newPost = await db.createPost({
      author: process.env.USER_NAME,
      original_host,
      permissions,
      text
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
});

module.exports = router;
