const { Expense, ExpenseMember, User, sequelize } = require('../models');
const { calculateUserBalances } = require('../utils/balanceHelper');
const { Op } = require('sequelize');

const addExpense = async (req, res) => {
  try {
    const { description, totalAmount, memberIds } = req.body;
    const paidByUserId = req.headers['userid'];

    if (!description || !totalAmount || !memberIds || !memberIds.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const expense = await Expense.create({
      description,
      totalAmount,
      paidByUserId
    });

    const splitAmount = totalAmount / memberIds.length;

    const memberRecords = memberIds.map(userId => ({
      expenseId: expense.id,
      userId: userId,
      splitAmount: splitAmount
    }));

    await ExpenseMember.bulkCreate(memberRecords);

    return res.status(201).json({
      message: 'Expense added successfully',
      expense
    });
  } catch (error) {
    console.error('Error adding expense:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const viewBalances = async (req, res) => {
  try {
    const currentUserId = parseInt(req.headers['userid']);
    if (!currentUserId) {
      return res.status(400).json({ error: 'UserId header missing' });
    }

    const user = await User.findByPk(currentUserId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const balances = await calculateUserBalances(currentUserId);

    return res.json({
      userId: currentUserId,
      currency: user.currency,
      balances
    });
  } catch (error) {
    console.error('Error viewing balances:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 1. View all expenses (where user is payer or member)
const getExpenses = async (req, res) => {
  try {
    const userId = req.headers['userid'];

    const expenses = await Expense.findAll({
      where: {
        [Op.or]: [
          { paidByUserId: userId },
          { '$members.userId$': userId }
        ]
      },
      include: [{
        model: ExpenseMember,
        as: 'members',
        attributes: ['userId', 'splitAmount']
      }],
      order: [['createdAt', 'DESC']]
    });

    return res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 2. Update Expense
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, totalAmount, memberIds } = req.body;
    const userId = req.headers['userid'];

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Only the person who paid can edit
    if (expense.paidByUserId != userId) {
      return res.status(403).json({ error: 'Only the payer can edit this expense' });
    }

    if (description) expense.description = description;
    if (totalAmount) expense.totalAmount = totalAmount;
    
    await expense.save();

    // If totalAmount or memberIds changed, we need to update splits
    if (totalAmount || memberIds) {
      // Use existing members if memberIds not provided
      const finalMemberIds = memberIds || (await ExpenseMember.findAll({ 
        where: { expenseId: id } 
      })).map(m => m.userId);

      const splitAmount = expense.totalAmount / finalMemberIds.length;

      // Delete old member records
      await ExpenseMember.destroy({ where: { expenseId: id } });

      // Create new ones
      const memberRecords = finalMemberIds.map(mId => ({
        expenseId: id,
        userId: mId,
        splitAmount: splitAmount
      }));
      await ExpenseMember.bulkCreate(memberRecords);
    }

    return res.json({ message: 'Expense updated successfully', expense });
  } catch (error) {
    console.error('Error updating expense:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// 3. Delete Expense
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['userid'];

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Only the person who paid can delete
    if (expense.paidByUserId != userId) {
      return res.status(403).json({ error: 'Only the payer can delete this expense' });
    }

    await expense.destroy(); // This will also delete ExpenseMember records due to CASCADE
    return res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  addExpense,
  viewBalances,
  getExpenses,
  updateExpense,
  deleteExpense
};
