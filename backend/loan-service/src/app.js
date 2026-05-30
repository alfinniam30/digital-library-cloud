require('dotenv').config();
require('./config/db');

const express = require('express');
const cors = require('cors');

const loanRoutes = require('./routes/loanRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    service: 'Loan Service',
    status: 'running'
  });
});

app.use('/api', loanRoutes);

module.exports = app;