const express = require(`express`);

const authRouter = require(`./routers/auth`);
const publicApiRouter = require(`./routers/publicApi`);
const privateApiRouter = require(`./routers/privateApi`);
const apiRouter = express.Router();

apiRouter.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`, req.query, req.body);
  next();
});
apiRouter.use(`/auth`, authRouter);
apiRouter.use(`/my`, privateApiRouter);
apiRouter.use(`/public`, publicApiRouter);

module.exports = apiRouter;
