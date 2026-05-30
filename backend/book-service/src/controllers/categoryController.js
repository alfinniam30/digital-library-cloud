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
        message: 'Category created successfully',
        id: result.insertId
      });
    }
  );
};

exports.getCategoryById = (req, res) => {
  const { id } = req.params;

  db.query(
    'SELECT * FROM categories WHERE id = ?',
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: 'Category not found'
        });
      }

      res.json(results[0]);
    }
  );
};

exports.updateCategory = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  db.query(
    'UPDATE categories SET name=? WHERE id=?',
    [name, id],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: 'Category updated successfully'
      });
    }
  );
};

exports.deleteCategory = (req, res) => {
  const { id } = req.params;

  db.query(
    'DELETE FROM categories WHERE id=?',
    [id],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: 'Category deleted successfully'
      });
    }
  );
};