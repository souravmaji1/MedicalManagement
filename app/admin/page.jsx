'use client'

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Users, Shield, Edit2, Trash2, Save, X, Search, Filter,
  ChevronDown, Loader2, UserCog, CheckCircle, AlertCircle,
  Mail, Phone, Building2, Award, RefreshCw
} from 'lucide-react';

const supabase = createClient(
  'https://bbikcxalypttfgrlxstf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWtjeGFseXB0dGZncmx4c3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODcwOCwiZXhwIjoyMDY5Mjk0NzA4fQ.4BLQyvPA0eB745Sfdn2Tl4oCDRTzNhLXrJ8Os8wOXfs'
);

const UserProfilesAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDivision, setFilterDivision] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const divisions = ['DD', 'MI', 'SUD', 'PEER'];

  const allPermissions = [
    // DD Permissions
    { id: 'daily_notes', label: 'Daily Notes', division: 'DD' },
    { id: 'adls', label: 'ADLs', division: 'DD' },
    { id: 'incidents', label: 'Incidents', division: 'DD' },
    { id: 'mar', label: 'MAR', division: 'DD' },
    { id: 'approve_notes', label: 'Approve Notes', division: 'DD' },
    { id: 'approve_incidents', label: 'Approve Incidents', division: 'DD' },
    { id: 'approve_mar', label: 'Approve MAR', division: 'DD' },
    { id: 'plans', label: 'Plans', division: 'DD' },
    { id: 'review_all', label: 'Review All', division: 'DD' },
    { id: 'hcbs_dashboard', label: 'HCBS Dashboard', division: 'DD' },
    { id: 'medications', label: 'Medications', division: 'DD' },
    { id: 'mar_approve', label: 'MAR Approve', division: 'DD' },
    { id: 'health_tracking', label: 'Health Tracking', division: 'DD' },
    
    // MI Permissions
    { id: 'shift_notes', label: 'Shift Notes', division: 'MI' },
    { id: 'behaviors', label: 'Behaviors', division: 'MI' },
    { id: 'clinical_notes', label: 'Clinical Notes', division: 'MI' },
    { id: 'treatment_plans', label: 'Treatment Plans', division: 'MI' },
    { id: 'assessments', label: 'Assessments', division: 'MI' },
    { id: 'med_orders', label: 'Med Orders', division: 'MI' },
    { id: 'diagnoses', label: 'Diagnoses', division: 'MI' },
    { id: 'approve_plans', label: 'Approve Plans', division: 'MI' },
    { id: 'review_incidents', label: 'Review Incidents', division: 'MI' },
    { id: 'peer_notes', label: 'Peer Notes', division: 'MI' },
    { id: 'recovery_goals', label: 'Recovery Goals', division: 'MI' },
    
    // SUD Permissions
    { id: 'counseling_notes', label: 'Counseling Notes', division: 'SUD' },
    { id: 'asam', label: 'ASAM', division: 'SUD' },
    { id: 'recovery_plan', label: 'Recovery Plan', division: 'SUD' },
    { id: 'relapse_logs', label: 'Relapse Logs', division: 'SUD' },
    { id: 'mat_tracking', label: 'MAT Tracking', division: 'SUD' },
    { id: 'withdrawal', label: 'Withdrawal', division: 'SUD' },
    { id: 'vitals', label: 'Vitals', division: 'SUD' },
    { id: 'mat_full', label: 'MAT Full Access', division: 'SUD' },
    { id: 'dose_logs', label: 'Dose Logs', division: 'SUD' },
    { id: 'approve_all', label: 'Approve All', division: 'SUD' },
    
    // Peer Permissions
    { id: 'community_activities', label: 'Community Activities', division: 'PEER' },
    { id: 'cps_notes', label: 'CPS Notes', division: 'PEER' },
    { id: 'recovery_support', label: 'Recovery Support', division: 'PEER' },
    { id: 'peer_recovery_notes', label: 'Peer Recovery Notes', division: 'PEER' },
    { id: 'relapse_support', label: 'Relapse Support', division: 'PEER' },
    
    // Universal Permissions
    { id: 'reports', label: 'Reports', division: 'ALL' },
    { id: 'admin', label: 'Admin', division: 'ALL' },
    { id: 'full_access', label: 'Full Access', division: 'ALL' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showMessage('Error loading users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setEditForm({
      fullname: user.fullname,
      email: user.email,
      phone: user.phone || '',
      facility: user.facility || '',
      certification: user.certification || '',
      division: user.division,
      role_name: user.role_name,
      permissions: user.permissions || []
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm(null);
  };

  const togglePermission = (permissionId) => {
    setEditForm(prev => {
      const currentPermissions = prev.permissions || [];
      const hasPermission = currentPermissions.includes(permissionId);
      
      return {
        ...prev,
        permissions: hasPermission
          ? currentPermissions.filter(p => p !== permissionId)
          : [...currentPermissions, permissionId]
      };
    });
  };

  const handleSave = async (userId) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('user_profiles')
        .update({
          fullname: editForm.fullname,
          email: editForm.email,
          phone: editForm.phone,
          facility: editForm.facility,
          certification: editForm.certification,
          division: editForm.division,
          role_name: editForm.role_name,
          permissions: editForm.permissions,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      await fetchUsers();
      setEditingUser(null);
      setEditForm(null);
      showMessage('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      showMessage('Error updating user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      await fetchUsers();
      showMessage('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      showMessage('Error deleting user', 'error');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDivision = filterDivision === 'all' || user.division === filterDivision;
    
    return matchesSearch && matchesDivision;
  });

  const getDivisionColor = (division) => {
    const colors = {
      DD: 'bg-emerald-600',
      MI: 'bg-blue-600',
      SUD: 'bg-purple-600',
      PEER: 'bg-orange-600'
    };
    return colors[division] || 'bg-slate-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Admin Management</h1>
              <p className="text-slate-400">Manage user profiles, roles, and permissions</p>
            </div>
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Users className="text-emerald-400" size={24} />
                <div>
                  <p className="text-slate-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                </div>
              </div>
            </div>
            {divisions.map(div => (
              <div key={div} className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${getDivisionColor(div)} rounded-lg flex items-center justify-center`}>
                    <Shield className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">{div}</p>
                    <p className="text-2xl font-bold text-white">{users.filter(u => u.division === div).length}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <select
              value={filterDivision}
              onChange={(e) => setFilterDivision(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Divisions</option>
              {divisions.map(div => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'error' ? 'bg-red-900/30 border border-red-700' : 'bg-emerald-900/30 border border-emerald-700'
          }`}>
            {message.type === 'error' ? (
              <AlertCircle className="text-red-400" size={20} />
            ) : (
              <CheckCircle className="text-emerald-400" size={20} />
            )}
            <span className={message.type === 'error' ? 'text-red-300' : 'text-emerald-300'}>
              {message.text}
            </span>
          </div>
        )}

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-12 text-center">
              <Users className="mx-auto text-slate-600 mb-4" size={48} />
              <p className="text-slate-400 text-lg">No users found</p>
            </div>
          ) : (
            filteredUsers.map(user => (
              <div
                key={user.id}
                className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6"
              >
                {editingUser === user.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <UserCog className="text-emerald-400" size={24} />
                        Editing: {user.fullname}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(user.id)}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                        >
                          <X size={18} />
                          Cancel
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={editForm.fullname}
                          onChange={(e) => setEditForm({...editForm, fullname: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Facility</label>
                        <input
                          type="text"
                          value={editForm.facility}
                          onChange={(e) => setEditForm({...editForm, facility: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Certification</label>
                        <input
                          type="text"
                          value={editForm.certification}
                          onChange={(e) => setEditForm({...editForm, certification: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Division</label>
                        <select
                          value={editForm.division}
                          onChange={(e) => setEditForm({...editForm, division: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                        >
                          {divisions.map(div => (
                            <option key={div} value={div}>{div}</option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Role Name</label>
                        <input
                          type="text"
                          value={editForm.role_name}
                          onChange={(e) => setEditForm({...editForm, role_name: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">Permissions</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {allPermissions
                          .filter(p => p.division === editForm.division || p.division === 'ALL')
                          .map(permission => (
                            <button
                              key={permission.id}
                              onClick={() => togglePermission(permission.id)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                editForm.permissions?.includes(permission.id)
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              {permission.label}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 ${getDivisionColor(user.division)} rounded-xl flex items-center justify-center`}>
                          <Users className="text-white" size={28} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">{user.fullname}</h3>
                          <p className="text-emerald-400 font-medium">{user.role_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 ${getDivisionColor(user.division)} text-white text-xs rounded font-semibold`}>
                              {user.division}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Edit2 size={18} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.fullname)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 size={18} />
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Mail size={16} className="text-slate-400" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <Phone size={16} className="text-slate-400" />
                          {user.phone}
                        </div>
                      )}
                      {user.facility && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <Building2 size={16} className="text-slate-400" />
                          {user.facility}
                        </div>
                      )}
                      {user.certification && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <Award size={16} className="text-slate-400" />
                          {user.certification}
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-400 mb-2">Permissions:</p>
                      <div className="flex flex-wrap gap-2">
                        {user.permissions?.map(perm => (
                          <span key={perm} className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-lg">
                            {perm.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilesAdmin;