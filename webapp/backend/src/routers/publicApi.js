const express = require('express');
const fetch = require('node-fetch');

const db = require('../db');

const router = express.Router();

router.use(express.json());

router.get('/connectrequest', async (req, res) => {
  const {
    'x-id': remoteHost
  } = req.headers;
  const {
    token
  } = req.query;
  const connection = (await db.getConnections())[remoteHost];

  if (connection) {
    console.log(`${remoteHost} is already a connection`);
    res.status(409).end();
  }
  else {
    await db.createConnection({
      status: 'unconfirmed',
      token
    });

    try {
      await new Promise(async (resolve, reject) => {
        try {
          const handle = setTimeout(reject, 10 * 1000);

          const response = await fetch(`${remoteHost}/api/1/public/connectconfirm?token=${token}`, {
            headers: {
              'X-ID': process.env.NODE_NAME
            }
          });
          const payload = await response.json();

          await db.updateConnection(remoteHost, {
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
        message: `${remoteHost} is now following you`
      });
      res.status(201)
        .json({ token })
        .end();
    }
    catch (ex) {
      console.log(ex.message);
      res.status(500).end();
    }
  }
});

router.get('/connectconfirm', async (req, res) => {
  const {
    'x-id': remoteHost
  } = req.headers;
  const {
    token
  } = req.query;
  const connection = (await db.getConnections())[remoteHost];

  if (!connection) {
    res.status(401)
      .end();
  }
  else if (connection.token !== token) {
    res.status(403)
      .end();
  }
  else {
    await db.updateConnection(remoteHost, {
      status: 'follower'
    });

    res.status(200)
      .json({ token: connection.token })
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

router.get('/posts', async (req, res) => {
  try {
    const posts = await db.getPosts({ limit: 1000 });
console.log(`->`, posts);
    res.status(200)
      .json(posts.filter((post) => post.permissions === 'public'))
      .end();
  }
  catch (ex) {
    console.error(ex.message);
    res.status(500)
      .end();
  }
});

module.exports = router;
