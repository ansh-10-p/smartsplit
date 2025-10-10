import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import AICategorizer from '../components/AICategorizer';

const AddExpense = () => {
  const navigate = useNavigate();
  const [expenseData, setExpenseData] = useState({
    title: '',
    amount: '',
    paidBy: '',
    splitType: 'equal', // equal, percentage, custom
    participants: [],
    percentages: {},
    customAmounts: {},
    category: '',
    description: ''
  });

  const [participantInput, setParticipantInput] = useState('');
  const [voiceInput, setVoiceInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [meme, setMeme] = useState(null);
  const [loadingMeme, setLoadingMeme] = useState(false);

  const categories = [
    '🍽️ Food & Dining',
    '🏠 Rent & Utilities', 
    '🚗 Travel & Transport',
    '🛒 Shopping',
    '🎬 Entertainment',
    '💊 Healthcare',
    '📚 Education',
    '🏃‍♂️ Fitness',
    '🎉 Events',
    '📱 Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpenseData({
      ...expenseData,
      [name]: value
    });
  };

  const fetchMeme = async () => {
    try {
      setLoadingMeme(true);
      // Public meme API — CORS-friendly endpoints may vary. This one often works.
      const res = await fetch('https://meme-api.com/gimme');
      const data = await res.json();
      if (data && data.url) {
        setMeme({ url: data.url, title: data.title || 'Meme' });
      }
    } catch (e) {
      // no-op UI-friendly
    } finally {
      setLoadingMeme(false);
    }
  };

  useEffect(() => {
    fetchMeme();
  }, []);

  const addParticipant = () => {
    if (participantInput.trim() && !expenseData.participants.includes(participantInput.trim())) {
      const newParticipant = participantInput.trim();
      setExpenseData({
        ...expenseData,
        participants: [...expenseData.participants, newParticipant],
        percentages: { ...expenseData.percentages, [newParticipant]: 0 },
        customAmounts: { ...expenseData.customAmounts, [newParticipant]: 0 }
      });
      setParticipantInput('');
    }
  };

  const removeParticipant = (participant) => {
    const nextPercentages = Object.fromEntries(
      Object.entries(expenseData.percentages).filter(([k]) => k !== participant)
    );
    const nextCustom = Object.fromEntries(
      Object.entries(expenseData.customAmounts).filter(([k]) => k !== participant)
    );
    setExpenseData({
      ...expenseData,
      participants: expenseData.participants.filter(p => p !== participant),
      percentages: nextPercentages,
      customAmounts: nextCustom
    });
  };

  const updatePercentage = (participant, percentage) => {
    setExpenseData({
      ...expenseData,
      percentages: { ...expenseData.percentages, [participant]: parseFloat(percentage) || 0 }
    });
  };

  const updateCustomAmount = (participant, amount) => {
    setExpenseData({
      ...expenseData,
      customAmounts: { ...expenseData.customAmounts, [participant]: parseFloat(amount) || 0 }
    });
  };

  const calculateSplit = () => {
    const amount = parseFloat(expenseData.amount);
    if (!amount || expenseData.participants.length === 0) return {};

    if (expenseData.splitType === 'equal') {
      const n = expenseData.participants.length;
      const base = Math.floor((amount / n) * 100) / 100; // round down to 2dp
      const splits = {};
      let assigned = 0;
      expenseData.participants.forEach((p, idx) => {
        const isLast = idx === n - 1;
        const v = isLast ? +(amount - assigned).toFixed(2) : base;
        splits[p] = v;
        assigned = +(assigned + v).toFixed(2);
      });
      return splits;
    }

    if (expenseData.splitType === 'percentage') {
      const totalPct = expenseData.participants.reduce((s, p) => s + (Number(expenseData.percentages[p]) || 0), 0);
      if (Math.abs(totalPct - 100) > 0.01) return {};
      const splits = expenseData.participants.reduce((acc, p) => {
        acc[p] = +(((Number(expenseData.percentages[p]) || 0) / 100) * amount).toFixed(2);
        return acc;
      }, {});
      // adjust rounding remainder on last participant
      const sum = Object.values(splits).reduce((s, v) => s + (Number(v) || 0), 0);
      const diff = +(amount - sum).toFixed(2);
      if (Math.abs(diff) >= 0.01) {
        const last = expenseData.participants[expenseData.participants.length - 1];
        splits[last] = +((splits[last] || 0) + diff).toFixed(2);
      }
      return splits;
    }

    if (expenseData.splitType === 'custom') {
      const splits = expenseData.customAmounts;
      const sum = Object.values(splits).reduce((s, v) => s + (Number(v) || 0), 0);
      if (Math.abs(sum - amount) > 0.5) return {}; // reuse loose tolerance
      return Object.fromEntries(Object.entries(splits).map(([k, v]) => [k, +(Number(v) || 0).toFixed(2)]));
    }

    return {};
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      setIsListening(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setVoiceInput(transcript);
        
        // Parse voice input (simple implementation)
        const amountMatch = transcript.match(/₹?(\d+(?:\.\d{2})?)/);
        const nameMatch = transcript.match(/by\s+(\w+)/i);
        
        if (amountMatch) {
          setExpenseData({ ...expenseData, amount: amountMatch[1] });
        }
        if (nameMatch) {
          setExpenseData({ ...expenseData, paidBy: nameMatch[1] });
        }
        
        // Extract expense description
        const descMatch = transcript.match(/^(?:add\s+)?(.*?)(?:\s+(?:₹|by|for))/i);
        if (descMatch) {
          setExpenseData({ ...expenseData, title: descMatch[1].trim() });
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const splitAmounts = calculateSplit();
    
    // Save to localStorage (in a real app, this would go to a backend)
    const expense = {
      id: Date.now(),
      ...expenseData,
      splitAmounts,
      date: new Date().toISOString(),
      settled: false
    };
    
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    
    navigate('/dashboard');
  };

  const splitAmounts = calculateSplit();

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Add Expense</h1>
              <p className="text-gray-300">Track and split your shared expenses</p>
            </div>
            <Link 
              to="/dashboard" 
              className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              ← Back
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Voice Input */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">🎤 Voice Input (Beta)</h3>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={isListening}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-500/20 text-red-400 border border-red-400/50' 
                    : 'bg-blue-500/20 text-blue-400 border border-blue-400/50 hover:bg-blue-500/30'
                }`}
              >
                {isListening ? '🎤 Listening...' : '🎤 Start Voice Input'}
              </button>
              {voiceInput && (
                <div className="flex-1 p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-gray-300 text-sm">Heard: "{voiceInput}"</p>
                </div>
              )}
            </div>
            <p className="text-gray-400 text-xs mt-2">
              Try saying: "Add ₹500 dinner bill by Raj" or "₹200 chai expense by Sarah"
            </p>
          </div>

          {/* AI Categorizer */}
          <AICategorizer onCategorySelect={(category) => setExpenseData({...expenseData, category})} />

          {/* Basic Info */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">📝 Expense Details</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={expenseData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Dinner at Pizza Palace"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={expenseData.amount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="500"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Paid By *
                </label>
                <input
                  type="text"
                  name="paidBy"
                  value={expenseData.paidBy}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Who paid for this?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={expenseData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={expenseData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional notes..."
                rows="3"
              />
            </div>
          </div>

          {/* Participants */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">👥 Participants</h3>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={participantInput}
                onChange={(e) => setParticipantInput(e.target.value)}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add participant name"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addParticipant())}
              />
              <button
                type="button"
                onClick={addParticipant}
                className="px-4 py-3 bg-blue-500/20 text-blue-400 border border-blue-400/50 rounded-lg hover:bg-blue-500/30 transition-all duration-300"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {expenseData.participants.map(participant => (
                <div key={participant} className="flex items-center bg-white/10 rounded-lg px-3 py-2 border border-white/20">
                  <span className="text-white mr-2">{participant}</span>
                  <button
                    type="button"
                    onClick={() => removeParticipant(participant)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Meme reminder panel */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold text-white">😅 Friendly Reminder</h3>
              <button type="button" onClick={fetchMeme}
                      className="px-3 py-2 rounded border border-white/20 hover:bg-white/10 text-sm">
                {loadingMeme ? 'Loading…' : 'New meme'}
              </button>
            </div>
            <div className="space-y-4">
              <div className="text-slate-300 text-sm">Share this with your friends who still haven't paid 😜</div>
              <div className="bg-black/20 rounded overflow-hidden border border-white/10 max-w-md mx-auto">
                {meme ? (
                  <img src={meme.url} alt={meme.title} className="w-full h-48 object-cover"/>
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-400">No meme loaded</div>
                )}
              </div>
            </div>
          </div>

          {/* Split Logic */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">⚖️ Split Logic</h3>
            
            <div className="space-y-4">
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="splitType"
                    value="equal"
                    checked={expenseData.splitType === 'equal'}
                    onChange={handleInputChange}
                    className="mr-2 text-blue-500"
                  />
                  <span className="text-gray-300">Equal Split</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="splitType"
                    value="percentage"
                    checked={expenseData.splitType === 'percentage'}
                    onChange={handleInputChange}
                    className="mr-2 text-blue-500"
                  />
                  <span className="text-gray-300">Percentage Split</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="splitType"
                    value="custom"
                    checked={expenseData.splitType === 'custom'}
                    onChange={handleInputChange}
                    className="mr-2 text-blue-500"
                  />
                  <span className="text-gray-300">Custom Amount</span>
                </label>
              </div>

              {/* Split Preview */}
              {expenseData.participants.length > 0 && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-white font-medium mb-3">Split Preview:</h4>
                  <div className="space-y-2">
                    {expenseData.participants.map(participant => (
                      <div key={participant} className="flex items-center justify-between">
                        <span className="text-gray-300">{participant}</span>
                        <div className="flex items-center space-x-2">
                          {expenseData.splitType === 'percentage' && (
                            <input
                              type="number"
                              value={expenseData.percentages[participant] || 0}
                              onChange={(e) => updatePercentage(participant, e.target.value)}
                              className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                              placeholder="%"
                              min="0"
                              max="100"
                            />
                          )}
                          {expenseData.splitType === 'custom' && (
                            <input
                              type="number"
                              value={expenseData.customAmounts[participant] || 0}
                              onChange={(e) => updateCustomAmount(participant, e.target.value)}
                              className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                              placeholder="₹"
                              step="0.01"
                            />
                          )}
                          <span className="text-white font-semibold">
                            ₹{splitAmounts[participant]?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-white/10 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-medium">Total:</span>
                        <span className="text-white font-bold">
                          ₹{Object.values(splitAmounts).reduce((sum, amount) => sum + (amount || 0), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            Add Expense
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
