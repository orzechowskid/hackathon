const express = require(`express`);
const fetch = require(`node-fetch`);
const {
  v4: uuid
} = require(`uuid`);

const db = require(`../db`);
const types = require(`../types`);
const {
  ensureHostWithProtocol,
  ensureHostWithoutProtocol,
  markdownToMarkup,
  refreshTimeline,
  sendNotification
} = require(`../util`);

const router = express.Router();

router.use(express.json());

router.use((req, res, next) => {
  if (!req.headers[`x-jwt`]) {
    res.status(401)
      .end();

    return;
  }

  next();
});

router.post(`/connect`, async (req, res) => {
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

        if (existingConnection && existingConnection.status !== `unconfirmed`) {
          console.log(`existing non-pending connection`);
          resolve(undefined);

          return;
        }
        else if (!existingConnection) {
          existingConnection = await db.createConnection({
            host: hostWithoutProtocol,
            status: `unconfirmed`,
            token: uuid()
          });
        }
        const response = await fetch(`${hostWithProtocol}/api/1/public/connectrequest`, {
          headers: {
            'X-ID': process.env.NODE_NAME,
            'X-JWT': existingConnection.token
          },
          method: `POST`
        });

        if (response.status >= 400) {
          reject(response.status);

          return;
        }

        const x = await response.json();
        const updatedConnection = await db.updateConnection({
          ...existingConnection,
          status: `follower`
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
    console.log(ex?.message ?? `unknown exception in /connect`);
    res.status(500)
      .end();
  }
});

router.get(`/explore`, async (req, res) => {
    res.status(200)
    .json({
      topics: [
        `helloweb`
      ],
      users: []
    })
    .end();
});

router.get(`/info`, (req, res) => {
  res.status(200)
    .json({ username: `danorz` })
    .end();
});

router.get(`/notifications`, async (req, res) => {
  const notifications = await db.getNotifications();

  res.status(200)
    .json(notifications)
    .end();
});

router.get(`/notifications/stats`, async (req, res) => {
  const notifications = await db.getNotifications();

  res.status(200)
    .json({ unread: notifications.filter((n) => n.new).length })
  .end();
});

router.get(`/timeline`, async (req, res) => {
  const posts = await db.getTimeline({
    limit: 1000
  });
  const connections = await db.getConnections();
  const timelines = await refreshTimeline(connections);
  const otherPosts = timelines.flatMap((x) => x);
  const otherHosts = Array.from(
    new Set(
      otherPosts.map((post) => (post.original_host ?? post.timeline_host))
    )
  );
  const [
    shares,
    upvotes
  ] = await Promise.all([
    db.getSharesForHosts(otherHosts),
    db.getUpvotesForHosts(otherHosts)
  ]);
  const recentPosts = [
    ...posts.map((post) => ({ ...post, text: markdownToMarkup(post.text) })),
    ...otherPosts.map((post) => ({
      ...post,
      shared: shares[post.original_host ?? post.timeline_host]?.includes(post.original_uuid ?? post.uuid),
      text: markdownToMarkup(post.text),
      upvoted: upvotes[post.original_host ?? post.timeline_host]?.includes(post.original_uuid ?? post.uuid)
    }))
  ].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 50);

  res.status(200)
    .json(recentPosts)
    .end();
});

router.post(`/timeline`, async (req, res) => {
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

router.post(`/timeline/share`, async (req, res) => {
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

  if (permissions !== `public`) {
    res.status(409)
      .end();

    return;
  }

  // TODO: check to see if we've already shared this post

  try {
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

    /* inform our connection that we're sharing their post.  no need to block on
     * it though so we use a promise chain to catch errors */
    if (!original_host) {
      db.getConnection(timeline_host)
        .then((connection) => {
          return sendNotification({
            host: timeline_host,
            messageType: types.NOTIFY_TYPES.Share,
            token: connection.token
          });
        })
        .catch((ex) => {
          console.log(`/timeline/share:`, ex?.message ?? ex ?? `unknown error`);
        });
    }

    res.status(200)
      .json(sharedPost)
      .end();
  }
  catch (ex) {
    console.log(`/timeline/share:`, ex?.message ?? ex ?? `unknown error`);

    res.status(500)
      .end();
  }
});

router.delete(`/timeline/share`, async (req, res) => {
  /** @type {types.TimelineDTO} */
  const {
    uuid
  } = req.body;

  if (!uuid) {
    res.status(400)
      .end();

    return;
  }

  try {
    const deletedPost = await db.softDeletePost(uuid);
    res.status(200)
      .json(deletedPost)
      .end();
  }
  catch (ex) {
    console.log(`/timeline/share:`, ex?.message ?? ex ?? `unknown error`);

    res.status(500)
      .end();
  }
});

router.post(`/timeline/upvote`, async (req, res) => {
  /** @type {types.TimelineDTO} */
  const {
    timeline_host,
    original_host,
    original_uuid,
    uuid
  } = req.body;

  if (!uuid) {
    res.status(400)
      .end();

    return;
  }

  const existingConnection = await db.getConnection(original_host ?? timeline_host);

  if (!existingConnection) {
    res.status(400)
      .end();

    return;
  }

  try {
    await Promise.all([
      sendNotification({
        host: original_host ?? timeline_host,
        messageBody: {
          uuid: original_uuid ?? uuid
        },
        messageType: types.NOTIFY_TYPES.Upvote,
        token: existingConnection.token
      }),
      db.createVote({
        host: original_host ?? timeline_host,
        upvoted: true,
        uuid: original_uuid ?? uuid
      })
    ]);

    res.status(200)
      .end();
  }
  catch (ex) {
    console.log(`/timeline/upvote:`, ex?.message ?? ex ?? `unknown error`);

    res.status(500)
      .end();
  }
});

router.delete(`/timeline/upvote`, async (req, res) => {
  /** @type {types.TimelineDTO} */
  const {
    original_host,
    original_uuid,
    timeline_host,
    uuid
  } = req.body;

  if (!uuid) {
    res.status(400)
      .end();

    return;
  }

  const existingConnection = await db.getConnection(original_host ?? timeline_host);

  if (!existingConnection) {
    res.status(400)
      .end();

    return;
  }

  try {
    await Promise.all([
      sendNotification({
        host: original_host ?? timeline_host,
        messageBody: {
          uuid: original_uuid ?? uuid
        },
        messageType: types.NOTIFY_TYPES.Downvote,
        token: existingConnection.token
      }),
      db.createVote({
        host: original_host ?? timeline_host,
        upvoted: false,
        uuid: original_uuid ?? uuid
      })
    ]);

    res.status(200)
      .end();
  }
  catch (ex) {
    console.log(`/timeline/upvote:`, ex?.message ?? ex ?? `unknown error`);

    res.status(500)
      .end();
  }
});

module.exports = router;
