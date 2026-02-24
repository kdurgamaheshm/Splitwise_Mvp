const sequelize = require('../config/database');
const User = require('./User');
const Expense = require('./Expense');
const ExpenseMember = require('./ExpenseMember');

// Associations

// 1. User paid for many expenses
User.hasMany(Expense, { foreignKey: 'paidByUserId', as: 'paidExpenses' });
Expense.belongsTo(User, { foreignKey: 'paidByUserId', as: 'payer' });

// 2. Expense has many members (who owe money)
Expense.hasMany(ExpenseMember, { foreignKey: 'expenseId', as: 'members', onDelete: 'CASCADE' });
ExpenseMember.belongsTo(Expense, { foreignKey: 'expenseId' });

// 3. User is part of many expenses (as a member)
User.hasMany(ExpenseMember, { foreignKey: 'userId', as: 'expenseParticipations' });
ExpenseMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Expense,
  ExpenseMember,
};
