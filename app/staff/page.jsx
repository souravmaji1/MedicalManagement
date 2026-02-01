'use client'

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, Plus, Trash2, Users, Award, Search, X, Home,Pill,User2Icon,NetworkIcon,
  CreditCard,
  CheckCircle, AlertTriangle, Loader2, Edit2, User, Phone, Activity,Bell,ChevronRight,
  Mail, Calendar, Clock, FileText, Shield, TrendingUp, Info,ChevronDown
} from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { ScrollArea } from "../../components/ui/scroll-area";
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '../../contexts/userProfileContext';
import { PERMISSIONS } from '../../utils/permissions';

const supabase = createClient(
  'https://bbikcxalypttfgrlxstf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWtjeGFseXB0dGZncmx4c3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODcwOCwiZXhwIjoyMDY5Mjk0NzA4fQ.4BLQyvPA0eB745Sfdn2Tl4oCDRTzNhLXrJ8Os8wOXfs'
);

const StaffTrainingPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { userProfile, loading: profileLoading, hasPermission, hasAnyPermission } = useUserProfile();

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all-staff');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for new/edit staff
  const [formData, setFormData] = useState({
    staff_name: '',
    staff_id: '',
    employee_number: '',
    role: '',
    division: '',
    facility: '',
    shift_assignment: '1st Shift',
    contact_phone: '',
    contact_email: '',
    hire_date: '',
    employment_status: 'Active',
    certifications: [],
    training_completed: [],
    training_required: [],
    notes: ''
  });

  // Permission checks
  const canViewStaff = hasAnyPermission([
    PERMISSIONS.PLANS_VIEW,
    PERMISSIONS.PLANS_CREATE,
    PERMISSIONS.PLANS_EDIT,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canManageStaff = hasAnyPermission([
    PERMISSIONS.PLANS_CREATE,
    PERMISSIONS.PLANS_EDIT,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  // Fetch staff data
  useEffect(() => {
    if (isLoaded && user && !profileLoading && userProfile) {
      if (canViewStaff) {
        fetchStaff();
      } else {
        setLoading(false);
      }
    }
  }, [isLoaded, user, profileLoading, userProfile]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false });

      // Role-based filtering
      if (userProfile.role_id === 'HouseManager_DD') {
        query = query.eq('facility', userProfile.facility);
      } else if (userProfile.role_id === 'DSP_DD') {
        query = query.eq('facility', userProfile.facility);
      } else if (userProfile.division === 'MI' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        query = query.eq('division', 'MI');
      } else if (userProfile.division === 'SUD' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        query = query.eq('division', 'SUD');
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setStaff(data || []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      alert('Error loading staff data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddStaff = async () => {
    if (!canManageStaff) {
      alert('You do not have permission to add staff.');
      return;
    }

    if (!formData.staff_name || !formData.employee_number) {
      alert('Please fill in required fields (Name and Employee Number).');
      return;
    }

    try {
      setSaving(true);
      
      const { data, error } = await supabase
        .from('staff')
        .insert([{
          ...formData,
          created_by: userProfile.fullname,
          created_by_role: userProfile.role_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      alert('Staff member added successfully!');
      setShowAddModal(false);
      resetForm();
      fetchStaff();
    } catch (error) {
      console.error('Error adding staff:', error);
      alert('Error adding staff member. Please try again.');
    } finally {
      setSaving(false);
    }
  };

 const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('staff');


  
       const menuItems = [
           { id: 'dashboard', icon: Home, label: 'Dashboard', badge: null },
           { id: 'individual', icon: Users, label: 'Individuals', badge: null },
           { id: 'medicine', icon: Pill, label: 'Medications', badge: null },
           { id: 'incident', icon: AlertTriangle, label: 'Incidents', badge: '3' },
            { id: 'bill', icon: Shield, label: 'Billing Report', badge: 'NEW' },
             { id: 'staff', icon: User2Icon, label: 'Add Staff', badge: 'NEW' },
           { id: 'privacy', icon: Shield, label: 'Data Privacy', badge: 'NEW' },
           { id: 'report', icon: FileText, label: 'Report', badge: 'NEW' },
           { id: 'engine', icon: Pill, label: 'Foresight Engine', badge: 'NEW' },
           { id: 'intelligence', icon: NetworkIcon, label: 'User Foresight', badge: 'NEW' },
           { id: 'billing', icon: CreditCard, label: 'Billing', badge: null },
           { id: 'analytics', icon: TrendingUp, label: 'Analytics', badge: null }
         ];

  
    // NavBar Component
    const NavBar = () => (
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-900/20 backdrop-blur-xl border-b border-slate-800/50 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-2xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/50 animate-pulse">
                <Activity className="text-white" size={26} />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                CareBridge Pro
              </h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide">IPMS Aligned EMR</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm rounded-2xl px-5 py-2.5 w-96 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300">
            <Search size={18} className="text-emerald-400" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-500"
            />
            <kbd className="px-2 py-0.5 text-xs bg-slate-700 rounded text-slate-400 font-mono">⌘K</kbd>
          </div>
          
          <button className="relative p-2.5 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105 group">
            <Bell size={20} className="text-slate-300 group-hover:text-emerald-400 transition-colors" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gradient-to-r from-lime-500 to-green-600 rounded-full animate-pulse shadow-lg shadow-green-500/50"></span>
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-slate-700/50 cursor-pointer hover:bg-white/5 rounded-xl p-2 transition-all duration-300 group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                {userProfile?.fullname || 'User'}
              </p>
              <p className="text-xs text-slate-400 font-medium">
                {userProfile?.role_name || 'Staff'} • Online
              </p>
            </div>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/50">
                <UserButton afterSignOutUrl="/" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
            </div>
            <ChevronDown size={16} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
          </div>
        </div>
      </div>
    );
  
    // Sidebar Component
    const Sidebar = () => (
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-900/10 border-r border-slate-800/50 transition-all duration-300 flex flex-col backdrop-blur-xl h-screen`}>
        <div className="p-6 border-b border-slate-800/50 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-slate-300 font-semibold">System Online</span>
            </div>
            <div className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
              <span className="text-emerald-400 text-xs font-bold">v2.0</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Daily Progress</span>
              <span className="text-xs text-emerald-400 font-bold">87%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-1000" style={{width: '87%'}}></div>
            </div>
          </div>
        </div>
        
        <ScrollArea className="flex-1 px-4 py-4">
          <div className="mb-2 px-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Main Menu</span>
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  if (item.id !== 'reports') {
                    router.push(`/${item.id === 'dashboard' ? 'dashboard' : item.id}`);
                  }
                  if (window.innerWidth < 1024) setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl mb-2 transition-all duration-300 group relative overflow-hidden ${
                  isActive 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/50 scale-105' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white hover:scale-105'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-500/20 animate-pulse"></div>
                )}
                <Icon size={20} className={`relative z-10 ${isActive ? 'animate-pulse' : ''}`} />
                <span className="font-semibold relative z-10 flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className={`relative z-10 px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight size={16} className="relative z-10 animate-pulse" />}
              </button>
            );
          })}
        </ScrollArea>
        
        <div className="p-4 border-t border-slate-800/50 space-y-3 flex-shrink-0">
          <div className="bg-gradient-to-br from-emerald-900/30 via-teal-900/30 to-green-900/30 rounded-xl p-4 border border-emerald-500/30 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="text-emerald-400" size={18} />
                <p className="text-sm font-bold text-white">IPMS Certified</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">Alabama DD Compliant System</p>
            </div>
          </div>
        </div>
      </div>
    );

  const handleUpdateStaff = async () => {
    if (!canManageStaff) {
      alert('You do not have permission to edit staff.');
      return;
    }

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('staff')
        .update({
          ...formData,
          updated_by: userProfile.fullname,
          updated_by_role: userProfile.role_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedStaff.id);

      if (error) throw error;

      alert('Staff member updated successfully!');
      setIsEditing(false);
      setSelectedStaff({ ...formData, id: selectedStaff.id });
      fetchStaff();
    } catch (error) {
      console.error('Error updating staff:', error);
      alert('Error updating staff member. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (!canManageStaff) {
      alert('You do not have permission to delete staff.');
      return;
    }

    if (!confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', staffId);

      if (error) throw error;

      alert('Staff member deleted successfully!');
      if (selectedStaff?.id === staffId) {
        setSelectedStaff(null);
      }
      fetchStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Error deleting staff member. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      staff_name: '',
      staff_id: '',
      employee_number: '',
      role: '',
      division: '',
      facility: '',
      shift_assignment: '1st Shift',
      contact_phone: '',
      contact_email: '',
      hire_date: '',
      employment_status: 'Active',
      certifications: [],
      training_completed: [],
      training_required: [],
      notes: ''
    });
  };

  const handleSelectStaff = (staffMember) => {
    setSelectedStaff(staffMember);
    setFormData(staffMember);
    setIsEditing(false);
  };

  const addCertification = () => {
    const newCert = {
      id: Date.now().toString(),
      name: '',
      issue_date: '',
      expiry_date: '',
      issuing_org: '',
      status: 'Active'
    };
    setFormData(prev => ({
      ...prev,
      certifications: [...(prev.certifications || []), newCert]
    }));
  };

  const updateCertification = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert =>
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const deleteCertification = (id) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }));
  };

  const addTrainingCompleted = () => {
    const newTraining = {
      id: Date.now().toString(),
      training_name: '',
      completion_date: '',
      trainer: '',
      hours: '',
      notes: ''
    };
    setFormData(prev => ({
      ...prev,
      training_completed: [...(prev.training_completed || []), newTraining]
    }));
  };

  const updateTrainingCompleted = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      training_completed: prev.training_completed.map(training =>
        training.id === id ? { ...training, [field]: value } : training
      )
    }));
  };

  const deleteTrainingCompleted = (id) => {
    setFormData(prev => ({
      ...prev,
      training_completed: prev.training_completed.filter(training => training.id !== id)
    }));
  };

  const addTrainingRequired = () => {
    const newReq = {
      id: Date.now().toString(),
      training_name: '',
      due_date: '',
      frequency: 'Annually',
      priority: 'Medium',
      status: 'Pending'
    };
    setFormData(prev => ({
      ...prev,
      training_required: [...(prev.training_required || []), newReq]
    }));
  };

  const updateTrainingRequired = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      training_required: prev.training_required.map(req =>
        req.id === id ? { ...req, [field]: value } : req
      )
    }));
  };

  const deleteTrainingRequired = (id) => {
    setFormData(prev => ({
      ...prev,
      training_required: prev.training_required.filter(req => req.id !== id)
    }));
  };

  // Filter staff based on search and active tab
  const filteredStaff = staff.filter(s => {
    const matchesSearch = 
      s.staff_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.employee_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role?.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'all-staff') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && s.employment_status === 'Active';
    if (activeTab === 'inactive') return matchesSearch && s.employment_status !== 'Active';
    if (activeTab === 'training-due') {
      const hasOverdueTraining = s.training_required?.some(req => 
        req.status === 'Pending' && new Date(req.due_date) < new Date()
      );
      return matchesSearch && hasOverdueTraining;
    }
    return matchesSearch;
  });

  // Get initials for avatar
  const getInitials = (name) => {
    const parts = name?.split(' ') || [];
    return parts.length > 1 
      ? `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
      : name?.substring(0, 2).toUpperCase() || 'ST';
  };

  // Color classes for avatars
  const getColorClass = (index) => {
    const colors = [
      'from-blue-600 to-cyan-500',
      'from-purple-600 to-pink-500',
      'from-green-600 to-emerald-500',
      'from-orange-600 to-red-500',
      'from-indigo-600 to-purple-500'
    ];
    return colors[index % colors.length];
  };

  // Permission check - No access
  if (!profileLoading && !canViewStaff) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
          <p className="text-slate-400 mb-6">
            You do not have permission to view staff management. Please contact your administrator.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!isLoaded || loading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Loading staff data...</p>
        </div>
      </div>
    );
  }

  // Main render - Staff list view
  if (!selectedStaff) {
    return (
     <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
      <NavBar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        
        
           <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <main className="p-6 lg:p-8">
                  <div className="max-w-7xl mx-auto space-y-6">
                
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
              >
                <ArrowLeft className="text-white" size={20} />
              </button>
              <div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                  Staff & Training Management
                </h1>
                <p className="text-slate-400 mt-1">Manage staff members, certifications, and training requirements</p>
              </div>
            </div>
            {canManageStaff && (
              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-blue-500/50 transition-all"
              >
                <Plus size={18} />
                Add Staff Member
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="text-blue-400" size={24} />
                <span className="text-2xl font-bold text-white">{staff.filter(s => s.employment_status === 'Active').length}</span>
              </div>
              <p className="text-slate-300 text-sm font-semibold">Active Staff</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-600/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="text-emerald-400" size={24} />
                <span className="text-2xl font-bold text-white">
                  {staff.filter(s => s.training_completed?.length > 0).length}
                </span>
              </div>
              <p className="text-slate-300 text-sm font-semibold">Training Complete</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-600/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="text-yellow-400" size={24} />
                <span className="text-2xl font-bold text-white">
                  {staff.reduce((acc, s) => acc + (s.training_required?.filter(req => req.status === 'Pending').length || 0), 0)}
                </span>
              </div>
              <p className="text-slate-300 text-sm font-semibold">Training Pending</p>
            </div>
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Award className="text-purple-400" size={24} />
                <span className="text-2xl font-bold text-white">
                  {staff.reduce((acc, s) => acc + (s.certifications?.length || 0), 0)}
                </span>
              </div>
              <p className="text-slate-300 text-sm font-semibold">Total Certifications</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 flex items-center gap-3 bg-slate-800/50 rounded-lg px-4 py-3">
                <Search size={20} className="text-purple-400" />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search staff by name, employee #, or role..."
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-500"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="p-1 hover:bg-slate-700 rounded"
                  >
                    <X size={18} className="text-slate-400" />
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2">
                {[
                  { id: 'all-staff', label: 'All Staff', count: staff.length },
                  { id: 'active', label: 'Active', count: staff.filter(s => s.employment_status === 'Active').length },
                  { id: 'inactive', label: 'Inactive', count: staff.filter(s => s.employment_status !== 'Active').length },
                  { id: 'training-due', label: 'Training Due', count: staff.filter(s => s.training_required?.some(req => req.status === 'Pending' && new Date(req.due_date) < new Date())).length }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Staff Grid */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            {filteredStaff.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <h3 className="text-xl font-bold text-slate-400 mb-2">No staff members found</h3>
                <p className="text-slate-500">
                  {searchTerm ? 'Try adjusting your search' : 'Add your first staff member to get started'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStaff.map((staffMember, idx) => (
                  <div
                    key={staffMember.id}
                    onClick={() => handleSelectStaff(staffMember)}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 cursor-pointer hover:border-purple-500/50 transition-all duration-300 hover:scale-105 group"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${getColorClass(idx)} rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
                        {getInitials(staffMember.staff_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold truncate group-hover:text-purple-400 transition-colors">
                          {staffMember.staff_name}
                        </h3>
                        <p className="text-slate-400 text-sm truncate">{staffMember.employee_number}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">{staffMember.role || 'No role assigned'}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          staffMember.employment_status === 'Active' 
                            ? 'bg-green-900/30 text-green-400' 
                            : 'bg-yellow-900/30 text-yellow-400'
                        }`}>
                          {staffMember.employment_status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Award size={12} />
                          {staffMember.certifications?.length || 0} certs
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle size={12} />
                          {staffMember.training_completed?.length || 0} completed
                        </span>
                      </div>

                      {staffMember.training_required?.some(req => 
                        req.status === 'Pending' && new Date(req.due_date) < new Date()
                      ) && (
                        <div className="flex items-center gap-1 text-xs text-orange-400 bg-orange-600/10 px-2 py-1 rounded">
                          <AlertTriangle size={12} />
                          <span>Training overdue</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Staff Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Add New Staff Member</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="staff_name"
                        value={formData.staff_name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Employee Number <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="employee_number"
                        value={formData.employee_number}
                        onChange={handleInputChange}
                        placeholder="EMP-12345"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Role / Position</label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                      >
                        <option value="">Select Role</option>
                        <option value="Direct Support Professional (DSP)">Direct Support Professional (DSP)</option>
                        <option value="House Manager">House Manager</option>
                        <option value="QDDP">QDDP</option>
                        <option value="Nurse">Nurse</option>
                        <option value="Behavioral Specialist">Behavioral Specialist</option>
                        <option value="Job Coach">Job Coach</option>
                        <option value="Case Manager">Case Manager</option>
                        <option value="Administrator">Administrator</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Division</label>
                      <select
                        name="division"
                        value={formData.division}
                        onChange={handleInputChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                      >
                        <option value="">Select Division</option>
                        <option value="DD">Developmental Disabilities (DD)</option>
                        <option value="MI">Mental Illness (MI)</option>
                        <option value="SUD">Substance Use Disorder (SUD)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Facility</label>
                      <input
                        type="text"
                        name="facility"
                        value={formData.facility}
                        onChange={handleInputChange}
                        placeholder="Facility name"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Shift Assignment</label>
                      <select
                        name="shift_assignment"
                        value={formData.shift_assignment}
                        onChange={handleInputChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                      >
                        <option value="1st Shift">1st Shift (Day)</option>
                        <option value="2nd Shift">2nd Shift (Evening)</option>
                        <option value="3rd Shift">3rd Shift (Night)</option>
                        <option value="Awake Overnight">Awake Overnight</option>
                        <option value="Rotating">Rotating</option>
                        <option value="PRN / As Needed">PRN / As Needed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Contact Phone</label>
                      <input
                        type="tel"
                        name="contact_phone"
                        value={formData.contact_phone}
                        onChange={handleInputChange}
                        placeholder="(555) 123-4567"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Contact Email</label>
                      <input
                        type="email"
                        name="contact_email"
                        value={formData.contact_email}
                        onChange={handleInputChange}
                        placeholder="john.doe@example.com"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Hire Date</label>
                      <input
                        type="date"
                        name="hire_date"
                        value={formData.hire_date}
                        onChange={handleInputChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Employment Status</label>
                      <select
                        name="employment_status"
                        value={formData.employment_status}
                        onChange={handleInputChange}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                      >
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Terminated">Terminated</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-400 mb-2">Notes</label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Additional notes about this staff member..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddStaff}
                    disabled={saving || !formData.staff_name || !formData.employee_number}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Add Staff Member
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        </div>
        </main>
        </ScrollArea>
        </div>
        </div>
      </div>
    );
  }

  // Detail view for selected staff
  return (
      <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
      <NavBar />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setSelectedStaff(null);
                setIsEditing(false);
              }}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                {formData.staff_name}
              </h1>
              <p className="text-slate-400 mt-1">Employee #: {formData.employee_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(selectedStaff);
                  }}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStaff}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <>
                {canManageStaff && (
                  <>
                    <button
                      onClick={() => handleDeleteStaff(selectedStaff.id)}
                      className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl font-semibold transition-all flex items-center gap-2"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all"
                    >
                      <Edit2 size={18} />
                      Edit Profile
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Award className="text-blue-400" size={24} />
              <span className="text-2xl font-bold text-white">{formData.certifications?.length || 0}</span>
            </div>
            <p className="text-slate-300 text-sm font-semibold">Certifications</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-600/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-emerald-400" size={24} />
              <span className="text-2xl font-bold text-white">{formData.training_completed?.length || 0}</span>
            </div>
            <p className="text-slate-300 text-sm font-semibold">Training Completed</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-600/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="text-yellow-400" size={24} />
              <span className="text-2xl font-bold text-white">
                {formData.training_required?.filter(req => req.status === 'Pending').length || 0}
              </span>
            </div>
            <p className="text-slate-300 text-sm font-semibold">Training Pending</p>
          </div>
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-purple-400" size={24} />
              <span className={`text-2xl font-bold ${formData.employment_status === 'Active' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {formData.employment_status}
              </span>
            </div>
            <p className="text-slate-300 text-sm font-semibold">Status</p>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-400px)]">
          <div className="pr-4 space-y-6">
            {/* Basic Information */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-400" />
                Staff Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="staff_name"
                    value={formData.staff_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Employee Number</label>
                  <input
                    type="text"
                    name="employee_number"
                    value={formData.employee_number}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Role / Position</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                  >
                    <option value="">Select Role</option>
                    <option value="Direct Support Professional (DSP)">Direct Support Professional (DSP)</option>
                    <option value="House Manager">House Manager</option>
                    <option value="QDDP">QDDP</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Behavioral Specialist">Behavioral Specialist</option>
                    <option value="Job Coach">Job Coach</option>
                    <option value="Case Manager">Case Manager</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Division</label>
                  <select
                    name="division"
                    value={formData.division}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                  >
                    <option value="">Select Division</option>
                    <option value="DD">Developmental Disabilities (DD)</option>
                    <option value="MI">Mental Illness (MI)</option>
                    <option value="SUD">Substance Use Disorder (SUD)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Facility</label>
                  <input
                    type="text"
                    name="facility"
                    value={formData.facility}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Shift Assignment</label>
                  <select
                    name="shift_assignment"
                    value={formData.shift_assignment}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                  >
                    <option value="1st Shift">1st Shift (Day)</option>
                    <option value="2nd Shift">2nd Shift (Evening)</option>
                    <option value="3rd Shift">3rd Shift (Night)</option>
                    <option value="Awake Overnight">Awake Overnight</option>
                    <option value="Rotating">Rotating</option>
                    <option value="PRN / As Needed">PRN / As Needed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Contact Email</label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Hire Date</label>
                  <input
                    type="date"
                    name="hire_date"
                    value={formData.hire_date}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Employment Status</label>
                  <select
                    name="employment_status"
                    value={formData.employment_status}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows="3"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Award size={20} className="text-purple-400" />
                  Certifications
                </h3>
                {isEditing && (
                  <button
                    onClick={addCertification}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
                  >
                    <Plus size={16} />
                    Add Certification
                  </button>
                )}
              </div>

              {(!formData.certifications || formData.certifications.length === 0) ? (
                <div className="text-center py-12 bg-slate-900/50 rounded-lg">
                  <Award className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-sm text-slate-400">No certifications added yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.certifications.map((cert) => (
                    <div key={cert.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-400 mb-1">
                            Certification Name
                          </label>
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                            disabled={!isEditing}
                            placeholder="e.g., CPR/First Aid, Medication Administration"
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Issue Date</label>
                          <input
                            type="date"
                            value={cert.issue_date}
                            onChange={(e) => updateCertification(cert.id, 'issue_date', e.target.value)}
                            disabled={!isEditing}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Expiry Date</label>
                          <input
                            type="date"
                            value={cert.expiry_date}
                            onChange={(e) => updateCertification(cert.id, 'expiry_date', e.target.value)}
                            disabled={!isEditing}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Issuing Organization</label>
                          <input
                            type="text"
                            value={cert.issuing_org}
                            onChange={(e) => updateCertification(cert.id, 'issuing_org', e.target.value)}
                            disabled={!isEditing}
                            placeholder="e.g., American Red Cross"
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                          <select
                            value={cert.status}
                            onChange={(e) => updateCertification(cert.id, 'status', e.target.value)}
                            disabled={!isEditing}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all"
                          >
                            <option value="Active">Active</option>
                            <option value="Expired">Expired</option>
                            <option value="Pending Renewal">Pending Renewal</option>
                          </select>
                        </div>
                        {isEditing && (
                          <div className="md:col-span-2">
                            <button
                              onClick={() => deleteCertification(cert.id)}
                              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm"
                            >
                              <Trash2 size={14} />
                              Delete Certification
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Training Completed */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <CheckCircle size={20} className="text-emerald-400" />
                  Training Completed
                </h3>
                {isEditing && (
                  <button
                    onClick={addTrainingCompleted}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all"
                  >
                    <Plus size={16} />
                    Add Training
                  </button>
                )}
              </div>

              {(!formData.training_completed || formData.training_completed.length === 0) ? (
                <div className="text-center py-12 bg-slate-900/50 rounded-lg">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-sm text-slate-400">No training completed yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.training_completed.map((training) => (
                    <div key={training.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-400 mb-1">Training Name</label>
                          <input
                            type="text"
                            value={training.training_name}
                            onChange={(e) => updateTrainingCompleted(training.id, 'training_name', e.target.value)}
                            disabled={!isEditing}
                            placeholder="e.g., HCBS Rights Training, Behavior Management"
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Completion Date</label>
                          <input
                            type="date"
                            value={training.completion_date}
                            onChange={(e) => updateTrainingCompleted(training.id, 'completion_date', e.target.value)}
                            disabled={!isEditing}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Trainer</label>
                          <input
                            type="text"
                            value={training.trainer}
                            onChange={(e) => updateTrainingCompleted(training.id, 'trainer', e.target.value)}
                            disabled={!isEditing}
                            placeholder="Trainer name"
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Hours</label>
                          <input
                            type="number"
                            value={training.hours}
                            onChange={(e) => updateTrainingCompleted(training.id, 'hours', e.target.value)}
                            disabled={!isEditing}
                            placeholder="Hours"
                            step="0.5"
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-400 mb-1">Notes</label>
                          <textarea
                            value={training.notes}
                            onChange={(e) => updateTrainingCompleted(training.id, 'notes', e.target.value)}
                            disabled={!isEditing}
                            rows="2"
                            placeholder="Additional notes about this training..."
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all resize-none"
                          />
                        </div>
                        {isEditing && (
                          <div className="md:col-span-2">
                            <button
                              onClick={() => deleteTrainingCompleted(training.id)}
                              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm"
                            >
                              <Trash2 size={14} />
                              Delete Training
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Training Required */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock size={20} className="text-yellow-400" />
                  Training Required
                </h3>
                {isEditing && (
                  <button
                    onClick={addTrainingRequired}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-all"
                  >
                    <Plus size={16} />
                    Add Requirement
                  </button>
                )}
              </div>

              {(!formData.training_required || formData.training_required.length === 0) ? (
                <div className="text-center py-12 bg-slate-900/50 rounded-lg">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-sm text-slate-400">No training requirements</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.training_required.map((req) => (
                    <div 
                      key={req.id} 
                      className={`bg-slate-900/50 border rounded-lg p-4 ${
                        req.status === 'Pending' && new Date(req.due_date) < new Date()
                          ? 'border-red-500/50'
                          : 'border-slate-700'
                      }`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-400 mb-1">Training Name</label>
                          <input
                            type="text"
                            value={req.training_name}
                            onChange={(e) => updateTrainingRequired(req.id, 'training_name', e.target.value)}
                            disabled={!isEditing}
                            placeholder="e.g., Annual Compliance Training"
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 disabled:opacity-50 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Due Date</label>
                          <input
                            type="date"
                            value={req.due_date}
                            onChange={(e) => updateTrainingRequired(req.id, 'due_date', e.target.value)}
                            disabled={!isEditing}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 disabled:opacity-50 transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Frequency</label>
                          <select
                            value={req.frequency}
                            onChange={(e) => updateTrainingRequired(req.id, 'frequency', e.target.value)}
                            disabled={!isEditing}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 disabled:opacity-50 transition-all"
                          >
                            <option value="One-Time">One-Time</option>
                            <option value="Annually">Annually</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Monthly">Monthly</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
                          <select
                            value={req.priority}
                            onChange={(e) => updateTrainingRequired(req.id, 'priority', e.target.value)}
                            disabled={!isEditing}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 disabled:opacity-50 transition-all"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                          <select
                            value={req.status}
                            onChange={(e) => updateTrainingRequired(req.id, 'status', e.target.value)}
                            disabled={!isEditing}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 disabled:opacity-50 transition-all"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                        {isEditing && (
                          <div className="md:col-span-2">
                            <button
                              onClick={() => deleteTrainingRequired(req.id)}
                              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm"
                            >
                              <Trash2 size={14} />
                              Delete Requirement
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Overdue warning */}
                      {req.status === 'Pending' && new Date(req.due_date) < new Date() && (
                        <div className="mt-3 bg-red-600/10 border border-red-500/30 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-semibold text-red-400">Training Overdue</p>
                              <p className="text-xs text-slate-300 mt-1">
                                This training was due on {new Date(req.due_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default StaffTrainingPage;