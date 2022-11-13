const fetch = require('node-fetch');

const db = require('../db');

/**
 * @typedef {Object} PublicPostDTOAttrs
 * @property {string} host
 *
 * @typedef {PublicPostDTOAttrs & db.PostDTO} PublicPostDTO
 */

/**
 * @param {db.ConnectionDTO} connection
 * @return {Promise<db.PublicPostDTO[]>}
 */
function getConnectionPosts(connection) {
  const {
    host,
    token
  } = connection;

  return new Promise(async (resolve, reject) => {
    const rejectHandle = setTimeout(reject, connection.timeout ?? 10000);

    try {
      const response = await fetch(`https://${host}/api/1/public/posts`, {
        headers: {
          'X-Id': process.env.NODE_NAME,
          'X-JWT': token
        }
      });
      /** @type {db.PostDTO[]} */
      const result = await response.json();

      clearTimeout(rejectHandle);
      resolve(result.map((result) => ({
        ...result,
        host
      })));
    }
    catch (ex) {
      clearTimeout(rejectHandle);
      reject(ex);
    }
  });
}

async function refreshTimeline() {
  const connections = await db.getConnections();

  try {
    return Promise.all(connections.map(getConnectionPosts));
  }
  catch (ex) {
    console.log(ex?.message ?? 'unknown error in refreshTimeline');

    return [];
  }
}

module.exports = {
  refreshTimeline
};
