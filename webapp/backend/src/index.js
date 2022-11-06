const dotenv = require('dotenv');
const express = require('express');

const {
  initialize
} = require('./db');
const {
  refreshTimeline
} = require('./util');

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: `${__dirname}/../.env.development` });
}

console.log(`NODE_ENV:`, process.env.NODE_ENV);
console.log(`NODE_NAME:`, process.env.NODE_NAME);

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
apiRouter.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});
apiRouter.options('*', (req, res) => {
  res.status(200)
    .header('Access-Control-Allow-Headers', '*')
    .end();
});
apiRouter.use('/auth', authRouter);
apiRouter.use('/my', privateApiRouter);
apiRouter.use('/public', publicApiRouter);
app.use('/rss', rssRouter);
app.use('/api/1', apiRouter);

app.listen(process.env.PORT, async () => {
  await initialize();

  console.log(`ready on ${process.env.PORT}`);

  refreshTimeline();
});
process.once('SIGTERM', () => {
  process.exit(2);
});
