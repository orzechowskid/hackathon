/**
 * @typedef {Object} DBRow
 * @property {number} _id
 */

/**
 * @typedef {DBRow & T} DBRecord<T>
 * @template T
 */

/**
 * @typedef {'public' | 'protected' | 'private' } PostVisibility
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
 * @property {string} [original_author]
 * @property {string} [original_created_at]
 * @property {string} [original_host]
 * @property {string} [original_uuid]
 * @property {PostVisibility} permissions
 * @property {number} score
 * @property {boolean} shared
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
 * @typedef {Object} ExternalNotificationDTO
 * @property {string} text
 */

/**
 * @typedef {Object} NotificationDTO
 * @property {string} host
 * @property {string} message
 * @property {string} created_at
 */

/**
 * @typedef {Object} SchemaDefinitionDTO
 * @property {string} sql
 * @property {number} version
 */

module.exports = undefined;
