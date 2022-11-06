const {
  Client
} = require('pg');
const {
  v4: uuid
} = require('uuid');

/** @type {Client} */
let client;

/** @type {Record<string, { createdAt: number; status: 'follower'|'subscriber'|'blocked'|'unconfirmed'; token: string; }>} */
const connections = {
};
/** @type {Record<string, any>} */
const timelines = {
};
/** @type {{ createdAt: number; id: string; message: string;, new: boolean; }[]} */
const notifications = [];

const createConnection = async (host, conn) => {
  connections[host] = {
    createdAt: Date.now(),
    ...conn
  };
};
const updateConnection = async (host, conn) => {
  connections[host] = {
    ...(connections[host] ?? {}),
    ...conn,
    updatedAt: Date.now()
  };
};
const getPosts = async (opts) => {
  const {
    limit
  } = opts;
  const q = `
    SELECT *
    FROM posts
    ORDER BY createdat DESC
    LIMIT $1
  `;
  const values = [
    limit ?? 1000
  ];
  const result = await client.query(q, values);
  return result.rows;
};
const createPost = async (post, permissions) => {
  const q = `
  INSERT INTO posts(title, text, permissions, tags)
  VALUES($1, $2, $3, $4)
  RETURNING *
  `;
  const values = [
    post.title,
    post.text,
    'public',
    []
  ];

  const result = await client.query(q, values);
  console.log(`->`, result.rows);
  return {};
};

const getConnections = async () => connections;
const getNotifications = async () => notifications;
const createNotification = async (notif) => {
  notifications.push({
    ...notif,
    _id: uuid(),
    createdAt: Date.now(),
    new: true
  });
};
const getTimelines = async () => timelines;
const updateTimeline = async (host, items) => {
  timelines[host] = timelines[host] ?? [];
  timelines[host].push(...items);
};

async function initialize() {
  client = new Client();

  await client.connect();
}

module.exports = {
  createConnection,
  createNotification,
  createPost,
  getConnections,
  getNotifications,
  getPosts,
  getTimelines,
  initialize,
  updateConnection,
  updateTimeline
};
