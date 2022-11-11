const express = require('express');

if (!process.env.PORT) {
  console.error('$PORT not defined');
  process.exit(1);
}

// Redis set pls
const hostsToNames = {
  // Redis set pls
  'aged-meadow-3015.fly.dev': 'danorz'
};
const namesToHosts = {
  'danorz': 'aged-meadow-3015.fly.dev'
};

const app = express();

app.use((req, res, next) => {
  console.log(req.method, req.path, req.params);
  next();
});

const apiRouter = express.Router();

apiRouter.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});
apiRouter.options('*', (req, res) => {
  res.status(200)
    .header('Access-Control-Allow-Headers', '*')
    .end();
});
apiRouter.use(express.json());

apiRouter.get('/explore', (req, res) => {
  res.status(200)
    .json({
      topics: [
        'helloweb'
      ],
      users: []
    })
    .end();
});

apiRouter.get('/available', (req, res) => {
  const {
    id
  } = req.query

  if (!id) {
    res.status(400)
      .end();
  }
  else {
    res.status(200)
      .json({ available: !namesToHosts[id] })
      .end();
  }
});

apiRouter.get('/host', (req, res) => {
  const {
    id
  } = req.query;

  if (!id) {
    res.status(400).end();
  }
  else {
    const url = namesToHosts[id];

    if (url) {
      res.status(200)
        .json({ url })
        .end();
    }
    else {
      res.status(404).end();
    }
  }
});

apiRouter.get('/name', (req, res) => {
  const {
    id
  } = req.query;

  if (!id) {
    res.status(400).end();
  }
  else {
    const url = hostsToNames[id];

    if (url) {
      res.status(200)
        .json({ url })
        .end();
    }
    else {
      res.status(404).end();
    }
  }
});

apiRouter.post('/register', (req, res) => {
  const {
    inviteId
  } = req.query;
  const {
    id,
    url
  } = req.body;

  if (!inviteId || !id || !url) {
    res.status(400).end();
  }

  res.status(200).end();
});

app.use('/api/1', apiRouter);

app.listen(process.env.PORT, () => {
  console.log(`addressbook service up on ${process.env.PORT}`);
});
