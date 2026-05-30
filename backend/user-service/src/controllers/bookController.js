const db = require('../config/db');

exports.getBooks = (req, res) => {
  db.query(
    'SELECT * FROM books',
    (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(results);
    }
  );
};

exports.createBook = (req, res) => {
  const {
    title,
    author,
    year,
    category_id,
    stock
  } = req.body;

  const sql = `
    INSERT INTO books
    (title, author, year, category_id, stock)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [title, author, year, category_id, stock],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.status(201).json({
        message: 'Book created',
        id: result.insertId
      });
    }
  );
};