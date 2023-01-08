function getMessageFromError(ex: unknown) {
  return typeof ex === `object` && ex !== null && `message` in ex
    ? ex.message
    : JSON.stringify(ex);
}

export {
  getMessageFromError
};
