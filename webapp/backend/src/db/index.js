const {
  Client
} = require('pg');
const fetch = require('node-fetch');

const {
  withoutId
} = require('../util');

const types = require('../types');

/** @type {Client} */
let client;

const initialize = async () => {
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

const updateSchema = async () => {
  try {
    const q = `
      SELECT *
      FROM meta
      LIMIT 1
    `;
    const result = await client.query(q);
    const currentSchemaVersion = result.rows[0].schema_version;
    const response = await fetch(`http://${process.env.PHONEBOOK_HOST}/api/1/schema`);
    /** @type {types.SchemaDefinitionDTO} */
    const {
      sql,
      version: newestSchemaVersion
    } = await response.json();

    if (currentSchemaVersion !== newestSchemaVersion) {
      console.log(`updating schema v${currentSchemaVersion} to v${newestSchemaVersion}`);

      try {
        await client.query(sql);
      }
      catch (ex) {
        console.error(ex?.message ?? ex ?? 'unknown error while updating schema');
      }
    }
  }
  catch (ex) {
    console.error(ex?.message ?? ex ?? 'unknown error in updateSchema');
  }
};

/**
 * @param {string[]} hosts
 * @return {Promise<Record<string, string[]>>}
 */
const getSharesForHosts = async (hosts) => {
  const q = `
    SELECT *
    FROM posts
    WHERE original_host = ANY($1)
  `;
  const params = [
    hosts
  ];
  const result = await client.query(q, params);

  return result.rows.reduce(
    (acc, el) => ({
      ...acc,
      [el.original_host]: [ ...(acc[el.original_host] ?? []), el.original_uuid ]
    }),
    {}
  );
};

module.exports = {
  createConnection,
  createNotification,
  createPost,
  getConnection,
  getConnections,
  getNotifications,
  getPosts,
  getSharesForHosts,
  getTimeline,
  initialize,
  updateConnection,
  updateSchema,
  upsertAuthor
};
