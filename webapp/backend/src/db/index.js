const {
  Client
} = require('pg');

const {
  withoutId
} = require('../util');

const types = require('../types');

/** @type {Client} */
let client;

async function initialize() {
  client = new Client({
    connectionString: process.env.DB_CONNECTION_STRING
  });

  await client.connect();
}

/**
 * @return {Promise<types.ConnectionDTO|undefined>}
 */
const getConnection = async (host) => {
  const q = `
    SELECT *
    FROM connections
    WHERE host = $1
  `;
  const values = [ host ];

  const result = await client.query(q, values);

  return result.rows[0];
};

/**
 * @return {Promise<types.ConnectionDTO[]>}
 */
const getConnections = async () => {
  const q = `
    SELECT *
    FROM connections
  `;

  const result = await client.query(q);

  return result.rows;
}

/**
 * @param {Partial<types.ConnectionDTO>} connection
 * @return {Promise<types.ConnectionDTO>}
 */
const createConnection = async (connection) => {
  const {
    host,
    status,
    token
  } = connection;
  const q = `
    INSERT INTO connections(host, status, token)
    VALUES($1, $2, $3)
    RETURNING *
  `;
  const values = [ host, status, token ];
  const result = await client.query(q, values);

  return result.rows[0];
};

/**
 * @param {types.ConnectionDTO} connection
 * @return {Promise<types.ConnectionDTO>}
 */
const updateConnection = async (connection) => {
  const {
    host,
    status,
    token
  } = connection;
  const q = `
    UPDATE connections
    SET token=$1, status=$2
    WHERE host=$3
    RETURNING *
  `;
  const values = [
    token, status, host
  ];
  const result = await client.query(q, values);

  return result.rows[0];
};

/**
 * @return {Promise<types.TimelineDTO[]>}
 */
const getPosts = async () => {
  const q = `
    SELECT *
    FROM posts
    ORDER BY created_at DESC
  `;
  const result = await client.query(q);
  return result.rows.map(withoutId);
};

/**
 * @param {Partial<types.TimelineDTO>} post
 * @return {Promise<types.TimelineDTO>}
 */
const createPost = async (post) => {
  const q = `
  INSERT INTO posts(author, permissions, text, original_author, original_created_at, original_host, original_uuid)
  VALUES($1, $2, $3, $4, $5, $6, $7)
  RETURNING *
  `;
  const values = [
    post.author,
    post.permissions,
    post.text,
    post.original_author,
    post.original_created_at,
    post.original_host,
    post.original_uuid
  ];
  const result = await client.query(q, values);

  return result.rows[0];
};

const upsertAuthor = async () => {
  const q = `
    INSERT INTO people(name)
    VALUES($1)
    ON CONFLICT DO NOTHING
  `;
  const values = [ process.env.USER_NAME ];
  await client.query(q, values);
};

/**
 * @return {Promise<types.NotificationDTO[]>}
 */
const getNotifications = async () => {
  const q = `
    SELECT *
    from notifications
  `;

  const result = await client.query(q);

  return result.rows;
};

/**
 * @param {string} text
 * @return {Promise<types.NotificationDTO>}
 */
const createNotification = async (text) => {
  const q = `
    INSERT INTO notifications(text)
    VALUES($1)
  `;
  const values = [
    text
  ];

  const result = await client.query(q, values);

  return result.rows[0];
};

const getTimeline = async () => {
  const q = `
    SELECT *
    FROM posts
    WHERE original_host IS NULL
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const result = await client.query(q);

  return result.rows.map(withoutId);
};

module.exports = {
  createConnection,
  createNotification,
  createPost,
  getConnection,
  getConnections,
  getNotifications,
  getPosts,
  getTimeline,
  initialize,
  updateConnection,
  upsertAuthor
};
