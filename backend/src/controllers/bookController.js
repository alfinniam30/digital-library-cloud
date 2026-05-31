const db = require('../config/db');

const normalizeBookRow = (row) => {
  if (!row) return row;

  return {
    ...row,
    cover_image:
      row.cover_image == null
        ? null
        : Buffer.isBuffer(row.cover_image)
        ? row.cover_image.toString()
        : row.cover_image,
  };
};

exports.getBooks = (req, res) => {
  db.query('SELECT * FROM books', (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }

    const books = results.map(normalizeBookRow);
    res.json(books);
  });
};

exports.createBook = (req, res) => {
  const {
    title,
    author,
    year,
    category_id,
    stock,
    publisher,
    isbn,
    description,
    cover_image,
  } = req.body;

  const sql = `
    INSERT INTO books
    (title, author, year, category_id, stock, publisher, isbn, description, cover_image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      title,
      author,
      year,
      category_id,
      stock,
      publisher || null,
      isbn || null,
      description || null,
      cover_image || null,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.status(201).json({
        message: 'Book created',
        id: result.insertId,
      });
    }
  );
};

exports.getBookById = (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM books WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: 'Book not found',
      });
    }

    res.json(normalizeBookRow(results[0]));
  });
};

exports.updateBook = (req, res) => {
  const { id } = req.params;

  const {
    title,
    author,
    year,
    category_id,
    stock,
    publisher,
    isbn,
    description,
    cover_image,
  } = req.body;

  db.query(
    `UPDATE books
     SET title=?, author=?, year=?, category_id=?, stock=?, publisher=?, isbn=?, description=?, cover_image=?
     WHERE id=?`,
    [
      title,
      author,
      year,
      category_id,
      stock,
      publisher || null,
      isbn || null,
      description || null,
      cover_image || null,
      id,
    ],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: 'Book updated successfully',
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
