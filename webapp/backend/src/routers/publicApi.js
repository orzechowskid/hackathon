const express = require('express');
const fetch = require('node-fetch');

const db = require('../db');
const {
  ensureHostWithProtocol,
  ensureHostWithoutProtocol
} = require('../util');

const router = express.Router();

router.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});
router.options('*', (_req, res) => {
  res.status(200)
    .header('Access-Control-Allow-Headers', '*')
    .end();
});
router.use(express.json());

router.post('/connectrequest', async (req, res) => {
  const {
    'x-id': remoteHost,
    'x-jwt': token
  } = req.headers;

  if (!remoteHost || !token) {
    res.status(400)
      .end();
  }

  let hostWithoutProtocol = ensureHostWithoutProtocol(remoteHost);
  let connection = await db.getConnection(hostWithoutProtocol);

  if (connection && connection.status !== 'unconfirmed') {
    console.log(`${hostWithoutProtocol} is already a connection`);
    res.status(409)
      .end();
  }
  else {
    try {
      if (!connection) {
        connection = await db.createConnection({
          host: hostWithoutProtocol,
          status: 'unconfirmed',
          token
        });
      }

      await new Promise(async (resolve, reject) => {
        try {
          const hostWithProtocol = ensureHostWithProtocol(remoteHost);
          const handle = setTimeout(reject, 10 * 1000);

          const response = await fetch(`${hostWithProtocol}/api/1/public/connectconfirm`, {
            headers: {
              'X-ID': process.env.NODE_NAME,
              'X-JWT': token
            },
            method: 'POST'
          });
          const payload = await response.json();

          await db.updateConnection({
            ...connection,
            status: 'follower'
          });
          clearTimeout(handle);
          resolve();
        }
        catch (ex) {
          reject(ex);
        }
      });

      await db.createNotification({
        text: `${remoteHost} is now following you`
      });

      res.status(201)
        .json({ token })
        .end();
    }
    catch (ex) {
      console.log(ex?.message ?? 'unknown exception in /connectrequest');
      res.status(500)
        .end();
    }
  }
});

router.post('/connectconfirm', async (req, res) => {
  const {
    'x-id': remoteHost,
    'x-jwt': token
  } = req.headers;

  if (!remoteHost || !token) {
    res.status(400)
      .end();
  }

  const hostWithoutProtocol = ensureHostWithoutProtocol(remoteHost);

  try {
    const connection = await db.getConnection(hostWithoutProtocol);

    if (!connection) {
      console.log(`no connection found for ${hostWithoutProtocol}`);
      res.status(401)
        .end();
    }
    else if (connection.token !== token) {
      throw new Error(`payload token ${token} does not match connection token ${connection.token}`);
    }
    else {
      await db.updateConnection({
        ...connection,
        status: 'following'
      });

      res.status(200)
        .json({ token: connection.token })
        .end();
    }
  }
  catch (ex) {
    console.log(ex?.message ?? 'unknown exception in /connectconfirm');
    res.status(500)
      .end();
  }
});

router.post('/dm', (req, res) => {
  const {
    'x-id': remoteHost
  } = req.headers;

  if (!remoteHost) {
    res.status(400)
      .end();
  }
  else {
    notifications.push({
      createdAt: Date.now(),
      id: uuid(),
      message: `${remoteHost} has sent you a DM`,
      new: true
    });
    res.status(201)
      .json({ ok: true })
      .end();
  }
});

router.get('/profile', async (req, res) => {
  res.status(200)
    .json({
      username: process.env.USER_NAME
    })
    .end();
});

router.get('/timeline', async (req, res) => {
  const {
    'x-id': remoteHost,
    'x-jwt': token
  } = req.headers;

  try {
    const connection = token
      ? await db.getConnection(remoteHost)
      : undefined;

    if (connection?.status === 'blocked') {
      res.status(200)
        .json([])
        .end();
    }
    else {
      const posts = await db.getPosts({ limit: 1000 });
      const filterFn = connection?.status === 'follower' || connection?.status === 'mutual'
        ? (post) => post.permissions !== 'private'
        : (post) => post.permissions === 'public';
      const filteredPosts = posts.filter(filterFn);

      res.status(200)
        .json(filteredPosts)
        .end();
    }
  }
  catch (ex) {
    console.error(ex.message);
    res.status(500)
      .end();
  }
});

module.exports = router;
