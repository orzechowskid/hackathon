const {
  parse: parseRSS
} = require('rss-to-json');

const db = require('../db');

async function refreshTimeline() {
  const connections = await db.getConnections();
  const data = await Promise.all(Object.keys(connections).map(
    (connection) => parseRSS(`${connection}/rss/posts.rss`)
  ));

  await Promise.all(data.map(
    (timeline) => db.updateTimeline(timeline.link, timeline.items)
  ));
}

module.exports = {
  refreshTimeline
};
