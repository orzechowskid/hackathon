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

function dbToFrontend(post) {
  return {
    category: [],
    content: post.text,
    created: post._meta.createdAt,
    link: `${process.env.NODE_NAME}/blog/${post._id}`,
    published: post._meta.createdAt,
    title: post.title
  };
}

module.exports = {
  dbToFrontend,
  refreshTimeline
};
