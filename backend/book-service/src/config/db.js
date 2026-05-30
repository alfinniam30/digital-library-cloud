const mysql = require('mysql2');

const commonConfig = {
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'perpustakaan_digital'
};

let connectionConfig;
if (process.env.CLOUD_SQL_CONNECTION_NAME) {
  connectionConfig = {
    ...commonConfig,
    socketPath: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`
  };
} else {
  connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    ...commonConfig
  };
}

console.log('CLOUD_SQL_CONNECTION_NAME=', process.env.CLOUD_SQL_CONNECTION_NAME);
console.log('Database connection config:', connectionConfig);

const connection = mysql.createConnection(connectionConfig);

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed:', connectionConfig, err);
    return;
  }

  console.log('MySQL Connected');
});

module.exports = connection;