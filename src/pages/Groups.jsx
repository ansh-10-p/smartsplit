import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', members: [] });
  const [memberInput, setMemberInput] = useState('');

  useEffect(() => {
    const savedGroups = JSON.parse(localStorage.getItem('groups') || '[]');
    setGroups(savedGroups);
  }, []);

  const addMember = () => {
    if (memberInput.trim() && !newGroup.members.includes(memberInput.trim())) {
      setNewGroup({
        ...newGroup,
        members: [...newGroup.members, memberInput.trim()]
      });
      setMemberInput('');
    }
  };

  const removeMember = (member) => {
    setNewGroup({
      ...newGroup,
      members: newGroup.members.filter(m => m !== member)
    });
  };

  const createGroup = () => {
    if (!newGroup.name.trim()) return;
    
    const group = {
      id: Date.now(),
      ...newGroup,
      createdAt: new Date().toISOString(),
      expenses: []
    };
    
    const updatedGroups = [...groups, group];
    setGroups(updatedGroups);
    localStorage.setItem('groups', JSON.stringify(updatedGroups));
    
    setNewGroup({ name: '', description: '', members: [] });
    setShowCreateForm(false);
  };

  const deleteGroup = (groupId) => {
    const updatedGroups = groups.filter(g => g.id !== groupId);
    setGroups(updatedGroups);
    localStorage.setItem('groups', JSON.stringify(updatedGroups));
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-2">
                <span className="emoji-pulse">👥</span>
                Groups
              </h1>
              <p className="text-gray-300">Manage your expense groups and teams</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-2"
              >
                <span className="emoji-scale">➕</span> Create Group
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

        {/* Create Group Form */}
        {showCreateForm && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Create New Group</h3>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Group Name *</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Roommates, Office Team"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <input
                  type="text"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Members</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMember())}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add member name"
                />
                <button
                  onClick={addMember}
                  className="px-4 py-3 bg-blue-500/20 text-blue-400 border border-blue-400/50 rounded-lg hover:bg-blue-500/30 transition-all duration-300"
                >
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {newGroup.members.map(member => (
                  <div key={member} className="flex items-center bg-white/10 rounded-lg px-3 py-2 border border-white/20">
                    <span className="text-white mr-2">{member}</span>
                    <button
                      onClick={() => removeMember(member)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={createGroup}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300"
              >
                Create Group
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-3 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Groups Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.length > 0 ? (
            groups.map(group => (
              <div key={group.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">{group.name}</h3>
                    <p className="text-gray-300 text-sm">{group.description || 'No description'}</p>
                  </div>
                  <button
                    onClick={() => deleteGroup(group.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Delete group"
                  >
                    🗑️
                  </button>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-300 mb-2">Members ({group.members.length})</div>
                  <div className="flex flex-wrap gap-1">
                    {group.members.map(member => (
                      <span key={member} className="text-xs bg-white/10 px-2 py-1 rounded text-white">
                        {member}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 mb-4">
                  Created {new Date(group.createdAt).toLocaleDateString()}
                </div>
                
                <div className="flex gap-2">
                  <Link
                    to={`/dashboard?group=${group.id}`}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 text-center"
                  >
                    Open Group
                  </Link>
                  <Link
                    to={`/add-expense?group=${group.id}`}
                    className="flex-1 bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-all duration-300 text-center border border-white/20"
                  >
                    Add Expense
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4 emoji-float">👥</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Groups Yet</h3>
              <p className="text-gray-300 mb-4">Create your first group to start managing shared expenses</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              >
                Create First Group
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Groups;
