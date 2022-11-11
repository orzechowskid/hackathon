const fetch = require('node-fetch');

const db = require('../db');

/**
  * @param {db.ConnectionDTO} connection
 * @return {Promise<db.PostDTO[]>}
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
      const result = await response.json();

      clearTimeout(rejectHandle);
      resolve(result);
    }
    catch (ex) {
      clearTimeout(rejectHandle);
      reject(ex);
    }
  });
}

async function refreshTimeline() {
  const connections = await db.getConnections();
  const data = await Promise.all(connections.map(getConnectionPosts))

  return data;
}

module.exports = {
  refreshTimeline
};
