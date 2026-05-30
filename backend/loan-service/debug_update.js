require('dotenv').config();
const db = require('./src/config/db');

db.query("UPDATE borrowings SET status='returned' WHERE id = 3", (uErr, uRes) => {
  if (uErr) {
    console.error('UPD ERR', uErr);
    process.exit(1);
  }
  console.log('UPDATED', uRes);

  db.query('SELECT * FROM borrowings WHERE id = 3', (sErr, sRes) => {
    if (sErr) {
      console.error('SEL ERR', sErr);
      process.exit(1);
    }
    console.log(sRes);
    process.exit(0);
  });
});
