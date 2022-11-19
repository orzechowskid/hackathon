const path = require('path');

const express = require('express');

const {
  initialize,
  upsertAuthor
} = require('../src/db');
const apiRouter = require('../src/index');

if (!process.env.PORT) {
  console.error('process.env.PORT not set');
  process.exit(1);
}
else if (!process.env.NODE_NAME) {
  console.error('process.env.NODE_NAME not set');
  process.exit(1);
}

const app = express();

app.use('/api/1', apiRouter);
app.use('/', express.static(path.resolve(__dirname, '..', '..', 'frontend', 'dist')));

app.listen(+process.env.PORT, async () => {
  // TODO: please write a real db up-ness check
  try {
    await initialize();
  }
  catch (ex) {
    await new Promise((res) => setTimeout(res, 2500));
    await initialize();
  }

  upsertAuthor();
  console.log(`${process.env.NODE_NAME} ready on ${process.env.PORT}`);
});
process.once('SIGTERM', () => {
  process.exit(2);
});
