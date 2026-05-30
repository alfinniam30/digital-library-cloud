require('dotenv').config();
require('./config/db');

const express = require('express');
const cors = require('cors');

const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');
const loanRoutes = require('./routes/loanRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ service: 'Backend', status: 'running' });
});

app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api', loanRoutes);

module.exports = app;
