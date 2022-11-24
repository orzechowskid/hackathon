const fetch = require('node-fetch');

const {
  marked
} = require('marked');
const xss = require('xss');

const types = require('../types');

/**
 * @param {string} text
 * @return {string}
 */
function markdownToMarkup(text) {
  return xss(
    marked.parse(
      text.replace(
        /^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, ''
      )
    )
  );
}

/**
 * @param {string} host
 * @return {string}
 */
function ensureHostWithProtocol(host) {
  return host.includes('://')
    ? host
    : `https://${host}`;
}

/**
 * @param {string} host
 * @return {string}
 */
function ensureHostWithoutProtocol(host) {
  return host.split('://').at(-1);
}

/**
 * @param {types.ConnectionDTO} connection
 * @return {Promise<types.TimelineDTO[]>}
 */
function getConnectionPosts(connection) {
  const {
    host,
    token
  } = connection;

  return new Promise(async (resolve, reject) => {
    const rejectHandle = setTimeout(reject, connection.timeout ?? 10000);

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
      resolve(result.map((result) => ({
        ...result,
        timeline_host: host
      })));
    }
    catch (ex) {
      console.log(ex?.message ?? ex ?? 'unknown error in getConnectionPosts');
      clearTimeout(rejectHandle);
      resolve([]);
    }
  });
}

/**
 * @param {types.ConnectionDTO[]} connections
 */
async function refreshTimeline(connections) {
  const results = await Promise.allSettled(connections.map(getConnectionPosts));

  return results.map((obj) => obj.value ?? []);
}

/**
 * @param {types.DBRecord<T>} obj
 * @returns {T}
 * @template T
 */
function withoutId(obj) {
  if (!obj) {
    return null;
  }
  
  const {
    _id,
    ...otherProps
  } = obj;

  return otherProps;
}

/**
 * @param {string} host
 * @param {string} token
 * @param {string} message
 * @return {Promise<void>}
 */
async function sendNotification(host, token, message) {
  try {
    const response = await fetch(`https://${host}/api/1/public/notifications`, {
      body: JSON.stringify({ text: message }),
      headers: {
        'Content-Type': 'application/json',
        'X-ID': process.env.NODE_NAME,
        'X-JWT': token
      },
      method: 'POST'
    });

    return response.json();
  }
  catch (ex) {
    console.log(ex?.message ?? ex ?? 'unknown error in sendNotification()');
  }
}

module.exports = {
  ensureHostWithProtocol,
  ensureHostWithoutProtocol,
  markdownToMarkup,
  refreshTimeline,
  sendNotification,
  withoutId
};
