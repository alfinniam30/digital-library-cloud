const db = require('../config/db');

exports.getBorrowings = (req, res) => {
  const sql = `
    SELECT b.*, r.return_date
    FROM borrowings b
    LEFT JOIN (
      SELECT borrowing_id, MAX(return_date) AS return_date
      FROM returns
      GROUP BY borrowing_id
    ) r ON b.id = r.borrowing_id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(results);
  });
};

exports.createBorrowing = (req, res) => {
  const {
    user_id,
    book_id,
    borrow_date,
    status
  } = req.body;

  const checkStockSql = 'SELECT stock FROM books WHERE id = ?';
  db.query(checkStockSql, [book_id], (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const stock = results[0].stock;
    if (stock <= 0) {
      return res.status(400).json({ message: 'Stok buku tidak tersedia' });
    }

    const insertSql = `
      INSERT INTO borrowings
      (user_id, book_id, borrow_date, status)
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      insertSql,
      [user_id, book_id, borrow_date, status],
      (insertErr, result) => {
        if (insertErr) {
          return res.status(500).json(insertErr);
        }

        const updateStockSql = 'UPDATE books SET stock = stock - 1 WHERE id = ?';
        db.query(updateStockSql, [book_id], (updateErr) => {
          if (updateErr) {
            return res.status(500).json(updateErr);
          }

          res.status(201).json({
            message: 'Borrowing created',
            id: result.insertId
          });
        });
      }
    );
  });
};

exports.getReturns = (req, res) => {
  db.query(
    'SELECT * FROM returns',
    (err, results) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(results);
    }
  );
};

exports.createReturn = (req, res) => {
  const {
    borrowing_id,
    return_date,
    fine
  } = req.body;

  const getBorrowingSql = 'SELECT book_id, status FROM borrowings WHERE id = ?';
  db.query(getBorrowingSql, [borrowing_id], (getErr, results) => {
    if (getErr) {
      return res.status(500).json(getErr);
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Borrowing record not found' });
    }

    const { book_id, status } = results[0];

    if (status === 'returned') {
      return res.status(400).json({ message: 'Borrowing has already been returned' });
    }

    db.beginTransaction((transErr) => {
      if (transErr) {
        return res.status(500).json(transErr);
      }

      const insertReturnSql = `
        INSERT INTO returns
        (borrowing_id, return_date, fine)
        VALUES (?, ?, ?)
      `;

      db.query(
        insertReturnSql,
        [borrowing_id, return_date, fine],
        (insertErr, result) => {
          if (insertErr) {
            return db.rollback(() => res.status(500).json(insertErr));
          }

          const updateBorrowingSql = `
            UPDATE borrowings
            SET status = 'returned'
            WHERE id = ?
          `;

          db.query(updateBorrowingSql, [borrowing_id], (updateErr) => {
            if (updateErr) {
              return db.rollback(() => res.status(500).json(updateErr));
            }

            const updateStockSql = 'UPDATE books SET stock = stock + 1 WHERE id = ?';
            db.query(updateStockSql, [book_id], (stockErr) => {
              if (stockErr) {
                return db.rollback(() => res.status(500).json(stockErr));
              }

              db.commit((commitErr) => {
                if (commitErr) {
                  return db.rollback(() => res.status(500).json(commitErr));
                }

                res.status(201).json({
                  message: 'Return created',
                  id: result.insertId
                });
              });
            });
          });
        }
      );
    });
  });
};
