'use client'

import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, Users, Calendar, Filter, Download, ArrowLeft,
  BarChart3, PieChart, Activity, AlertTriangle, CheckCircle,
  Clock, Target, Heart, Pill, FileText, MapPin, Brain,CreditCard,
  ChevronRight, ChevronDown, Loader2, Search, X, Menu,
  Home, Settings, Bell, Shield, Zap, Sparkles, Award,
  TrendingDown, ArrowUp, ArrowDown, Minus, Eye, Share2,
  RefreshCcw, Calendar as CalendarIcon, User, Home as HomeIcon,
  Printer
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

// main
const AnalyticsPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { userProfile, loading: profileLoading, hasPermission, hasAnyPermission } = useUserProfile();
  const printRef = useRef(null);
  
  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTimeRange, setFilterTimeRange] = useState('30days');
  const [filterFacility, setFilterFacility] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('analytics');
  const [selectedIndividual, setSelectedIndividual] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    totalIndividuals: 0,
    activeIndividuals: 0,
    avgComplianceScore: 0,
    totalDailyNotes: 0,
    totalIncidents: 0,
    totalMedications: 0,
    avgGoalProgress: 0,
    hcbsCompliance: 0,
    medicationCompliance: 0,
    behavioralIncidents: 0,
    communityOutings: 0,
    goalAchievements: 0
  });

  // Permission checks
  const canViewReports = hasAnyPermission([
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canExportReports = hasAnyPermission([
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

 // Menu items (same as IncidentsPage)
  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', badge: null },
    { id: 'individual', icon: Users, label: 'Individuals', badge: null },
    { id: 'medicine', icon: Pill, label: 'Medications', badge: null },
    { id: 'incident', icon: AlertTriangle, label: 'Incidents', badge: '3' },
    { id: 'billing', icon: CreditCard, label: 'Billing', badge: null },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics', badge: null },
    { id: 'settings', icon: Settings, label: 'Settings', badge: null },
  ];


  const timeRanges = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '1year', label: 'Last Year' },
    { value: 'all', label: 'All Time' }
  ];

  useEffect(() => {
    if (isLoaded && user && !profileLoading && userProfile) {
      if (canViewReports) {
        fetchIndividuals();
      } else {
        setLoading(false);
      }
    }
  }, [isLoaded, user, profileLoading, userProfile]);

  useEffect(() => {
    if (individuals.length > 0) {
      calculateAnalytics();
    }
  }, [individuals, filterTimeRange, filterFacility]);

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

  const calculateAnalytics = () => {
    let filteredIndividuals = individuals;

    if (filterFacility !== 'all') {
      filteredIndividuals = filteredIndividuals.filter(ind => ind.homeassignment === filterFacility);
    }

    const now = new Date();
    const getDateThreshold = () => {
      switch (filterTimeRange) {
        case '7days': return new Date(now.setDate(now.getDate() - 7));
        case '30days': return new Date(now.setDate(now.getDate() - 30));
        case '90days': return new Date(now.setDate(now.getDate() - 90));
        case '6months': return new Date(now.setMonth(now.getMonth() - 6));
        case '1year': return new Date(now.setFullYear(now.getFullYear() - 1));
        default: return new Date(0);
      }
    };
    const dateThreshold = getDateThreshold();

    const totalIndividuals = filteredIndividuals.length;
    const activeIndividuals = filteredIndividuals.filter(ind => ind.status === 'Active').length;
    
    const avgComplianceScore = totalIndividuals > 0
      ? Math.round(filteredIndividuals.reduce((acc, ind) => acc + (ind.compliance_score || 0), 0) / totalIndividuals)
      : 0;

    let totalDailyNotes = 0;
    let totalIncidents = 0;
    let totalMedications = 0;
    let totalGoalProgress = 0;
    let goalCount = 0;
    let medicationComplianceSum = 0;
    let medicationCount = 0;
    let behavioralIncidents = 0;
    let communityOutings = 0;
    let goalAchievements = 0;

    filteredIndividuals.forEach(ind => {
      if (ind.dailynotes) {
        totalDailyNotes += ind.dailynotes.filter(note => 
          new Date(note.date) >= dateThreshold
        ).length;
        
        communityOutings += ind.dailynotes.filter(note => 
          note.communityouting && new Date(note.date) >= dateThreshold
        ).length;
      }

      if (ind.incidents) {
        const recentIncidents = ind.incidents.filter(inc => 
          new Date(inc.dateoccurred) >= dateThreshold
        );
        totalIncidents += recentIncidents.length;
        behavioralIncidents += recentIncidents.filter(inc => 
          inc.incidenttype === 'Behavioral Emergency'
        ).length;
      }

      if (ind.medications) {
        totalMedications += ind.medications.filter(med => med.status === 'Active').length;
        ind.medications.forEach(med => {
          if (med.status === 'Active') {
            medicationComplianceSum += (med.compliance || 0);
            medicationCount++;
          }
        });
      }

      if (ind.goals) {
        ind.goals.forEach(goal => {
          if (goal.status === 'Active') {
            totalGoalProgress += (goal.progress || 0);
            goalCount++;
          }
          if (goal.status === 'Completed') {
            goalAchievements++;
          }
        });
      }
    });

    const avgGoalProgress = goalCount > 0 ? Math.round(totalGoalProgress / goalCount) : 0;
    const medicationCompliance = medicationCount > 0 
      ? Math.round(medicationComplianceSum / medicationCount) 
      : 0;
    
    const hcbsCompliance = totalIndividuals > 0
      ? Math.round((communityOutings / (totalIndividuals * 4)) * 100)
      : 0;

    setAnalyticsData({
      totalIndividuals,
      activeIndividuals,
      avgComplianceScore,
      totalDailyNotes,
      totalIncidents,
      totalMedications,
      avgGoalProgress,
      hcbsCompliance: Math.min(hcbsCompliance, 100),
      medicationCompliance,
      behavioralIncidents,
      communityOutings,
      goalAchievements
    });
  };

  const handlePrintIndividual = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setIsPrinting(false), 100);
    }, 100);
  };

  const handleExportReport = () => {
    if (!canExportReports) {
      alert('You do not have permission to export reports.');
      return;
    }

    const headers = ['Name', 'ID', 'Home', 'Status', 'Compliance', 'Daily Notes', 'Medications', 'Incidents', 'Goals Progress'];
    const csvContent = [
      headers.join(','),
      ...filteredIndividuals.map(ind => [
        `${ind.firstname} ${ind.lastname}`,
        ind.individualid,
        ind.homeassignment,
        ind.status,
        ind.compliance_score || 0,
        ind.dailynotes?.length || 0,
        ind.medications?.length || 0,
        ind.incidents?.length || 0,
        ind.goals ? Math.round(ind.goals.reduce((acc, g) => acc + (g.progress || 0), 0) / (ind.goals.length || 1)) : 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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

  const getTrendIndicator = (value, previousValue) => {
    if (value > previousValue) {
      return { icon: ArrowUp, color: 'text-green-400', trend: '+' };
    } else if (value < previousValue) {
      return { icon: ArrowDown, color: 'text-red-400', trend: '-' };
    }
    return { icon: Minus, color: 'text-slate-400', trend: '' };
  };

  const filteredIndividuals = individuals.filter(ind => {
    const matchesSearch = 
      ind.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.individualid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.homeassignment?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFacility = filterFacility === 'all' || ind.homeassignment === filterFacility;

    return matchesSearch && matchesFacility;
  });

  const facilities = [...new Set(individuals.map(ind => ind.homeassignment))].filter(Boolean);

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
            placeholder="Search analytics..." 
            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-500"
          />
          <kbd className="px-2 py-0.5 text-xs bg-slate-700 rounded text-slate-400 font-mono">⌘K</kbd>
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
        
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">System Health</span>
            <span className="text-xs text-purple-400 font-bold">{analyticsData.avgComplianceScore}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-1000" 
              style={{width: `${analyticsData.avgComplianceScore}%`}}></div>
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
  if (!profileLoading && !canViewReports) {
    return (
      <div className="h-screen flex flex-col bg-slate-950 text-white">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
            <p className="text-slate-400 mb-6">
              You do not have permission to view analytics and reports. Please contact your administrator if you believe this is an error.
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
          <p className="text-slate-400 text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-content,
          #printable-content * {
            visibility: visible;
          }
          #printable-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 40px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

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
                          Analytics Dashboard
                        </h2>
                        <div className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full">
                          <span className="text-purple-400 text-xs font-bold flex items-center gap-1">
                            <BarChart3 size={12} /> LIVE
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-400 text-lg">
                        Comprehensive reporting and data insights • IPMS Aligned
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-slate-700"
                      >
                        <ArrowLeft size={18} />
                        Back to Home
                      </button>
                      {canExportReports && (
                        <button 
                          onClick={handleExportReport}
                          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300"
                        >
                          <Download size={18} />
                          Export Report
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Controls */}
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1 flex items-center gap-3 bg-slate-900/50 rounded-xl px-5 py-3 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 group">
                        <Search size={20} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                        <input 
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search individuals..." 
                          className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-500"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={filterTimeRange}
                          onChange={(e) => setFilterTimeRange(e.target.value)}
                          className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-emerald-500 hover:border-emerald-500/50 transition-all font-semibold"
                        >
                          {timeRanges.map(range => (
                            <option key={range.value} value={range.value}>{range.label}</option>
                          ))}
                        </select>
                        <select
                          value={filterFacility}
                          onChange={(e) => setFilterFacility(e.target.value)}
                          className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-5Continue13:45py-3 text-white focus:outline-none focus:border-emerald-500 hover:border-emerald-500/50 transition-all font-semibold"
>
<option value="all">All Facilities</option>
{facilities.map(facility => (
<option key={facility} value={facility}>{facility}</option>
))}
</select>
<button
onClick={() => {
setFilterTimeRange('30days');
setFilterFacility('all');
setSearchTerm('');
}}
className="p-3 bg-slate-900/50 hover:bg-slate-800 border border-slate-700/50 hover:border-emerald-500/50 rounded-xl transition-all"
>
<RefreshCcw size={20} className="text-slate-400 hover:text-emerald-400" />
</button>
</div>
</div>
</div>
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Individuals */}
                <div className="group relative bg-gradient-to-br from-emerald-600/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-600 to-teal-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                        <Users className="text-white" size={26} />
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="text-emerald-400" size={18} />
                        <span className="text-sm font-bold text-emerald-400">
                          +5%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-400 text-sm font-medium">Total Individuals</p>
                      <div className="flex items-end gap-2">
                        <p className="text-4xl font-black text-white">{analyticsData.totalIndividuals}</p>
                        <Sparkles className="text-lime-400 mb-2 animate-pulse" size={20} />
                      </div>
                      <p className="text-xs text-emerald-400 font-medium mt-2">
                        {analyticsData.activeIndividuals} active
                      </p>
                    </div>
                  </div>
                </div>

                {/* Average Compliance */}
                <div className="group relative bg-gradient-to-br from-blue-600/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600 to-cyan-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                        <CheckCircle className="text-white" size={26} />
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="text-blue-400" size={18} />
                        <span className="text-sm font-bold text-blue-400">
                          +3%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-400 text-sm font-medium">Avg Compliance</p>
                      <div className="flex items-end gap-2">
                        <p className="text-4xl font-black text-white">{analyticsData.avgComplianceScore}%</p>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-1000"
                          style={{width: `${analyticsData.avgComplianceScore}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Daily Notes */}
                <div className="group relative bg-gradient-to-br from-purple-600/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                        <FileText className="text-white" size={26} />
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="text-purple-400" size={18} />
                        <span className="text-sm font-bold text-purple-400">
                          +12%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-400 text-sm font-medium">Daily Notes</p>
                      <div className="flex items-end gap-2">
                        <p className="text-4xl font-black text-white">{analyticsData.totalDailyNotes}</p>
                      </div>
                      <p className="text-xs text-purple-400 font-medium mt-2">
                        in selected period
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Incidents */}
                <div className="group relative bg-gradient-to-br from-orange-600/20 to-red-500/20 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-600 to-red-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                        <AlertTriangle className="text-white" size={26} />
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingDown className="text-green-400" size={18} />
                        <span className="text-sm font-bold text-green-400">
                          -8%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-400 text-sm font-medium">Total Incidents</p>
                      <div className="flex items-end gap-2">
                        <p className="text-4xl font-black text-white">{analyticsData.totalIncidents}</p>
                      </div>
                      <p className="text-xs text-orange-400 font-medium mt-2">
                        {analyticsData.behavioralIncidents} behavioral
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-4 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <Pill className="text-blue-400" size={20} />
                    <span className="text-2xl font-bold text-white">{analyticsData.totalMedications}</span>
                  </div>
                  <p className="text-slate-400 text-sm">Active Medications</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{width: `${analyticsData.medicationCompliance}%`}}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-500">{analyticsData.medicationCompliance}%</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-4 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="text-green-400" size={20} />
                    <span className="text-2xl font-bold text-white">{analyticsData.avgGoalProgress}%</span>
                  </div>
                  <p className="text-slate-400 text-sm">Avg Goal Progress</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{width: `${analyticsData.avgGoalProgress}%`}}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-500">{analyticsData.goalAchievements} completed</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-4 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <MapPin className="text-purple-400" size={20} />
                    <span className="text-2xl font-bold text-white">{analyticsData.communityOutings}</span>
                  </div>
                  <p className="text-slate-400 text-sm">Community Outings</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                      <div 
                        className="h-full bg-purple-500 rounded-full" 
                        style={{width: `${analyticsData.hcbsCompliance}%`}}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-500">{analyticsData.hcbsCompliance}% HCBS</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-4 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <Brain className="text-cyan-400" size={20} />
                    <span className="text-2xl font-bold text-white">{analyticsData.behavioralIncidents}</span>
                  </div>
                  <p className="text-slate-400 text-sm">Behavioral Events</p>
                  <div className="mt-2">
                    <span className="text-xs text-slate-500">
                      {analyticsData.totalIncidents > 0 
                        ? Math.round((analyticsData.behavioralIncidents / analyticsData.totalIncidents) * 100)
                        : 0}% of all incidents
                    </span>
                  </div>
                </div>
              </div>

              {/* Individual Performance Table */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Individual Performance</h3>
                    <p className="text-slate-400">Detailed metrics for each individual</p>
                  </div>
                  <button
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-800 text-white rounded-xl px-5 py-3 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 font-semibold"
                  >
                    <Filter size={18} />
                    Filter
                  </button>
                </div>

                {filteredIndividuals.length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-slate-400 mb-2">No individuals found</h4>
                    <p className="text-slate-500">Try adjusting your filters</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <div className="pr-4">
                      <table className="w-full">
                        <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
                          <tr className="border-b border-slate-700/50">
                            <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Individual</th>
                            <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Compliance</th>
                            <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Daily Notes</th>
                            <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Medications</th>
                            <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Incidents</th>
                            <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Goals</th>
                            <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredIndividuals.map((individual, idx) => {
                            const dailyNotesCount = individual.dailynotes?.filter(note => 
                              new Date(note.date) >= new Date(new Date().setDate(new Date().getDate() - 30))
                            ).length || 0;
                            const medicationsCount = individual.medications?.filter(med => med.status === 'Active').length || 0;
                            const incidentsCount = individual.incidents?.filter(inc => 
                              new Date(inc.dateoccurred) >= new Date(new Date().setDate(new Date().getDate() - 30))
                            ).length || 0;
                            const goalProgress = individual.goals?.length > 0
                              ? Math.round(individual.goals.reduce((acc, g) => acc + (g.progress || 0), 0) / individual.goals.length)
                              : 0;

                            return (
                              <tr key={individual.id} 
                                onClick={() => setSelectedIndividual(individual)}
                                className="border-b border-slate-700/30 hover:bg-slate-900/50 transition-all duration-300 group cursor-pointer">
                                <td className="py-5 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${getColorClass(idx)} rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-all duration-300`}>
                                      {getInitials(individual.firstname, individual.lastname)}
                                    </div>
                                    <div>
                                      <p className="text-white font-semibold group-hover:text-emerald-400 transition-colors">
                                        {individual.firstname} {individual.lastname}
                                      </p>
                                      <p className="text-slate-500 text-xs font-mono">{individual.individualid}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-5 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-full bg-slate-700 rounded-full h-2 w-24">
                                      <div 
                                        className={`h-full rounded-full ${
                                          individual.compliance_score >= 95 ? 'bg-lime-500' : 
                                          individual.compliance_score >= 85 ? 'bg-yellow-500' : 
                                          'bg-red-500'
                                        }`} 
                                        style={{width: `${individual.compliance_score}%`}}
                                      ></div>
                                    </div>
                                    <span className="text-sm font-bold text-white">{individual.compliance_score}%</span>
                                  </div>
                                </td>
                                <td className="py-5 px-4">
                                  <div className="flex items-center gap-2">
                                    <FileText size={14} className="text-purple-400" />
                                    <span className="text-white font-semibold">{dailyNotesCount}</span>
                                  </div>
                                </td>
                                <td className="py-5 px-4">
                                  <div className="flex items-center gap-2">
                                    <Pill size={14} className="text-blue-400" />
                                    <span className="text-white font-semibold">{medicationsCount}</span>
                                  </div>
                                </td>
                                <td className="py-5 px-4">
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle size={14} className={incidentsCount > 0 ? 'text-orange-400' : 'text-slate-600'} />
                                    <span className={`font-semibold ${incidentsCount > 0 ? 'text-white' : 'text-slate-600'}`}>
                                      {incidentsCount}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-5 px-4">
                                  <div className="flex items-center gap-2">
                                    <Target size={14} className="text-green-400" />
                                    <span className="text-white font-semibold">{goalProgress}%</span>
                                  </div>
                                </td>
                                <td className="py-5 px-4">
                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/individual/${individual.id}`);
                                      }}
                                      className="p-2 hover:bg-emerald-500/20 rounded-lg transition-all group/btn"
                                    >
                                      <Eye size={16} className="text-emerald-400 group-hover/btn:scale-110 transition-all" />
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Generate individual report
                                      }}
                                      className="p-2 hover:bg-blue-500/20 rounded-lg transition-all group/btn"
                                    >
                                      <Share2 size={16} className="text-blue-400 group-hover/btn:scale-110 transition-all" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </ScrollArea>
                )}

                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700/50">
                  <p className="text-slate-400 text-sm">
                    Showing <span className="text-white font-semibold">{filteredIndividuals.length}</span> of <span className="text-white font-semibold">{individuals.length}</span> individuals
                  </p>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all">
                      Previous
                    </button>
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all">
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="text-emerald-400" size={24} />
                    Compliance Trends
                  </h3>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-xl">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-500">Chart visualization coming soon</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <PieChart className="text-blue-400" size={24} />
                    Incident Distribution
                  </h3>
                  <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-xl">
                    <div className="text-center">
                      <PieChart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-500">Chart visualization coming soon</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </main>
        </ScrollArea>
      </div>
    </div>

    {/* Individual Detail Modal */}
    {selectedIndividual && (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                {getInitials(selectedIndividual.firstname, selectedIndividual.lastname)}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {selectedIndividual.firstname} {selectedIndividual.lastname}
                </h3>
                <p className="text-slate-400 text-sm">ID: {selectedIndividual.individualid}</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedIndividual(null)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-all"
            >
              <X className="text-slate-400" size={24} />
            </button>
          </div>

          <ScrollArea className="h-[calc(90vh-180px)]">
            <div className="p-6 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-400 text-xs mb-1">Compliance</p>
                  <p className="text-2xl font-bold text-white">{selectedIndividual.compliance_score}%</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-400 text-xs mb-1">Daily Notes</p>
                  <p className="text-2xl font-bold text-white">{selectedIndividual.dailynotes?.length || 0}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-400 text-xs mb-1">Medications</p>
                  <p className="text-2xl font-bold text-white">{selectedIndividual.medications?.length || 0}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-400 text-xs mb-1">Incidents</p>
                  <p className="text-2xl font-bold text-white">{selectedIndividual.incidents?.length || 0}</p>
                </div>
              </div>

              {/* Detailed Sections */}
              <div className="space-y-4">
                <div className="bg-slate-800/30 rounded-xl p-4">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <User size={18} />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500">Home Assignment</p>
                      <p className="text-white font-semibold">{selectedIndividual.homeassignment}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Status</p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        selectedIndividual.status === 'Active' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {selectedIndividual.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-slate-500">Date of Birth</p>
                      <p className="text-white font-semibold">{new Date(selectedIndividual.dateofbirth).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Admission Date</p>
                      <p className="text-white font-semibold">{new Date(selectedIndividual.admissiondate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/30 rounded-xl p-4">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2Continue13:48">
<Target size={18} />
Goals & Outcomes
</h4>
{selectedIndividual.goals?.length > 0 ? (
<div className="space-y-2">
{selectedIndividual.goals.slice(0, 3).map(goal => (
<div key={goal.id} className="flex items-center justify-between">
<p className="text-sm text-slate-300">{goal.description}</p>
<span className="text-sm font-bold text-emerald-400">{goal.progress}%</span>
</div>
))}
</div>
) : (
<p className="text-slate-500 text-sm">No goals defined</p>
)}
</div>
                <div className="bg-slate-800/30 rounded-xl p-4">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <AlertTriangle size={18} />
                    Recent Incidents
                  </h4>
                  {selectedIndividual.incidents?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedIndividual.incidents.slice(0, 3).map(incident => (
                        <div key={incident.id} className="flex items-center justify-between text-sm">
                          <p className="text-slate-300">{incident.incidenttype}</p>
                          <span className="text-slate-500">{new Date(incident.dateoccurred).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">No incidents reported</p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
            <button
              onClick={() => setSelectedIndividual(null)}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
            >
              Close
            </button>
            <button
              onClick={handlePrintIndividual}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-blue-500/50 transition-all flex items-center gap-2"
            >
              <Printer size={18} />
              Print Report
            </button>
            <button
              onClick={() => router.push(`/individual/${selectedIndividual.id}`)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all"
            >
              View Full Profile
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Printable Content - Hidden on screen, visible in print */}
    {selectedIndividual && (
      <div id="printable-content" className="hidden print:block">
        <div className="bg-white text-black p-8">
          {/* Header */}
          <div className="border-b-4 border-emerald-600 pb-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                  {getInitials(selectedIndividual.firstname, selectedIndividual.lastname)}
                </div>
                <div>
                  <h1 className="text-4xl font-black text-gray-900">
                    {selectedIndividual.firstname} {selectedIndividual.lastname}
                  </h1>
                  <p className="text-gray-600 text-lg mt-1">Individual Profile Report</p>
                  <p className="text-gray-500 text-sm font-mono mt-1">ID: {selectedIndividual.individualid}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-emerald-50 border-2 border-emerald-600 rounded-xl p-4">
                  <p className="text-xs text-gray-600 mb-1">Report Generated</p>
                  <p className="text-lg font-bold text-emerald-700">{new Date().toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">{new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-600 p-4 rounded-r-lg">
              <p className="text-sm font-semibold text-emerald-900">CareBridge Pro - IPMS Aligned EMR System</p>
              <p className="text-xs text-gray-600">Alabama DD Compliant Electronic Medical Record</p>
            </div>
          </div>

          {/* Quick Statistics Grid */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-white" size={20} />
                </div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Compliance</p>
              </div>
              <p className="text-3xl font-black text-emerald-700">{selectedIndividual.compliance_score}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="h-full bg-emerald-600 rounded-full" 
                  style={{width: `${selectedIndividual.compliance_score}%`}}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="text-white" size={20} />
                </div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Daily Notes</p>
              </div>
              <p className="text-3xl font-black text-purple-700">{selectedIndividual.dailynotes?.length || 0}</p>
              <p className="text-xs text-gray-500 mt-2">Total documented</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Pill className="text-white" size={20} />
                </div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Medications</p>
              </div>
              <p className="text-3xl font-black text-blue-700">{selectedIndividual.medications?.filter(m => m.status === 'Active').length || 0}</p>
              <p className="text-xs text-gray-500 mt-2">Active prescriptions</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="text-white" size={20} />
                </div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Incidents</p>
              </div>
              <p className="text-3xl font-black text-orange-700">{selectedIndividual.incidents?.length || 0}</p>
              <p className="text-xs text-gray-500 mt-2">Total reported</p>
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 rounded-t-xl flex items-center gap-2">
              <User size={20} />
              <h2 className="text-xl font-bold">Basic Information</h2>
            </div>
            <div className="border-2 border-gray-200 rounded-b-xl p-6">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Full Name</p>
                  <p className="text-lg font-bold text-gray-900">{selectedIndividual.firstname} {selectedIndividual.lastname}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Individual ID</p>
                  <p className="text-lg font-bold text-gray-900 font-mono">{selectedIndividual.individualid}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Status</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${
                    selectedIndividual.status === 'Active' ? 'bg-green-100 text-green-700 border-2 border-green-300' : 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                  }`}>
                    {selectedIndividual.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Date of Birth</p>
                  <p className="text-lg font-bold text-gray-900">{new Date(selectedIndividual.dateofbirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Admission Date</p>
                  <p className="text-lg font-bold text-gray-900">{new Date(selectedIndividual.admissiondate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Home Assignment</p>
                  <p className="text-lg font-bold text-gray-900">{selectedIndividual.homeassignment}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Goals & Progress Section */}
          {selectedIndividual.goals && selectedIndividual.goals.length > 0 && (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white p-4 rounded-t-xl flex items-center gap-2">
                <Target size={20} />
                <h2 className="text-xl font-bold">Goals & Progress Tracking</h2>
              </div>
              <div className="border-2 border-gray-200 rounded-b-xl p-6">
                <div className="space-y-4">
                  {selectedIndividual.goals.map((goal, idx) => (
                    <div key={goal.id || idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-500 uppercase">Goal {idx + 1}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                              goal.status === 'Active' ? 'bg-green-100 text-green-700' :
                              goal.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {goal.status}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{goal.description || 'No description provided'}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-2xl font-black text-green-600">{goal.progress || 0}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all" 
                          style={{width: `${goal.progress || 0}%`}}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Medications Section */}
          // Replace the medications section in the printable content with this corrected version:

{selectedIndividual.medications && selectedIndividual.medications.length > 0 && (
  <div className="mb-8">
    <div className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white p-4 rounded-t-xl flex items-center gap-2">
      <Pill size={20} />
      <h2 className="text-xl font-bold">Medication Management</h2>
    </div>
    <div className="border-2 border-gray-200 rounded-b-xl">
      <table className="w-full">
        <thead className="bg-gray-50 border-b-2 border-gray-200">
          <tr>
            <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Medication Name</th>
            <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Dosage</th>
            <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Route</th>
            <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Frequency</th>
            <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Status</th>
            <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Compliance</th>
          </tr>
        </thead>
        <tbody>
          {selectedIndividual.medications.map((med, idx) => (
            <tr key={med.id || idx} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
              <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                {med.medicationname || med.name || 'N/A'}
              </td>
              <td className="py-3 px-4 text-sm text-gray-700">{med.dosage || 'N/A'}</td>
              <td className="py-3 px-4 text-sm text-gray-700">{med.route || 'N/A'}</td>
              <td className="py-3 px-4 text-sm text-gray-700">{med.frequency || 'N/A'}</td>
              <td className="py-3 px-4">
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                  med.status === 'Active' ? 'bg-green-100 text-green-700' :
                  med.status === 'On Hold' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {med.status || 'Active'}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-full bg-blue-600 rounded-full" 
                      style={{width: `${med.compliance || 0}%`}}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-gray-700">{med.compliance || 0}%</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

          {/* Incidents Section */}
          {selectedIndividual.incidents && selectedIndividual.incidents.length > 0 && (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-orange-700 to-red-600 text-white p-4 rounded-t-xl flex items-center gap-2">
                <AlertTriangle size={20} />
                <h2 className="text-xl font-bold">Incident Reports</h2>
              </div>
              <div className="border-2 border-gray-200 rounded-b-xl">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Date</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Incident Type</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Severity</th>
                      <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedIndividual.incidents.slice(0, 5).map((incident, idx) => (
                      <tr key={incident.id || idx} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                          {new Date(incident.dateoccurred).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">{incident.incidenttype || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                            incident.severity === 'High' ? 'bg-red-100 text-red-700' :
                            incident.severity === 'Medium' ? 'bg-orange-100 text-orange-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {incident.severity || 'Low'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">{incident.description ? incident.description.substring(0, 60) + '...' : 'No description'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-6 border-t-2 border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Report Generated By</p>
                <p className="text-sm font-bold text-gray-900">{userProfile?.fullname || 'System Administrator'}</p>
                <p className="text-xs text-gray-500">{userProfile?.role_name || 'Administrator'} • {userProfile?.facility || 'CareBridge Pro'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">System Information</p>
                <p className="text-sm font-bold text-gray-900">CareBridge Pro v2.0</p>
                <p className="text-xs text-gray-500">IPMS Aligned • Alabama DD Compliant</p>
              </div>
            </div>
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600 text-center">
                <span className="font-semibold">CONFIDENTIAL:</span> This document contains protected health information (PHI) and is intended solely for authorized personnel. 
                Unauthorized disclosure or distribution is prohibited by law.
              </p>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
</>
);
};
export default AnalyticsPage;
