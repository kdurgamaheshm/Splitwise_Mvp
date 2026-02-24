const { Expense, ExpenseMember } = require('../models');
const { Op } = require('sequelize');

const calculateUserBalances = async (currentUserId) => {
  // 1. Get all expenses I PAID
  const paidExpenses = await Expense.findAll({
    where: { paidByUserId: currentUserId },
    include: [{ model: ExpenseMember, as: 'members' }]
  });

  // 2. Get all expenses where I am a MEMBER but NOT the payer
  const memberExpenses = await ExpenseMember.findAll({
    where: { userId: currentUserId },
    include: [{ 
      model: Expense,
      where: { paidByUserId: { [Op.ne]: currentUserId } } 
    }]
  });

  const balanceMap = {}; // { otherUserId: netAmount }

  // Process expenses I paid: others owe me (Positive)
  paidExpenses.forEach(exp => {
    exp.members.forEach(member => {
      if (member.userId !== currentUserId) {
        const otherId = member.userId;
        balanceMap[otherId] = (balanceMap[otherId] || 0) + parseFloat(member.splitAmount);
      }
    });
  });

  // Process expenses others paid: I owe them (Negative)
  memberExpenses.forEach(me => {
    const payerId = me.Expense.paidByUserId;
    balanceMap[payerId] = (balanceMap[payerId] || 0) - parseFloat(me.splitAmount);
  });

  // Format the result
  return Object.keys(balanceMap).map(otherId => ({
    otherUserId: parseInt(otherId),
    amount: balanceMap[otherId].toFixed(2)
  }));
};

module.exports = { calculateUserBalances };
