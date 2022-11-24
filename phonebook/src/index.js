const fs = require('fs/promises');
const path = require('path');

const express = require('express');

const app = express();

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.query);
  next();
});

app.get('/api/1/schema', async (req, res) => {
  const schemaFile = await fs.readFile(path.resolve(__dirname, '../../webapp/db/create.sql'))

  res.status(200)
    .json({
      sql: schemaFile.toString(),
      version: 1
    })
    .end();
});

module.exports = app;
