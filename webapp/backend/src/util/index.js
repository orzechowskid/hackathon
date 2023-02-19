const MD5 = require(`md5.js`);
const {
  marked
} = require(`marked`);
const fetch = require(`node-fetch`);
const xss = require(`xss`);

const types = require(`../types`);

/**
 * @param {string} text potentially-unsafe string of text
 * @return {string} sanitized markup
 */
function markdownToMarkup(text) {
  return xss(
    marked.parse(
      text?.replace(
        /^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, ``
      )
    )
  );
}

/**
 * @param {string} host
 * @return {string}
 */
function ensureHostWithProtocol(host) {
  return host.includes(`://`)
    ? host
    : `https://${host}`;
}

/**
 * @param {string} host
 * @return {string}
 */
function ensureHostWithoutProtocol(host) {
  return host.split(`://`).at(-1);
}

/**
 * @param {types.ConnectionDTO} connection
 * @return {Promise<types.TimelineDTO[]>}
 */
async function getConnectionPosts(connection) {
  const {
    host,
    token
  } = connection;

  const rejectHandle = setTimeout(
    () => {
      throw new Error(`${host} timed out`);
    },
    connection.timeout ?? 10000
  );

  try {
    const response = await fetch(`https://${host}/api/1/public/timeline`, {
      headers: {
        'X-Id': process.env.NODE_NAME,
        'X-JWT': token
      }
    });
    /** @type {types.TimelineDTO[]} */
    const result = await response.json();

    clearTimeout(rejectHandle);

    return result.map((result) => ({
      ...result,
      timeline_host: host
    }));
  }
  catch (ex) {
    console.log(`getConnectionPosts:`, ex?.message ?? ex ?? `unknown error`);
    clearTimeout(rejectHandle);

    return [];
  }
}

/**
 * @param {types.ConnectionDTO[]} connections
 * @return {Promise<types.TimelineDTO[][]>}
 */
async function refreshTimeline(connections) {
  const results = await Promise.allSettled(
    connections
      .filter((conn) => conn.status !== `blocked`)
      .map(getConnectionPosts)
  );

  return results.map((obj) => obj.value ?? []);
}

/**
 * @param {Object} obj source object
 * @param {string[]} fields fields to strip out
 * @return {Object} a subset of `obj`
 */
function omit(obj, fields) {
  if (obj === undefined) {
    return {};
  }

  return (fields ?? []).reduce(
    (acc, el) => {
      delete acc[el];

      return acc;
    },
    { ...obj }
  );
}

/**
 * @param {types.DBRecord<T>} obj
 * @returns {T}
 * @template T
 */
function withoutId(obj) {
  return omit(obj, [ `_id` ]);
}

/**
 * @param {string} host
 * @param {Object} messageBody
 * @param {string} messageType NOTIFY_TYPES enum value
 * @param {string} token
 * @return {Promise<void>}
 */
async function sendNotification(opts) {
  const {
    host,
    messageBody,
    messageType,
    token
  } = opts;

  try {
    const response = await fetch(`https://${host}/api/1/public/notifications`, {
      body: JSON.stringify({
        ...messageBody,
        type: messageType
      }),
      headers: {
        'Content-Type': `application/json`,
        'X-ID': process.env.NODE_NAME,
        'X-JWT': token
      },
      method: `POST`
    });

    return response.json();
  }
  catch (ex) {
    console.log(ex?.message ?? ex ?? `unknown error in sendNotification()`);
  }
}

const md5 =
  (arg) => new MD5().update(JSON.stringify(arg)).digest(`hex`);

module.exports = {
  ensureHostWithProtocol,
  ensureHostWithoutProtocol,
  markdownToMarkup,
  md5,
  omit,
  refreshTimeline,
  sendNotification,
  withoutId
};
