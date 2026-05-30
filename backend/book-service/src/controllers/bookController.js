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

exports.getBookById = (req, res) => {
  const { id } = req.params;

  db.query(
    'SELECT * FROM books WHERE id = ?',
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: 'Book not found'
        });
      }

      res.json(results[0]);
    }
  );
};

exports.updateBook = (req, res) => {
  const { id } = req.params;

  const {
    title,
    author,
    year,
    category_id,
    stock
  } = req.body;

  db.query(
    `UPDATE books
     SET title=?, author=?, year=?, category_id=?, stock=?
     WHERE id=?`,
    [
      title,
      author,
      year,
      category_id,
      stock,
      id
    ],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: 'Book updated successfully'
      });
    }
  );
};

exports.deleteBook = (req, res) => {
  const { id } = req.params;

  db.query(
    'DELETE FROM books WHERE id=?',
    [id],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: 'Book deleted successfully'
      });
    }
  );
};