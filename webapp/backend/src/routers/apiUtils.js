const types = require(`../types`);
const {
  downvotePost,
  upvotePost
} = require(`../db`);

/**
 * @param {{ uuid: string }} payload object containing a post uuid
 */
const doSavePostUpvote = async (payload) => {
  const newScore = await upvotePost(payload.uuid)

  return newScore;
};

/**
 * @param {{ uuid: string }} payload object containing a post uuid
 */
const doSavePostDownvote = async (payload) => {
  const newScore = await downvotePost(payload.uuid)

  return newScore;
};

/**
 * @param {types.TimelineDTO} payload post to share
 */
const doSavePostShare = async (payload) => {
  console.log(payload);
};

module.exports = {
  doSavePostShare,
  doSavePostUpvote
};
