const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      sql,
      [name, email, hashedPassword, role || 'mahasiswa'],
      (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        res.status(201).json({
          message: 'User registered successfully',
          userId: result.insertId
        });
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      const user = results[0];

      const isMatch = await bcrypt.compare(
        password,
        user.password
      );

      if (!isMatch) {
        return res.status(401).json({
          message: 'Wrong password'
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '1d'
        }
      );

      res.json({
        message: 'Login success',
        token
      });
    }
  );
};

exports.getUsers = (req, res) => {
  db.query(
    'SELECT id, name, email, role, created_at FROM users',
    (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(results);
    }
  );
};

exports.getUserById = (req, res) => {
  const { id } = req.params;

  db.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      res.json(results[0]);
    }
  );
};

exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  db.query(
    'UPDATE users SET name=?, email=?, role=? WHERE id=?',
    [name, email, role, id],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: 'User updated successfully'
      });
    }
  );
};

exports.deleteUser = (req, res) => {
  const { id } = req.params;

  db.query(
    'DELETE FROM users WHERE id=?',
    [id],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: 'User deleted successfully'
      });
    }
  );
};