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

module.exports = router;
