const db = require('../config/db');

exports.getCategories = (req, res) => {
  db.query(
    'SELECT * FROM categories',
    (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(results);
    }
  );
};

exports.createCategory = (req, res) => {
  const { name } = req.body;

  db.query(
    'INSERT INTO categories (name) VALUES (?)',
    [name],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.status(201).json({
        message: 'Category created',
        id: result.insertId
      });
    }
  );
};