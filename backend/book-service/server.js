const app = require('./src/app');

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Book Service running on port ${PORT}`);
});