import React, { useState } from 'react';

const AICategorizer = ({ onCategorySelect }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  
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

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    onCategorySelect(category);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-semibold text-white mb-4">🤖 AI Expense Categorizer</h3>
      <p className="text-gray-300 text-sm mb-4">Let AI suggest the perfect category for your expense</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-blue-500/20 text-blue-400 border border-blue-400/50'
                : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      
      {selectedCategory && (
        <div className="mt-4 p-3 bg-green-500/10 border border-green-400/30 rounded-lg">
          <p className="text-green-400 text-sm">
            ✅ Selected: <span className="font-semibold">{selectedCategory}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default AICategorizer;

