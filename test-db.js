const mysql = require('mysql2');
const conn = mysql.createConnection({
  host: '34.101.155.16',
  user: 'alfin-library-db',
  password: 'Alfin12345!?@',
  database: 'perpustakaan_digital',
  connectTimeout: 10000
});
conn.connect(err => {
  if (err) {
    console.error('CONNECT_ERR', err);
    process.exit(1);
  }
  console.log('CONNECTED');
  conn.end();
});
