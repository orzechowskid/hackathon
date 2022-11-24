const express = require('express');
const fetch = require('node-fetch');
const {
  v4: uuid
} = require('uuid');

const db = require('../db');
const types = require('../types');
const {
  ensureHostWithProtocol,
  ensureHostWithoutProtocol,
  markdownToMarkup,
  refreshTimeline,
  sendNotification
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
  const posts = await db.getTimeline({
    limit: 1000
  });
  const connections = await db.getConnections();
  const timelines = await refreshTimeline(connections);
  const recentPosts = [
    ...posts.map((post) => ({ ...post, text: markdownToMarkup(post.text) })),
    ...Object.values(timelines).flatMap((post) => ({ ...post, text: markdownToMarkup(post.text) }))
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
    original_host,
    permissions,
    text,
    uuid
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
      original_uuid: uuid,
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

router.post('/timeline/share', async (req, res) => {
  /** @type {types.TimelineDTO} */
  const {
    author,
    created_at,
    original_author,
    original_created_at,
    original_host,
    original_timeline_host,
    original_uuid,
    permissions,
    timeline_host,
    uuid,
    ...content
  } = req.body;

  if (permissions !== 'public') {
    res.status(409)
      .end();

    return;
  }

  try {
    console.log({
      ...content,
      author: process.env.USER_NAME,
      /* original_ fields are empty if this is the first share */
      original_author: original_author ?? author,
      original_created_at: original_created_at ?? created_at,
      original_host: original_host ?? timeline_host,
      original_uuid: original_uuid ?? uuid,
      permissions
    });
    
    const sharedPost = await db.createPost({
      ...content,
      author: process.env.USER_NAME,
      /* original_ fields are empty if this is the first share */
      original_author: original_author ?? author,
      original_created_at: original_created_at ?? created_at,
      original_host: original_host ?? timeline_host,
      original_uuid: original_uuid ?? uuid,
      permissions
    });

    /* inform our connection that we're sharing their post */
    if (!original_host) {
      /* non-blocking promise chain */
      db.getConnection(timeline_host)
        .then((connection) => {
          return sendNotification(timeline_host, connection.token, 'aaa');
        })
        .catch((ex) => {
          console.log(ex?.message ?? ex ?? 'unknown error in sendNotification at /timeline/share');
        });
    }

    res.status(200)
      .json(sharedPost)
      .end();
  }
  catch (ex) {
    console.log(ex?.message ?? ex ?? 'unknown error at /timeline/share');

    res.status(500)
      .end();
  }
});

module.exports = router;
