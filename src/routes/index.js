const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const expenseController = require('../controllers/expenseController');

// User Routes
router.post('/users/signup', userController.createUser);
router.post('/users/login', userController.login);
router.get('/users/profile', userController.getProfile);
router.put('/users/profile', userController.updateProfile);
router.delete('/users/account', userController.deleteAccount);

// Expense Routes
router.post('/expenses', expenseController.addExpense);
router.get('/expenses', expenseController.getExpenses);
router.put('/expenses/:id', expenseController.updateExpense);
router.delete('/expenses/:id', expenseController.deleteExpense);
router.get('/balances', expenseController.viewBalances);

module.exports = router;
