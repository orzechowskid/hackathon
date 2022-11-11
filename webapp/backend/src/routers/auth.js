const express = require('express');

const router = express.Router();

router.use(express.json());

router.post('/login', (req, res) => {
  const {
    password,
    username
  } = req.body;

  if (!password || !username) {
    res.status(400)
      .end();
  }
  else {
    res.status(200)
      .json({
        token: 'aaaaaaa',
        username
      })
      .end();
  }
});

router.get('/refresh', (req, res) => {
  res.status(200)
    .json({
      token: 'abc'
    })
    .end();
});

router.get('/session', (req, res) => {
  const {
    'x-jwt': token
  } = req.headers;

  if (token) {
    return res.status(200)
      .json({ username: process.env.USER_NAME })
      .end();
  }
  else {
    res.status(401)
      .end();
  }
});

module.exports = router;
