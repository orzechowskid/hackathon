/**
 * @typedef {Object} DBRow
 * @property {number} _id
 */

/**
 * @typedef {DBRow & T} DBRecord<T>
 * @template T
 */

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
 * @typedef {Object} TimelineDTO
 * @property {string} author
 * @property {string} created_at
 * @property {string} [original_host]
 * @property {string} permissions
 * @property {string} text
 * @property {string} [timeline_host]
 * @property {string} uuid
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

module.exports = undefined;
