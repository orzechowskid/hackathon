const {
  Client
} = require('pg');

/** @type {Client} */
let client;

/**
 * @typedef {'follower'|'mutual'|'blocked'|'unconfirmed'} ConnectionStatus
 */

/**
 * @typedef {Object} ConnectionDTO
 * @property {string} host
 * @property {string} token
 * @property {string} created_at
 * @property {ConnectionStatus} status
 */

/**
 * @typedef {Object} PostDTO
 * @property {string} uuid
 * @property {string} author
 * @property {string} text
 * @property {string} title
 */

/**
 * @typedef {Object} AuthorDTO
 * @property {string} uuid
 * @property {string} name
 */

/**
 * @typedef {Object} NotificationDTO
 * @property {string} host
 * @property {string} token
 * @property {string} created_at
 */

/** @type {Record<string, any>} */
const timelines = {
};

async function initialize() {
  client = new Client();

  await client.connect();
}

/**
 * @return {Promise<ConnectionDTO|undefined>}
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
 * @return {Promise<ConnectionDTO[]>}
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
 * @param {Partial<ConnectionDTO>} connection
 * @return {Promise<ConnectionDTO>}
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
 * @param {ConnectionDTO} connection
 * @return {Promise<ConnectionDTO>}
 */
const updateConnection = async (connection) => {
  console.log(`->`, connection);
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

  console.log(`->`, {result});
  return result.rows[0];
};

/**
 * @return {Promise<PostDTO[]>}
 */
const getPosts = async () => {
  const q = `
    SELECT *
    FROM posts
    ORDER BY created_at DESC
  `;
  const result = await client.query(q);
  return result.rows;
};

/**
 * @return {Promise<PostDTO>}
 */
const createPost = async (post) => {
  const q = `
  INSERT INTO posts(author, title, text, permissions)
  VALUES($1, $2, $3, $4)
  RETURNING *
  `;
  const values = [
    post.author,
    post.title,
    post.text,
    post.permissions
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
 * @return {Promise<NotificationDTO[]>}
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
 * @return {Promise<NotificationDTO>}
 */
const createNotification = async (data) => {
  const {
    text
  } = data;
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







const getTimelines = async () => timelines;
const updateTimeline = async (host, items) => {
  timelines[host] = timelines[host] ?? [];
  timelines[host].push(...items);
};


module.exports = {
  createConnection,
  createNotification,
  createPost,
  getConnection,
  getConnections,
  getNotifications,
  getPosts,
  getTimelines,
  initialize,
  updateConnection,
  updateTimeline,
  upsertAuthor
};
