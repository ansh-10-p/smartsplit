import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Analytics = () => {
  const [expenses, setExpenses] = useState([]);
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    const savedExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    setExpenses(savedExpenses);
    
    // Calculate analytics
    const totalSpent = savedExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const categoryBreakdown = savedExpenses.reduce((acc, exp) => {
      const category = exp.category || 'Other';
      acc[category] = (acc[category] || 0) + parseFloat(exp.amount || 0);
      return acc;
    }, {});
    
    const topSpender = savedExpenses.reduce((acc, exp) => {
      acc[exp.paidBy] = (acc[exp.paidBy] || 0) + parseFloat(exp.amount || 0);
      return acc;
    }, {});
    
    setAnalytics({
      totalSpent,
      categoryBreakdown,
      topSpender,
      totalExpenses: savedExpenses.length
    });
  }, []);

  const exportData = () => {
    const dataStr = JSON.stringify(expenses, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'smartSplit-expenses.json';
    link.click();
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-2">
                <span className="emoji-pulse">📊</span>
                Analytics
              </h1>
              <p className="text-gray-300">Insights into your spending patterns</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportData}
                className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
              >
                <span className="emoji-bounce">📤</span> Export Data
              </button>
              <Link 
                to="/dashboard" 
                className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="text-2xl font-bold text-blue-400 mb-1">₹{analytics.totalSpent?.toFixed(2) || '0.00'}</div>
            <div className="text-gray-300 text-sm">Total Spent</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="text-2xl font-bold text-green-400 mb-1">{analytics.totalExpenses || 0}</div>
            <div className="text-gray-300 text-sm">Total Expenses</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {analytics.totalExpenses > 0 ? (analytics.totalSpent / analytics.totalExpenses).toFixed(2) : '0.00'}
            </div>
            <div className="text-gray-300 text-sm">Avg per Expense</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="text-2xl font-bold text-orange-400 mb-1">
              {Object.keys(analytics.categoryBreakdown || {}).length}
            </div>
            <div className="text-gray-300 text-sm">Categories</div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <span className="emoji-float">🏷️</span>
                Category Breakdown
              </h3>
              <div className="space-y-4">
                {Object.entries(analytics.categoryBreakdown || {})
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{category.split(' ')[0]}</div>
                        <div>
                          <div className="text-white font-medium">{category}</div>
                          <div className="text-gray-300 text-sm">
                            {((amount / analytics.totalSpent) * 100).toFixed(1)}% of total
                          </div>
                        </div>
                      </div>
                      <div className="text-white font-semibold">₹{amount.toFixed(2)}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Top Spenders */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <span className="emoji-rotate">👥</span>
                Top Spenders
              </h3>
              <div className="space-y-4">
                {Object.entries(analytics.topSpender || {})
                  .sort((a, b) => b[1] - a[1])
                  .map(([person, amount]) => (
                    <div key={person} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {person.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-medium">{person}</div>
                          <div className="text-gray-300 text-sm">
                            {((amount / analytics.totalSpent) * 100).toFixed(1)}% of total
                          </div>
                        </div>
                      </div>
                      <div className="text-white font-semibold">₹{amount.toFixed(2)}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <span className="emoji-shake">📋</span>
              Recent Expenses
            </h3>
            {expenses.length > 0 ? (
              <div className="space-y-4">
                {expenses.slice(0, 10).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                    <div>
                      <div className="text-white font-medium">{expense.title}</div>
                      <div className="text-gray-300 text-sm">
                        {new Date(expense.date).toLocaleDateString()} • {expense.category || 'No category'} • Paid by {expense.paidBy}
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
                <p className="text-gray-300">No expenses to analyze yet</p>
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
  );
};

export default Analytics;
