const express = require('express');
const router = express.Router();

const {
  getBorrowings,
  createBorrowing,
  getReturns,
  createReturn
} = require('../controllers/loanController');

router.get('/borrowings', getBorrowings);
router.post('/borrowings', createBorrowing);

router.get('/returns', getReturns);
router.post('/returns', createReturn);

module.exports = router;