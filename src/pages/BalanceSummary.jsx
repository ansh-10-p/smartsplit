import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BalanceSummary = () => {
  const [balances, setBalances] = useState({});
  const [settlements, setSettlements] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    // Load expenses from localStorage
    const savedExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    setExpenses(savedExpenses);
    
    // Calculate balances
    const calculatedBalances = calculateBalances(savedExpenses);
    setBalances(calculatedBalances);
    
    // Calculate optimal settlements
    const optimalSettlements = calculateOptimalSettlements(calculatedBalances);
    setSettlements(optimalSettlements);
  }, []);

  const calculateBalances = (expenses) => {
    const balances = {};
    
    expenses.forEach(expense => {
      if (!expense.settled) {
        const paidBy = expense.paidBy;
        const splitAmounts = expense.splitAmounts || {};
        
        // Add to the person who paid
        balances[paidBy] = (balances[paidBy] || 0) + parseFloat(expense.amount);
        
        // Subtract each participant's share (including the payer's own share)
        Object.entries(splitAmounts).forEach(([participant, amount]) => {
          const share = parseFloat(amount) || 0;
          balances[participant] = (balances[participant] || 0) - share;
        });
      }
    });
    
    return balances;
  };

  const calculateOptimalSettlements = (balances) => {
    const creditors = Object.entries(balances)
      .filter(([_, amount]) => amount > 0)
      .sort((a, b) => b[1] - a[1]);
    
    const debtors = Object.entries(balances)
      .filter(([_, amount]) => amount < 0)
      .sort((a, b) => a[1] - b[1]);
    
    const settlements = [];
    let i = 0, j = 0;
    
    while (i < creditors.length && j < debtors.length) {
      const [creditor, creditAmount] = creditors[i];
      const [debtor, debtAmount] = debtors[j];
      
      const settlementAmount = Math.min(+creditAmount.toFixed(2), Math.abs(+debtAmount.toFixed(2)));
      
      if (settlementAmount > 0.01) { // Ignore very small amounts
        settlements.push({
          from: debtor,
          to: creditor,
          amount: settlementAmount
        });
      }
      
      creditors[i][1] = +(creditors[i][1] - settlementAmount).toFixed(2);
      debtors[j][1] = +(debtors[j][1] + settlementAmount).toFixed(2);
      
      if (creditors[i][1] <= 0.01) i++;
      if (Math.abs(debtors[j][1]) <= 0.01) j++;
    }
    
    return settlements;
  };

  const markAsSettled = (settlement) => {
    const { from, to } = settlement;
    // Only mark expenses that include both parties and are currently unsettled
    const updatedExpenses = expenses.map(expense => {
      const participants = Object.keys(expense.splitAmounts || {});
      const involvesBoth = participants.includes(from) && participants.includes(to);
      if (!expense.settled && involvesBoth) {
        return { ...expense, settled: true };
      }
      return expense;
    });

    setExpenses(updatedExpenses);
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));

    const newBalances = calculateBalances(updatedExpenses);
    setBalances(newBalances);
    setSettlements(calculateOptimalSettlements(newBalances));
  };

  const getTotalOwed = () => {
    return Object.values(balances)
      .filter(amount => amount > 0)
      .reduce((sum, amount) => sum + amount, 0);
  };

  const getTotalDebt = () => {
    return Math.abs(Object.values(balances)
      .filter(amount => amount < 0)
      .reduce((sum, amount) => sum + amount, 0));
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Balance Summary</h1>
              <p className="text-gray-300">See who owes whom and settle up easily</p>
            </div>
            <Link 
              to="/dashboard" 
              className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="text-2xl font-bold text-green-400 mb-1">₹{getTotalOwed().toFixed(2)}</div>
            <div className="text-gray-300 text-sm">Total to be Collected</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="text-2xl font-bold text-red-400 mb-1">₹{getTotalDebt().toFixed(2)}</div>
            <div className="text-gray-300 text-sm">Total Debts</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="text-2xl font-bold text-white mb-1">{settlements.length}</div>
            <div className="text-gray-300 text-sm">Required Settlements</div>
          </div>
        </div>

        {/* Optimal Settlements */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6">💡 Optimal Settlements</h3>
              {settlements.length > 0 ? (
                <div className="space-y-4">
                  {settlements.map((settlement, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                          {settlement.from.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-300">pays</span>
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                            {settlement.to.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-white font-semibold">₹{settlement.amount.toFixed(2)}</div>
                        </div>
                        <Link 
                          to={`/upi?to=${settlement.to}&amount=${settlement.amount}&description=Settlement for shared expenses`}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300"
                        >
                          Pay Now
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h4 className="text-white font-medium mb-2">All Settled!</h4>
                  <p className="text-gray-300">No outstanding balances. Everyone is square!</p>
                </div>
              )}
            </div>
          </div>

          {/* Individual Balances */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6">👥 Individual Balances</h3>
              <div className="space-y-4">
                {Object.entries(balances).length > 0 ? (
                  Object.entries(balances)
                    .sort((a, b) => b[1] - a[1])
                    .map(([person, balance]) => (
                      <div key={person} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            balance > 0 
                              ? 'bg-gradient-to-r from-green-500 to-green-600' 
                              : balance < 0 
                                ? 'bg-gradient-to-r from-red-500 to-red-600'
                                : 'bg-gradient-to-r from-gray-500 to-gray-600'
                          }`}>
                            {person.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-medium">{person}</div>
                            <div className={`text-sm ${
                              balance > 0 
                                ? 'text-green-400' 
                                : balance < 0 
                                  ? 'text-red-400'
                                  : 'text-gray-400'
                            }`}>
                              {balance > 0 ? 'Should receive' : balance < 0 ? 'Owes' : 'Settled'}
                            </div>
                          </div>
                        </div>
                        <div className={`font-semibold ${
                          balance > 0 
                            ? 'text-green-400' 
                            : balance < 0 
                              ? 'text-red-400'
                              : 'text-gray-400'
                        }`}>
                          {balance > 0 ? '+' : ''}₹{balance.toFixed(2)}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📊</div>
                    <h4 className="text-white font-medium mb-2">No Expenses Yet</h4>
                    <p className="text-gray-300">Add some expenses to see balances here</p>
                    <Link 
                      to="/add-expense"
                      className="inline-block mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                    >
                      Add First Expense
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6">📋 Recent Expenses</h3>
            {expenses.length > 0 ? (
              <div className="space-y-4">
                {expenses.slice(0, 5).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div>
                      <div className="text-white font-medium">{expense.title}</div>
                      <div className="text-gray-300 text-sm">
                        {new Date(expense.date).toLocaleDateString()} • Paid by {expense.paidBy}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">₹{expense.amount}</div>
                      <div className={`text-sm ${expense.settled ? 'text-green-400' : 'text-yellow-400'}`}>
                        {expense.settled ? 'Settled' : 'Pending'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-300">No expenses added yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSummary;
