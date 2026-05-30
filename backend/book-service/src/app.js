require('dotenv').config();
require('./config/db');

const express = require('express');
const cors = require('cors');

const bookRoutes = require('./routes/bookRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    service: 'Book Service',
    status: 'running'
  });
});

app.use('/api/books', bookRoutes);
app.use('/api/categories', categoryRoutes);

module.exports = app;