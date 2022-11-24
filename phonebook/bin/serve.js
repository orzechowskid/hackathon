const app = require('../src/index');

if (!process.env.PORT) {
  console.error('no port specified');

  process.exit(1);
}

app.listen(process.env.PORT, () => {
  console.log(`listening on ${process.env.PORT}`);
});
