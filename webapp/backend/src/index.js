const express = require('express');

const {
  initialize,
  upsertAuthor
} = require('./db');

if (!process.env.PORT) {
  console.error('process.env.PORT not set');
  process.exit(1);
}

const authRouter = require('./routers/auth');
const publicApiRouter = require('./routers/publicApi');
const privateApiRouter = require('./routers/privateApi');
const rssRouter = require('./routers/rss');

const app = express();
const apiRouter = express.Router();

apiRouter.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`, req.query, req.body);
  next();
});
apiRouter.use('/auth', authRouter);
apiRouter.use('/my', privateApiRouter);
apiRouter.use('/public', publicApiRouter);
app.use('/rss', rssRouter);
app.use('/api/1', apiRouter);

app.listen(process.env.PORT, async () => {
  // TODO: please write a real db up-ness check
  try {
    await initialize();
  }
  catch (ex) {
    await new Promise((res) => setTimeout(res, 2500));
    await initialize();
  }

  upsertAuthor();
  console.log(`ready on ${process.env.PORT}`);
});
process.once('SIGTERM', () => {
  process.exit(2);
});
