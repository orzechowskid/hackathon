import path from 'path';
import * as url from 'url';
import express from 'express';

const port = process.env.PORT ?? 3000;

const app = express();
const here = url.fileURLToPath(new URL('.', import.meta.url));

app.use(express.static(path.resolve(here, `../dist`)));

app.listen(port, () => {
  console.log(`frontend static server listening on ${port}`);
});
process.once('SIGTERM', () => {
  process.exit(2);
});
