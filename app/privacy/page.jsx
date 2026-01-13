'use client';
import React, { useState, useEffect } from 'react';
import { 
  Shield, Search, Eye, Save, X, CheckCircle, AlertTriangle, 
  Clock, User, Activity, ChevronRight, Loader2, Menu, Bell, 
  ChevronDown, Users, Pill, CreditCard, TrendingUp, Heart,
  Brain, Smile, Frown, Meh, Battery, BatteryLow, BatteryFull,
  Moon, Sun, Utensils, CalendarCheck, Target, MessageSquare,
  Lock, FileText, Edit2, AlertCircle, Info, Zap, Home
} from 'lucide-react';
import { ScrollArea } from "../../components/ui/scroll-area";
import { useUser, UserButton } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '../../contexts/userProfileContext';
import { PERMISSIONS } from '../../utils/permissions';

const supabase = createClient(
  'https://bbikcxalypttfgrlxstf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWtjeGFseXB0dGZncmx4c3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODcwOCwiZXhwIjoyMDY5Mjk0NzA4fQ.4BLQyvPA0eB745Sfdn2Tl4oCDRTzNhLXrJ8Os8wOXfs'
);

const DataPrivacyPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { userProfile, loading: profileLoading, hasPermission, hasAnyPermission } = useUserProfile();
  
  const [individuals, setIndividuals] = useState([]);
  const [selectedIndividual, setSelectedIndividual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('privacy');
  const [activeTab, setActiveTab] = useState('wellness');

  // Permission checks
  const canViewPrivacy = hasAnyPermission([
    PERMISSIONS.DAILY_NOTES_VIEW,
    PERMISSIONS.DAILY_NOTES_CREATE,
    PERMISSIONS.PLANS_VIEW,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canEditPrivacy = hasAnyPermission([
    PERMISSIONS.DAILY_NOTES_CREATE,
    PERMISSIONS.PLANS_EDIT,
    PERMISSIONS.FULL_ACCESS
  ]);

  // Privacy data state (stored in individuals table)
  const [privacyData, setPrivacyData] = useState({
    // User Profile (Non-identifiable)
    nickname: '',
    ageRange: '',
    cityState: '',
    avatar: '',
    
    // Wellness & Engagement Data
    moodCheckins: [],
    energyLevel: '',
    activityParticipation: [],
    sleepNotes: '',
    appetiteNotes: '',
    observations: '',
    
    // Operational Data
    appointments: [],
    goalsPracticed: [],
    staffDocumentation: '',
    
    // Data Governance Settings
    dataRetentionMonths: 24,
    consentGiven: false,
    consentDate: '',
    lastReviewed: '',
    reviewedBy: ''
  });

  const menuItems = [
    { id: 'individual', icon: Users, label: 'Individuals', badge: null },
    { id: 'medicine', icon: Pill, label: 'Medications', badge: null },
    { id: 'incident', icon: AlertTriangle, label: 'Incidents', badge: '3' },
    { id: 'privacy', icon: Shield, label: 'Data Privacy', badge: 'NEW' },
     { id: 'hcbs', icon: Shield, label: 'HCBS Compliance', badge: 'NEW' },
    { id: 'billing', icon: CreditCard, label: 'Billing', badge: null },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics', badge: null }
  ];

  const moodOptions = [
    { value: 'calm', label: 'Calm', icon: Smile, color: 'text-green-400' },
    { value: 'happy', label: 'Happy', icon: Smile, color: 'text-blue-400' },
    { value: 'tired', label: 'Tired', icon: Moon, color: 'text-purple-400' },
    { value: 'anxious', label: 'Anxious', icon: Frown, color: 'text-orange-400' },
    { value: 'neutral', label: 'Neutral', icon: Meh, color: 'text-slate-400' }
  ];

  const energyLevels = [
    { value: 'low', label: 'Low', icon: BatteryLow, color: 'text-red-400' },
    { value: 'normal', label: 'Normal', icon: Battery, color: 'text-yellow-400' },
    { value: 'high', label: 'High', icon: BatteryFull, color: 'text-green-400' }
  ];

  const ageRanges = [
    '18-25', '26-35', '36-45', '46-55', '56-65', '65+'
  ];

  useEffect(() => {
    if (isLoaded && user && !profileLoading && userProfile) {
      if (canViewPrivacy) {
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
        query = query.eq('homeassignment', userProfile.facility);
      } else if (userProfile.role_id === 'DSP_DD') {
        query = query.eq('homeassignment', userProfile.facility);
      } else if (userProfile.division === 'MI' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        query = query.eq('division', 'MI');
      } else if (userProfile.division === 'SUD' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
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

  const handleSelectIndividual = (individual) => {
    setSelectedIndividual(individual);
    
    // Load privacy data from individual record
    if (individual.privacy_data) {
      setPrivacyData(individual.privacy_data);
    } else {
      // Initialize with default values
      setPrivacyData({
        nickname: individual.firstname?.substring(0, 2).toUpperCase() || '',
        ageRange: calculateAgeRange(individual.dateofbirth),
        cityState: individual.location || '',
        avatar: '',
        moodCheckins: [],
        energyLevel: 'normal',
        activityParticipation: [],
        sleepNotes: '',
        appetiteNotes: '',
        observations: '',
        appointments: [],
        goalsPracticed: [],
        staffDocumentation: '',
        dataRetentionMonths: 24,
        consentGiven: false,
        consentDate: '',
        lastReviewed: new Date().toISOString().split('T')[0],
        reviewedBy: userProfile.fullname
      });
    }
  };

  const calculateAgeRange = (dob) => {
    if (!dob) return '';
    const age = Math.floor((new Date() - new Date(dob)) / 31557600000);
    if (age < 26) return '18-25';
    if (age < 36) return '26-35';
    if (age < 46) return '36-45';
    if (age < 56) return '46-55';
    if (age < 66) return '56-65';
    return '65+';
  };

  const handleSavePrivacyData = async () => {
    if (!canEditPrivacy) {
      alert('You do not have permission to edit privacy data.');
      return;
    }

    if (!selectedIndividual) {
      alert('Please select an individual first.');
      return;
    }

    try {
      setSaving(true);

      const updatedPrivacyData = {
        ...privacyData,
        lastReviewed: new Date().toISOString().split('T')[0],
        reviewedBy: userProfile.fullname
      };

      const { error } = await supabase
        .from('individuals')
        .update({ 
          privacy_data: updatedPrivacyData,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedIndividual.id);

      if (error) throw error;

      setPrivacyData(updatedPrivacyData);
      alert('Privacy data saved successfully!');
    } catch (error) {
      console.error('Error saving privacy data:', error);
      alert('Error saving privacy data. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addMoodCheckin = (mood) => {
    const newCheckin = {
      mood,
      timestamp: new Date().toISOString(),
      recordedBy: userProfile.fullname
    };
    setPrivacyData({
      ...privacyData,
      moodCheckins: [newCheckin, ...privacyData.moodCheckins].slice(0, 10)
    });
  };

  const addActivity = (activity) => {
    if (!activity.trim()) return;
    const newActivity = {
      activity: activity.trim(),
      timestamp: new Date().toISOString(),
      recordedBy: userProfile.fullname
    };
    setPrivacyData({
      ...privacyData,
      activityParticipation: [newActivity, ...privacyData.activityParticipation]
    });
  };

  const addAppointment = (date, time, type) => {
    const newAppointment = {
      date,
      time,
      type,
      status: 'scheduled',
      recordedBy: userProfile.fullname
    };
    setPrivacyData({
      ...privacyData,
      appointments: [...privacyData.appointments, newAppointment]
    });
  };

  const addGoal = (goal) => {
    if (!goal.trim()) return;
    const newGoal = {
      goal: goal.trim(),
      timestamp: new Date().toISOString(),
      recordedBy: userProfile.fullname
    };
    setPrivacyData({
      ...privacyData,
      goalsPracticed: [newGoal, ...privacyData.goalsPracticed]
    });
  };

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

  const filteredIndividuals = individuals.filter(ind => 
    ind.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ind.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ind.individualid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            placeholder="Search individuals..." 
            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button className="relative p-2.5 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105 group">
          <Bell className="text-slate-300 group-hover:text-emerald-400 transition-colors" size={20} />
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
        
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Privacy Compliance</span>
            <span className="text-xs text-blue-400 font-bold">100%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-1000" style={{width: '100%'}}></div>
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
                if (item.id !== 'privacy') {
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
        <div className="bg-gradient-to-br from-blue-900/30 via-cyan-900/30 to-teal-900/30 rounded-xl p-4 border border-blue-500/30 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="text-blue-400" size={18} />
              <p className="text-sm font-bold text-white">HIPAA Compliant</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">No PHI Collected</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Permission Check
  if (!profileLoading && !canViewPrivacy) {
    return (
      <div className="h-screen flex flex-col bg-slate-950 text-white">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
            <p className="text-slate-400 mb-6">
              You do not have permission to view privacy data. Please contact your administrator.
            </p>
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
          <p className="text-slate-400 text-lg">Loading privacy data...</p>
        </div>
      </div>
    );
  }

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
                      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500">
                        Data Privacy & Governance
                      </h2>
                      <div className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full">
                        <span className="text-blue-400 text-xs font-bold flex items-center gap-1">
                          <Lock size={12} /> HIPAA Compliant
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-lg">
                      Non-PHI wellness tracking • Privacy by design
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => router.push('/dashboard')}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-slate-700"
                    >
                      <Home size={18} />
                      Dashboard
                    </button>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-600/50 rounded-xl flex items-center justify-center">
                        <Lock className="text-blue-300" size={24} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">No PHI Collected</h3>
                        <p className="text-blue-300 text-sm">HIPAA Avoidance</p>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm">
                      We intentionally avoid collecting Protected Health Information
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-600/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-green-600/50 rounded-xl flex items-center justify-center">
                        <Shield className="text-green-300" size={24} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">Privacy by Design</h3>
                        <p className="text-green-300 text-sm">Data Protection</p>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm">
                      Every feature evaluated for privacy compliance
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-600/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-purple-600/50 rounded-xl flex items-center justify-center">
                        <Eye className="text-purple-300" size={24} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">Transparency</h3>
                        <p className="text-purple-300 text-sm">User Rights</p>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm">
                      Clear documentation of data collection and usage
                    </p>
                  </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Individual Selection */}
                  <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Users size={20} className="text-emerald-400" />
                        Select Individual
                      </h3>
                      
                      <ScrollArea className="h-[600px]">
                        <div className="space-y-3">
                          {filteredIndividuals.map((individual, idx) => (
                            <button
                              key={individual.id}
                              onClick={() => handleSelectIndividual(individual)}
                              className={`w-full bg-slate-800/50 border rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
                                selectedIndividual?.id === individual.id
                                  ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                                  : 'border-slate-700 hover:border-emerald-500/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 bg-gradient-to-br ${getColorClass(idx)} rounded-xl flex items-center justify-center text-white font-bold`}>
                                  {getInitials(individual.firstname, individual.lastname)}
                                </div>
                                <div className="text-left">
                                  <h4 className="text-white font-semibold">
                                    {individual.firstname} {individual.lastname}
                                  </h4>
                                  <p className="text-slate-400 text-sm">ID: {individual.individualid}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>

                  {/* Privacy Data Entry */}
                  <div className="lg:col-span-2">
                    {!selectedIndividual ? (
                      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-12 text-center">
                        <Shield className="w-20 h-20 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-slate-400 mb-2">No Individual Selected</h3>
<p className="text-slate-500">
Please select an individual from the list to manage their privacy data
</p>
</div>
) : (
<div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-6">
{/* Selected Individual Header */}
<div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-700">
<div className="flex items-center gap-4">
<div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
{getInitials(selectedIndividual.firstname, selectedIndividual.lastname)}
</div>
<div>
<h3 className="text-2xl font-bold text-white">
{selectedIndividual.firstname} {selectedIndividual.lastname}
</h3>
<p className="text-slate-400">Privacy & Wellness Data</p>
</div>
</div>
<button
onClick={handleSavePrivacyData}
disabled={!canEditPrivacy || saving}
className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
>
{saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
{saving ? 'Saving...' : 'Save Changes'}
</button>
</div>
{/* Tabs */}
                    <div className="flex gap-2 mb-6">
                      {[
                        { id: 'wellness', label: 'Wellness Data', icon: Heart },
                        { id: 'operational', label: 'Operational', icon: CalendarCheck },
                        { id: 'profile', label: 'Profile', icon: User },
                        { id: 'governance', label: 'Governance', icon: Shield }
                      ].map(tab => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                              activeTab === tab.id
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <Icon size={16} />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    <ScrollArea className="h-[600px]">
                      {/* Profile Tab */}
                      {activeTab === 'profile' && (
                        <div className="space-y-6">
                          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                              <Info className="text-blue-400 flex-shrink-0 mt-1" size={20} />
                              <div>
                                <h4 className="text-blue-300 font-semibold mb-1">Non-Identifiable Profile</h4>
                                <p className="text-slate-300 text-sm">
                                  Only collect non-identifying information. No full names, exact ages, or addresses.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Nickname / Initials
                              </label>
                              <input
                                type="text"
                                value={privacyData.nickname}
                                onChange={(e) => setPrivacyData({...privacyData, nickname: e.target.value})}
                                disabled={!canEditPrivacy}
                                maxLength={10}
                                placeholder="e.g., JD or Jay"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Age Range
                              </label>
                              <select
                                value={privacyData.ageRange}
                                onChange={(e) => setPrivacyData({...privacyData, ageRange: e.target.value})}
                                disabled={!canEditPrivacy}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                              >
                                <option value="">Select Age Range</option>
                                {ageRanges.map(range => (
                                  <option key={range} value={range}>{range}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                City or State Only
                              </label>
                              <input
                                type="text"
                                value={privacyData.cityState}
                                onChange={(e) => setPrivacyData({...privacyData, cityState: e.target.value})}
                                disabled={!canEditPrivacy}
                                placeholder="e.g., Birmingham, AL"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Wellness Tab */}
                      {activeTab === 'wellness' && (
                        <div className="space-y-6">
                          {/* Mood Check-ins */}
                          <div>
                            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                              <Smile className="text-emerald-400" size={20} />
                              Mood Check-ins
                            </h4>
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-4">
                              <p className="text-slate-300 text-sm mb-3">Record current mood:</p>
                              <div className="flex flex-wrap gap-2">
                                {moodOptions.map(mood => {
                                  const Icon = mood.icon;
                                  return (
                                    <button
                                      key={mood.value}
                                      onClick={() => canEditPrivacy && addMoodCheckin(mood.value)}
                                      disabled={!canEditPrivacy}
                                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${mood.color} bg-slate-800 border-slate-600 hover:border-emerald-500 transition-all disabled:opacity-50`}
                                    >
                                      <Icon size={16} />
                                      {mood.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {privacyData.moodCheckins.length > 0 && (
                              <div className="space-y-2">
                                <h5 className="text-sm font-semibold text-slate-400">Recent Check-ins:</h5>
                                {privacyData.moodCheckins.slice(0, 5).map((checkin, idx) => (
                                  <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="text-white font-semibold capitalize">{checkin.mood}</span>
                                        <span className="text-slate-500 text-xs">
                                          {new Date(checkin.timestamp).toLocaleString()}
                                        </span>
                                      </div>
                                      <span className="text-slate-400 text-xs">{checkin.recordedBy}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Energy Level */}
                          <div>
                            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                              <Zap className="text-yellow-400" size={20} />
                              Energy Level
                            </h4>
                            <div className="flex gap-3">
                              {energyLevels.map(energy => {
                                const Icon = energy.icon;
                                return (
                                  <button
                                    key={energy.value}
                                    onClick={() => canEditPrivacy && setPrivacyData({...privacyData, energyLevel: energy.value})}
                                    disabled={!canEditPrivacy}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                                      privacyData.energyLevel === energy.value
                                        ? `${energy.color} bg-slate-700 border-emerald-500`
                                        : 'text-slate-400 bg-slate-800 border-slate-600 hover:border-emerald-500'
                                    } disabled:opacity-50`}
                                  >
                                    <Icon size={20} />
                                    <span className="font-semibold">{energy.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Activity Participation */}
                          <div>
                            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                              <Target className="text-purple-400" size={20} />
                              Activity Participation
                            </h4>
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-4">
                              <input
                                type="text"
                                placeholder="e.g., Completed cooking class, Went on walk"
                                disabled={!canEditPrivacy}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && canEditPrivacy) {
                                    addActivity(e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                              />
                              <p className="text-slate-500 text-xs mt-2">Press Enter to add activity</p>
                            </div>

                            {privacyData.activityParticipation.length > 0 && (
                              <div className="space-y-2">
                                {privacyData.activityParticipation.slice(0, 10).map((activity, idx) => (
                                  <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <p className="text-white">{activity.activity}</p>
                                        <p className="text-slate-500 text-xs mt-1">
                                          {new Date(activity.timestamp).toLocaleString()} • {activity.recordedBy}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Sleep Notes */}
                          <div>
                            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                              <Moon className="text-indigo-400" size={20} />
                              General Sleep Notes
                            </h4>
                            <textarea
                              value={privacyData.sleepNotes}
                              onChange={(e) => setPrivacyData({...privacyData, sleepNotes: e.target.value})}
                              disabled={!canEditPrivacy}
                              rows="3"
                              placeholder="e.g., Slept well, Interrupted sleep (non-medical)"
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none disabled:opacity-50"
                            />
                          </div>

                          {/* Appetite Notes */}
                          <div>
                            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                              <Utensils className="text-orange-400" size={20} />
                              General Appetite Notes
                            </h4>
                            <textarea
                              value={privacyData.appetiteNotes}
                              onChange={(e) => setPrivacyData({...privacyData, appetiteNotes: e.target.value})}
                              disabled={!canEditPrivacy}
                              rows="3"
                              placeholder="e.g., Ate full meal, Skipped breakfast (non-medical)"
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none disabled:opacity-50"
                            />
                          </div>

                          {/* General Observations */}
                          <div>
                            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                              <Eye className="text-cyan-400" size={20} />
                              General Observations
                            </h4>
                            <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-4 mb-4">
                              <div className="flex items-start gap-3">
                                <AlertTriangle className="text-orange-400 flex-shrink-0 mt-1" size={20} />
                                <div>
                                  <h5 className="text-orange-300 font-semibold mb-1">Important</h5>
                                  <p className="text-slate-300 text-sm">
                                    Do NOT include medical symptoms, diagnoses, or treatment information
                                  </p>
                                </div>
                              </div>
                            </div>
                            <textarea
                              value={privacyData.observations}
                              onChange={(e) => setPrivacyData({...privacyData, observations: e.target.value})}
                              disabled={!canEditPrivacy}
                              rows="4"
                              placeholder="General observations not tied to diagnosis..."
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none disabled:opacity-50"
                            />
                          </div>
                        </div>
                      )}

                      {/* Operational Tab */}
                      {activeTab === 'operational' && (
                        <div className="space-y-6">
                          {/* Goals Practiced */}
                          <div>
                            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                              <Target className="text-emerald-400" size={20} />
                              Goals Practiced
                            </h4>
                            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-4">
                              <input
                                type="text"
                                placeholder="e.g., Practiced money skills, Practiced communication skills"
                                disabled={!canEditPrivacy}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && canEditPrivacy) {
                                    addGoal(e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                              />
                              <p className="text-slate-500 text-xs mt-2">Press Enter to add goal</p>
                            </div>

                            {privacyData.goalsPracticed.length > 0 && (
                              <div className="space-y-2">
                                {privacyData.goalsPracticed.map((goal, idx) => (
                                  <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <p className="text-white">{goal.goal}</p>
                                        <p className="text-slate-500 text-xs mt-1">
                                          {new Date(goal.timestamp).toLocaleString()} • {goal.recordedBy}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Staff Documentation */}
                          <div>
                            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                              <MessageSquare className="text-blue-400" size={20} />
                              Staff Documentation (Non-Clinical)
                            </h4>
                            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 mb-4">
                              <div className="flex items-start gap-3">
                                <Info className="text-blue-400 flex-shrink-0 mt-1" size={20} />
                                <div>
                                  <h5 className="text-blue-300 font-semibold mb-1">Allowed Documentation</h5>
                                  <ul className="text-slate-300 text-sm space-y-1">
                                    <li>✓ "Participated in group activity today"</li>
                                    <li>✓ "Mood was calm and cooperative"</li>
                                    <li>✓ "Walked in the community for 30 minutes"</li>
                                    <li>✗ Medical symptoms or diagnoses</li>
                                    <li>✗ Medication information</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <textarea
                              value={privacyData.staffDocumentation}
                              onChange={(e) => setPrivacyData({...privacyData, staffDocumentation: e.target.value})}
                              disabled={!canEditPrivacy}
                              rows="6"
                              placeholder="General, non-clinical documentation..."
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none disabled:opacity-50"
                            />
                          </div>
                        </div>
                      )}

                      {/* Governance Tab */}
                      {activeTab === 'governance' && (
                        <div className="space-y-6">
                          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={20} />
                              <div>
                                <h4 className="text-green-300 font-semibold mb-1">Privacy Compliance</h4>
                                <p className="text-slate-300 text-sm">
                                  This system is designed for wellness tracking only. No PHI is collected or stored.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Data Retention (Months)
                              </label>
                              <input
                                type="number"
                                value={privacyData.dataRetentionMonths}
                                onChange={(e) => setPrivacyData({...privacyData, dataRetentionMonths: parseInt(e.target.value)})}
                                disabled={!canEditPrivacy}
                                min="12"
                                max="36"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                              />
                              <p className="text-slate-500 text-xs mt-1">Range: 12-36 months</p>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Consent Status
                              </label>
                              <div className="flex items-center gap-3 h-full">
                                <button
                                  onClick={() => canEditPrivacy && setPrivacyData({
                                    ...privacyData, 
                                    consentGiven: !privacyData.consentGiven,
                                    consentDate: !privacyData.consentGiven ? new Date().toISOString().split('T')[0] : ''
                                  })}
                                  disabled={!canEditPrivacy}
                                  className={`px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                                    privacyData.consentGiven
                                      ? 'bg-green-600 text-white'
                                      : 'bg-slate-700 text-slate-300'
                                  }`}
                                >
                                  {privacyData.consentGiven ? 'Consent Given' : 'No Consent'}
                                </button>
                              </div>
                            </div>

                            {privacyData.consentGiven && (
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Consent Date
                                </label>
                                <input
                                  type="date"
                                  value={privacyData.consentDate}
                                  onChange={(e) => setPrivacyData({...privacyData, consentDate: e.target.value})}
                                  disabled={!canEditPrivacy}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                                />
                              </div>
                            )}

                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Last Reviewed
                              </label>
                              <input
                                type="date"
                                value={privacyData.lastReviewed}
                                disabled
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white opacity-50"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Reviewed By
                              </label>
                              <input
                                type="text"
                                value={privacyData.reviewedBy}
                                disabled
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white opacity-50"
                              />
                            </div>
                          </div>

                          {/* Privacy Guidelines */}
                          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mt-6">
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                              <FileText className="text-emerald-400" size={20} />
                              Privacy Guidelines
                            </h4>
                            <div className="space-y-4">
                              <div>
                                <h5 className="text-emerald-400 font-semibold mb-2">✓ Allowed Data</h5>
                                <ul className="text-slate-300 text-sm space-y-1 ml-4">
                                  <li>• Nickname or initials</li>
                                  <li>• Age range (not exact age)</li>
                                  <li>• City or state only</li>
                                  <li>• Mood check-ins and energy levels</li>
                                  <li>• Activity participation</li>
                                  <li>• General sleep and appetite notes</li>
                                </ul>
                              </div>
                              <div>
                                <h5 className="text-red-400 font-semibold mb-2">✗ Prohibited Data (PHI)</h5>
                                <ul className="text-slate-300 text-sm space-y-1 ml-4">
                                  <li>• Diagnoses (autism, bipolar, etc.)</li>
                                  <li>• Medication names or doses</li>
                                  <li>• Treatment plans</li>
                                  <li>• Medical incident reports</li>
                                  <li>• Insurance or Medicaid IDs</li>
                                  <li>• Provider names or specialties</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </ScrollArea>
    </div>
  </div>
</div>
);
};
export default DataPrivacyPage;