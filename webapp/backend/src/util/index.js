const fetch = require('node-fetch');

const types = require('../types');

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

module.exports = {
  ensureHostWithProtocol,
  ensureHostWithoutProtocol,
  refreshTimeline,
  withoutId
};
