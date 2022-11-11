import path from 'path';
import * as url from 'url';
import express from 'express';

const port = process.env.PORT ?? 3000;

const app = express();
const here = url.fileURLToPath(new URL('.', import.meta.url));

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NODE_NAME:', process.env.NODE_NAME);
console.log('USER_NAME:', process.env.USER_NAME);

app.use(express.static(path.resolve(here, '..', 'dist')));
app.use('*', (req, res) => {
  res.sendFile(path.resolve(here, '..', 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`frontend static server listening on ${port}`);
});
process.once('SIGTERM', () => {
  process.exit(2);
});
