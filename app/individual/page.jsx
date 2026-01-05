'use client';
import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Upload, Search, Filter, Eye, Edit2, Trash2,
  MapPin, Clock, CheckCircle, AlertCircle, Download, X,
  Save, FileText, Phone, Mail, Calendar, User, Home as HomeIcon, AlertTriangle,
  Shield, Heart, Activity, ChevronRight, Loader2,
  Home, FileText as FileTextIcon, Pill, AlertCircle as AlertCircleIcon,
  TrendingUp, Settings, Menu, Bell, ChevronDown, BarChart3, Brain,
  Zap, Sparkles, Award, TrendingDown, Target, StickyNote
} from 'lucide-react';
import { ScrollArea } from "../../components/ui/scroll-area";
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '../../contexts/userProfileContext';
import { PERMISSIONS } from '../../utils/permissions';
import { UserButton } from '@clerk/nextjs';

const supabase = createClient(
  'https://bbikcxalypttfgrlxstf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWtjeGFseXB0dGZncmx4c3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODcwOCwiZXhwIjoyMDY5Mjk0NzA4fQ.4BLQyvPA0eB745Sfdn2Tl4oCDRTzNhLXrJ8Os8wOXfs'
);

const IndividualsPage = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { userProfile, loading: profileLoading, hasPermission, hasAnyPermission } = useUserProfile();
  
  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('individual');

  // Permission checks
  const canViewIndividuals = hasAnyPermission([
    PERMISSIONS.DAILY_NOTES_VIEW,
    PERMISSIONS.DAILY_NOTES_CREATE,
    PERMISSIONS.PLANS_VIEW,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canAddIndividuals = hasAnyPermission([
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canEditIndividuals = hasAnyPermission([
    PERMISSIONS.PLANS_EDIT,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canDeleteIndividuals = hasAnyPermission([
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canImportIndividuals = hasAnyPermission([
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canExportIndividuals = hasAnyPermission([
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  // Form state for adding individual
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    individualid: '',
    dateofbirth: '',
    gender: '',
    phone: '',
    email: '',
    location: '',
    homeassignment: '',
    primarydiagnosis: '',
    guardianname: '',
    guardianphone: '',
    guardianemail: '',
    admissiondate: '',
    status: 'Active',
    medicaidnumber: '',
    emergencycontact: '',
    allergies: '',
    notes: ''
  });

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', badge: null },
    { id: 'individual', icon: Users, label: 'Individuals', badge: null },
    { id: 'medicine', icon: Pill, label: 'Medications', badge: null },
    { id: 'incident', icon: AlertTriangle, label: 'Incidents', badge: '3' },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics', badge: null },
    { id: 'settings', icon: Settings, label: 'Settings', badge: null },
  ];

  // Fetch individuals from Supabase with role-based filtering
  useEffect(() => {
    if (isLoaded && user && !profileLoading && userProfile) {
      if (canViewIndividuals) {
        fetchIndividuals();
      } else {
        setLoading(false);
      }
    }
  }, [isLoaded, user, profileLoading, userProfile]);

  const fetchIndividuals = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('individuals')
        .select('*')
        .order('created_at', { ascending: false });

      // Role-based filtering
      if (userProfile.role_id === 'HouseManager_DD') {
        // House managers only see individuals in their facility
        query = query.eq('homeassignment', userProfile.facility);
      } else if (userProfile.role_id === 'DSP_DD') {
        // DSPs only see individuals in their assigned home
        query = query.eq('homeassignment', userProfile.facility);
      } else if (userProfile.division === 'MI' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        // MI staff see only their division's individuals
        query = query.eq('division', 'MI');
      } else if (userProfile.division === 'SUD' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        // SUD staff see only their division's individuals
        query = query.eq('division', 'SUD');
      }

      const { data, error } = await query;

      if (error) throw error;
      setIndividuals(data || []);
    } catch (error) {
      console.error('Error fetching individuals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddIndividual = async (e) => {
    e.preventDefault();
    
    if (!canAddIndividuals) {
      alert('You do not have permission to add individuals.');
      return;
    }

    try {
      const individualData = {
        ...formData,
        userid: user.id,
        division: userProfile.division,
        created_by: userProfile.fullname,
        created_by_role: userProfile.role_name,
        created_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        compliance_score: 100
      };

      const { data, error } = await supabase
        .from('individuals')
        .insert([individualData])
        .select();

      if (error) throw error;

      setIndividuals(prev => [data[0], ...prev]);
      setShowAddModal(false);
      resetForm();
      alert('Individual added successfully!');
    } catch (error) {
      console.error('Error adding individual:', error);
      alert('Error adding individual. Please try again.');
    }
  };

  const handleImportCSV = async (e) => {
    if (!canImportIndividuals) {
      alert('You do not have permission to import individuals.');
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = text.split('\n').map(row => row.split(','));
      const headers = rows[0].map(h => h.trim().toLowerCase());
      
      const importedData = rows.slice(1).filter(row => row.length > 1).map(row => {
        const individual = {
          userid: user.id,
          division: userProfile.division,
          created_by: userProfile.fullname,
          created_by_role: userProfile.role_name,
          created_at: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          compliance_score: 95,
          status: 'Active'
        };

        headers.forEach((header, index) => {
          const value = row[index]?.trim();
          if (value) {
            const fieldMap = {
              'first name': 'firstname',
              'firstname': 'firstname',
              'last name': 'lastname',
              'lastname': 'lastname',
              'id': 'individualid',
              'individual id': 'individualid',
              'dob': 'dateofbirth',
              'date of birth': 'dateofbirth',
              'location': 'location',
              'home': 'homeassignment',
              'home assignment': 'homeassignment',
              'phone': 'phone',
              'email': 'email',
              'diagnosis': 'primarydiagnosis',
              'guardian': 'guardianname',
              'guardian name': 'guardianname',
              'status': 'status'
            };

            const fieldName = fieldMap[header] || header.replace(/\s+/g, '');
            individual[fieldName] = value;
          }
        });

        return individual;
      });

      const { data, error } = await supabase
        .from('individuals')
        .insert(importedData)
        .select();

      if (error) throw error;

      setIndividuals(prev => [...data, ...prev]);
      setShowImportModal(false);
      alert(`Successfully imported ${data.length} individuals`);
    } catch (error) {
      console.error('Error importing CSV:', error);
      alert('Error importing CSV. Please check the file format.');
    }
  };

  const handleDeleteIndividual = async (id) => {
    if (!canDeleteIndividuals) {
      alert('You do not have permission to delete individuals.');
      return;
    }

    if (!confirm('Are you sure you want to delete this individual? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('individuals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setIndividuals(prev => prev.filter(ind => ind.id !== id));
      alert('Individual deleted successfully.');
    } catch (error) {
      console.error('Error deleting individual:', error);
      alert('Error deleting individual.');
    }
  };

  const handleExport = () => {
    if (!canExportIndividuals) {
      alert('You do not have permission to export data.');
      return;
    }

    // Create CSV content
    const headers = ['First Name', 'Last Name', 'Individual ID', 'DOB', 'Home Assignment', 'Status', 'Location'];
    const csvContent = [
      headers.join(','),
      ...filteredIndividuals.map(ind => [
        ind.firstname,
        ind.lastname,
        ind.individualid,
        ind.dateofbirth,
        ind.homeassignment,
        ind.status,
        ind.location
      ].join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `individuals_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFormData({
      firstname: '',
      lastname: '',
      individualid: '',
      dateofbirth: '',
      gender: '',
      phone: '',
      email: '',
      location: '',
      homeassignment: '',
      primarydiagnosis: '',
      guardianname: '',
      guardianphone: '',
      guardianemail: '',
      admissiondate: '',
      status: 'Active',
      medicaidnumber: '',
      emergencycontact: '',
      allergies: '',
      notes: ''
    });
  };

  const filteredIndividuals = individuals.filter(ind => {
    const matchesSearch = 
      ind.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.individualid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.homeassignment?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || ind.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getInitials = (firstname, lastname) => {
    return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
  };

  const getColorClass = (index) => {
    const colors = [
      'from-emerald-600 to-teal-500',
      'from-green-400 to-emerald-500',
      'from-lime-500 to-green-600',
      'from-teal-500 to-emerald-600',
      'from-cyan-500 to-teal-600'
    ];
    return colors[index % colors.length];
  };

  // Handle stats card click
  const handleStatsCardClick = (status) => {
    setFilterStatus(status);
  };

  // Calculate stats
  const totalIndividuals = individuals.length;
  const activeIndividuals = individuals.filter(ind => ind.status === 'Active').length;
  const reviewIndividuals = individuals.filter(ind => ind.status === 'Review').length;
  const inactiveIndividuals = individuals.filter(ind => ind.status === 'Inactive').length;

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

  // Permission Check - No Access Screen
  if (!profileLoading && !canViewIndividuals) {
    return (
      <div className="h-screen flex flex-col bg-slate-950 text-white">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
            <p className="text-slate-400 mb-6">
              You do not have permission to view individuals. Please contact your administrator if you believe this is an error.
            </p>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <p className="text-sm text-slate-400">Your Current Role:</p>
              <p className="text-lg font-bold text-emerald-400 mt-1">{userProfile?.role_name}</p>
              <p className="text-sm text-slate-500 mt-2">Division: {userProfile?.division}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded || loading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Loading individuals...</p>
        </div>
      </div>
    );
  }

  /* Table Row Component with Action Buttons */
  const TableRow = ({ individual, idx }) => (
    <tr className="border-b border-slate-700/30 hover:bg-slate-900/50 transition-all duration-300 group">
      <td className="py-5 px-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${getColorClass(idx)} rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-all duration-300`}>
            {getInitials(individual.firstname, individual.lastname)}
          </div>
          <div>
            <p className="text-white font-semibold group-hover:text-emerald-400 transition-colors">
              {individual.firstname} {individual.lastname}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-full bg-slate-700 rounded-full h-1.5 w-20">
                <div className={`h-full rounded-full ${individual.compliance_score >= 95 ? 'bg-lime-500' : individual.compliance_score >= 85 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${individual.compliance_score}%`}} />
              </div>
              <span className="text-xs text-slate-500 font-medium">{individual.compliance_score}%</span>
            </div>
          </div>
        </div>
      </td>
      <td className="py-5 px-4"><span className="text-slate-300 font-mono text-sm">{individual.individualid}</span></td>
      <td className="py-5 px-4">
        <div className="flex items-center gap-2"><MapPin size={14} className="text-emerald-400" /><span className="text-slate-300 text-sm">{individual.homeassignment || individual.location}</span></div>
      </td>
      <td className="py-5 px-4">
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${individual.status === 'Active' ? 'bg-green-900/30 text-green-400 border-green-500/50' : individual.status === 'Review' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50' : 'bg-red-900/30 text-red-400 border-red-500/50'}`}>{individual.status}</span>
      </td>
      <td className="py-5 px-4">
        <div className="flex items-center gap-2"><Clock size={14} className="text-slate-500" /><span className="text-slate-400 text-sm">{new Date(individual.last_activity).toLocaleDateString()}</span></div>
      </td>
      <td className="py-5 px-4">
        <div className="flex items-center gap-2">
          {/* Goals */}
          <button onClick={() => router.push(`/individual/${individual.id}`)} className="p-2 hover:bg-emerald-500/20 rounded-lg transition-all group/btn" title="Goals">
            <Target size={16} className="text-emerald-400 group-hover/btn:scale-110 transition-all" />
          </button>
          {/* Daily Notes */}
          <button onClick={() => router.push(`/daily/${individual.id}`)} className="p-2 hover:bg-blue-500/20 rounded-lg transition-all group/btn" title="Daily Notes">
            <StickyNote size={16} className="text-blue-400 group-hover/btn:scale-110 transition-all" />
          </button>
          {/* Edit */}
          {canEditIndividuals && (
            <button onClick={() => router.push(`/individual/${individual.id}?edit=true`)} className="p-2 hover:bg-blue-500/20 rounded-lg transition-all group/btn" title="Edit">
              <Edit2 size={16} className="text-blue-400 group-hover/btn:scale-110 transition-all" />
            </button>
          )}
          {/* Delete */}
          {canDeleteIndividuals && (
            <button onClick={() => handleDeleteIndividual(individual.id)} className="p-2 hover:bg-red-500/20 rounded-lg transition-all group/btn" title="Delete">
              <Trash2 size={16} className="text-red-400 group-hover/btn:scale-110 transition-all" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
      <NavBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <main className="p-6 lg:p-8">
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500">
                        Individuals
                      </h2>
                      <div className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full">
                        <span className="text-green-400 text-xs font-bold flex items-center gap-1">
                          <Zap size={12} /> LIVE
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-lg">
                      Manage {individuals.length} client profiles and care plans
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {canImportIndividuals && (
                      <button 
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-slate-700"
                      >
                        <Upload size={18} />
                        Import CSV
                      </button>
                    )}
                    {canAddIndividuals && (
                      <button 
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105"
                      >
                        <Plus size={18} />
                        Add Individual
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Individuals Card */}
                  <button 
                    onClick={() => handleStatsCardClick('all')}
                    className={`group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 overflow-hidden cursor-pointer ${
                      filterStatus === 'all' 
                        ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/30' 
                        : 'border-slate-700/50 hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-600 to-teal-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 ${
                          filterStatus === 'all' 
                            ? 'bg-gradient-to-br from-emerald-600 to-teal-500 animate-pulse' 
                            : 'bg-gradient-to-br from-slate-700 to-slate-800'
                        }`}>
                          <Users className={filterStatus === 'all' ? 'text-white' : 'text-slate-400'} size={26} />
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="text-green-400" size={18} />
                          <span className="text-sm font-bold text-green-400">
                            +12%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Total Individuals</p>
                        <div className="flex items-end gap-2">
                          <p className="text-4xl font-black text-white">{totalIndividuals}</p>
                          {filterStatus === 'all' && <Sparkles className="text-lime-400 mb-2 animate-pulse" size={20} />}
                        </div>
                        <p className={`text-xs font-medium mt-2 ${
                          filterStatus === 'all' ? 'text-emerald-400' : 'text-slate-500'
                        }`}>
                          {filterStatus === 'all' ? '✓ Currently viewing all individuals' : 'Click to view all'}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Active Individuals Card */}
                  <button 
                    onClick={() => handleStatsCardClick('Active')}
                    className={`group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 overflow-hidden cursor-pointer ${
                      filterStatus === 'Active' 
                        ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/30' 
                        : 'border-slate-700/50 hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 ${
                          filterStatus === 'Active' 
                            ? 'bg-gradient-to-br from-green-400 to-emerald-500 animate-pulse' 
                            : 'bg-gradient-to-br from-slate-700 to-slate-800'
                        }`}>
                          <CheckCircle className={filterStatus === 'Active' ? 'text-white' : 'text-slate-400'} size={26} />
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="text-green-400" size={18} />
                          <span className="text-sm font-bold text-green-400">
                            +5%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Active Individuals</p>
                        <div className="flex items-end gap-2">
                          <p className="text-4xl font-black text-white">
                            {activeIndividuals}
                          </p>
                          {filterStatus === 'Active' && <CheckCircle className="text-green-400 mb-2 animate-pulse" size={20} />}
                        </div>
                        <p className={`text-xs font-medium mt-2 ${
                          filterStatus === 'Active' ? 'text-emerald-400' : 'text-slate-500'
                        }`}>
                          {filterStatus === 'Active' ? '✓ Currently viewing active individuals' : 'Click to view active only'}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Average Compliance Card */}
                  <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-lime-500 to-green-600 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                          <Brain className="text-slate-400" size={26} />
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="text-green-400" size={18} />
                          <span className="text-sm font-bold text-green-400">
                            +8%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Avg Compliance</p>
                        <div className="flex items-end gap-2">
                          <p className="text-4xl font-black text-white">
                            {individuals.length > 0 
                              ? Math.round(individuals.reduce((acc, ind) => acc + (ind.compliance_score || 0), 0) / individuals.length)
                              : 0}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pending Reviews Card */}
                  <button 
                    onClick={() => handleStatsCardClick('Review')}
                    className={`group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 overflow-hidden cursor-pointer ${
                      filterStatus === 'Review' 
                        ? 'border-amber-500/50 shadow-lg shadow-amber-500/30' 
                        : 'border-slate-700/50 hover:border-amber-500/50'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500 to-yellow-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 ${
                          filterStatus === 'Review' 
                            ? 'bg-gradient-to-br from-amber-500 to-yellow-500 animate-pulse' 
                            : 'bg-gradient-to-br from-slate-700 to-slate-800'
                        }`}>
                          <AlertCircle className={filterStatus === 'Review' ? 'text-white' : 'text-slate-400'} size={26} />
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingDown className="text-red-400" size={18} />
                          <span className="text-sm font-bold text-red-400">
                            -3%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Pending Reviews</p>
                        <div className="flex items-end gap-2">
                          <p className="text-4xl font-black text-white">
                            {reviewIndividuals}
                          </p>
                          {filterStatus === 'Review' && <AlertCircle className="text-amber-400 mb-2 animate-pulse" size={20} />}
                        </div>
                        <p className={`text-xs font-medium mt-2 ${
                          filterStatus === 'Review' ? 'text-amber-400' : 'text-slate-500'
                        }`}>
                          {filterStatus === 'Review' ? '✓ Currently viewing pending reviews' : 'Click to view pending reviews'}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Main Content */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300">
                  {/* Search and Filter */}
                  <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    <div className="flex-1 flex items-center gap-3 bg-slate-900/50 rounded-xl px-5 py-3 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 group">
                      <Search size={20} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                      <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, ID, or home..." 
                        className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-500"
                      />
                    </div>
                    <div className="relative">
                      <button 
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-800 text-white rounded-xl px-5 py-3 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 font-semibold"
                      >
                        <Filter size={18} />
                        Filters
                        <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                          filterStatus === 'all' ? 'bg-emerald-500/20 text-emerald-400' :
                          filterStatus === 'Active' ? 'bg-green-500/20 text-green-400' :
                          filterStatus === 'Review' ? 'bg-amber-500/20 text-amber-400' :
                          filterStatus === 'Inactive' ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-700 text-slate-400'
                        }`}>
                          {filterStatus === 'all' ? 'All' : filterStatus}
                        </span>
                      </button>
                      
                      {showFilterMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl p-2 z-20 shadow-2xl">
                          {['all', 'Active', 'Review', 'Inactive'].map(status => (
                            <button
                              key={status}
                              onClick={() => {
                                setFilterStatus(status);
                                setShowFilterMenu(false);
                              }}
                              className={`w-full text-left px-4 py-2 rounded-lg transition-all flex items-center justify-between ${
                                filterStatus === status
                                  ? 'bg-emerald-600 text-white'
                                  : 'text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <span>{status === 'all' ? 'All Status' : status}</span>
                              {filterStatus === status && <CheckCircle size={16} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {canExportIndividuals && (
                      <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-800 text-white rounded-xl px-5 py-3 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 font-semibold"
                      >
                        <Download size={18} />
                        Export
                      </button>
                    )}
                  </div>

                  {/* Current Filter Status Indicator */}
                  {filterStatus !== 'all' && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {filterStatus === 'Active' && <CheckCircle className="text-green-400" size={18} />}
                          {filterStatus === 'Review' && <AlertCircle className="text-amber-400" size={18} />}
                          {filterStatus === 'Inactive' && <AlertCircle className="text-red-400" size={18} />}
                          <span className="text-white font-semibold">
                            Showing {filterStatus === 'Active' ? 'Active' : filterStatus === 'Review' ? 'Pending Review' : 'Inactive'} Individuals
                          </span>
                          <span className="text-slate-400 text-sm">
                            ({filteredIndividuals.length} of {individuals.length})
                          </span>
                        </div>
                        <button 
                          onClick={() => setFilterStatus('all')}
                          className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                        >
                          <X size={14} />
                          Clear Filter
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Table */}
                  {filteredIndividuals.length === 0 ? (
                    <div className="text-center py-16">
                      <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-slate-400 mb-2">No individuals found</h3>
                      <p className="text-slate-500">
                        {filterStatus !== 'all' 
                          ? `No individuals found with status: ${filterStatus}` 
                          : individuals.length === 0 
                            ? 'Add your first individual to get started' 
                            : 'Try adjusting your search or filters'}
                      </p>
                      {filterStatus !== 'all' && (
                        <button 
                          onClick={() => setFilterStatus('all')}
                          className="mt-4 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                        >
                          Show All Individuals
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <ScrollArea className="h-[500px] rounded-xl">
                        <div className="pr-4">
                          <table className="w-full">
                            <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
                              <tr className="border-b border-slate-700/50">
                                <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Individual</th>
                                <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">ID</th>
                                <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Location</th>
                                <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Status</th>
                                <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Last Activity</th>
                                <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredIndividuals.map((individual, idx) => (
                                <TableRow key={individual.id} individual={individual} idx={idx} />
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </ScrollArea>
                      
                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700/50">
                        <p className="text-slate-400 text-sm">
                          Showing <span className="text-white font-semibold">{filteredIndividuals.length}</span> of <span className="text-white font-semibold">{individuals.length}</span> individuals
                          {filterStatus !== 'all' && (
                            <span className="ml-2 px-2 py-1 bg-slate-800 rounded-lg">
                              <span className="text-slate-300">Filter: </span>
                              <span className="font-semibold text-emerald-400">{filterStatus}</span>
                            </span>
                          )}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </main>
          </ScrollArea>
        </div>
      </div>

      {/* Add Individual Modal - Only shown if user has permission */}
      {showAddModal && canAddIndividuals && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center">
                  <Plus className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Add New Individual</h3>
                  <p className="text-slate-400 text-sm">Enter individual information</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="text-slate-400" size={24} />
              </button>
            </div>

            <ScrollArea className="h-[calc(90vh-180px)]">
              <form onSubmit={handleAddIndividual} className="p-6 space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <User size={20} />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">First Name *</label>
                      <input
                        type="text"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Last Name *</label>
                      <input
                        type="text"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Individual ID *</label>
                      <input
                        type="text"
                        name="individualid"
                        value={formData.individualid}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Date of Birth *</label>
                      <input
                        type="date"
                        name="dateofbirth"
                        value={formData.dateofbirth}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <HomeIcon size={20} />
                    Location & Assignment
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Home Assignment *</label>
                      <input
                        type="text"
                        name="homeassignment"
                        value={formData.homeassignment}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Oak Ridge Home"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="City, State"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Admission Date *</label>
                      <input
                        type="date"
                        name="admissiondate"
                        value={formData.admissiondate}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      >
                        <option value="Active">Active</option>
                        <option value="Review">Review</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <Heart size={20} />
                    Medical Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Primary Diagnosis</label>
                      <input
                        type="text"
                        name="primarydiagnosis"
                        value={formData.primarydiagnosis}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Medicaid Number</label>
                      <input
                        type="text"
                        name="medicaidnumber"
                        value={formData.medicaidnumber}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">Allergies</label>
                      <input
                        type="text"
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleInputChange}
                        placeholder="List any known allergies"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Guardian Information */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <Shield size={20} />
                    Guardian & Emergency Contact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Guardian Name</label>
                      <input
                        type="text"
                        name="guardianname"
                        value={formData.guardianname}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Guardian Phone</label>
                      <input
                        type="tel"
                        name="guardianphone"
                        value={formData.guardianphone}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Guardian Email</label>
                      <input
                        type="email"
                        name="guardianemail"
                        value={formData.guardianemail}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Emergency Contact</label>
                      <input
                        type="text"
                        name="emergencycontact"
                        value={formData.emergencycontact}
                        onChange={handleInputChange}
                        placeholder="Name and phone"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <FileText size={20} />
                    Additional Notes
                  </h4>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Any additional information..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all resize-none"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300"
                  >
                    <Save size={18} />
                    Save Individual
                  </button>
                </div>
              </form>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && canImportIndividuals && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center">
                  <Upload className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Import Individuals</h3>
                  <p className="text-slate-400 text-sm">Upload a CSV file with individual data</p>
                </div>
              </div>
              <button 
                onClick={() => setShowImportModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="text-slate-400" size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h4 className="text-white font-bold mb-3">CSV Format Requirements</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>First row should contain column headers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Required fields: First Name, Last Name, Individual ID, Home Assignment, Admission Date</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Date format: YYYY-MM-DD</span>
                  </li>
                </ul>
              </div>

              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-8 text-center transition-all duration-300 cursor-pointer">
                <Upload className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-white font-semibold mb-2">Choose CSV file or drag and drop</p>
                <p className="text-slate-400 text-sm mb-4">Maximum file size: 5MB</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 cursor-pointer"
                >
                  <Upload size={18} />
                  Select File
                </label>
              </div>

              <button
                onClick={() => setShowImportModal(false)}
                className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndividualsPage;