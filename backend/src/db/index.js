const {
  v4: uuid
} = require('uuid');

/** @type {Record<string, { createdAt: number; status: 'follower'|'subscriber'|'blocked'|'unconfirmed'; token: string; }>} */
const connections = {
};
/** @type {Record<string, any>} */
const timelines = {
};
/** @type {{ createdAt: number; id: string; message: string;, new: boolean; }[]} */
const notifications = [];
const posts = [{
  _id: uuid(),
  _meta: {
    author: 'danorz',
    createdAt: Date.now() - (1000 * 60 * 1),
    groups: [ 'mutual' ]
  },
  tags: [],
  text: `it's a secret to everybody.  it's a secret to everybody.  it's a secret to everybody.  it's a secret to everybody.  it's a secret to everybody.  it's a secret to everybody.  it's a secret to everybody.  it's a secret to everybody.  it's a secret to everybody.  it's a secret to everybody.  it's a secret to everybody.  it's a secret to everybody.  it's a secret to everybody.  it's a secret to everybody.  it's a secret to everybody.  it's a secret to everybody.  it's a secret to everybody.  it's a secret to everybody.  it's a secret to everybody.  it's a secret to everybody.  it's a secret to everybody.`,
  title: 'shhhh'
}, {
  _id: uuid(),
  _meta: {
    author: 'danorz',
    createdAt: Date.now() - (1000 * 60 * 5),
    groups: [ 'public' ]
  },
  tags: [],
  text: 'body of the second post',
  title: 'second post'
}, {
  _id: uuid(),
  _meta: {
    author: 'danorz',
    createdAt: Date.now() - (1000 * 60 * 50),
    groups: [ 'public' ]
  },
  tags: [],
  text: `_hello_ world from ${process.env.NODE_NAME}`,
  title: 'first post'
}];

const createConnection = async (host, conn) => {
  connections[host] = {
    createdAt: Date.now(),
    ...conn
  };
};
const updateConnection = async (host, conn) => {
  connections[host] = {
    ...(connections[host] ?? {}),
    ...conn,
    updatedAt: Date.now()
  };
};
const createPost = async (post, permissions) => {
  posts.push({
    _id: uuid(),
    _meta: {
      createdAt: Date.now(),
      groups: permissions
    },
    ...post
  });
};
const getConnections = async () => connections;
const getNotifications = async () => notifications;
const createNotification = async (notif) => {
  notifications.push({
    ...notif,
    _id: uuid(),
    createdAt: Date.now(),
    new: true
  });
};
const getPosts = async () => posts;
const getTimelines = async () => timelines;
const updateTimeline = async (host, items) => {
  timelines[host] = timelines[host] ?? [];
  timelines[host].push(...items);
};

module.exports = {
  createConnection,
  createNotification,
  createPost,
  getConnections,
  getNotifications,
  getPosts,
  getTimelines,
  updateConnection,
  updateTimeline
};
