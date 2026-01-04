'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, TrendingUp, Users, Activity, Shield, AlertTriangle, 
  Calendar, Clock, CheckCircle, XCircle, ArrowLeft, Download, 
  Filter, Search, Eye, ChevronDown, ChevronRight, Loader2,
  FileText, Pill, Home, MapPin, Heart, Target, Award, Brain,
  Zap, Sparkles, BarChart, PieChart, LineChart, ArrowUpRight,
  ArrowDownRight, Minus, Plus, RotateCcw, Settings, Menu,
  Bell, ChevronLeft
} from 'lucide-react';
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

const AnalyticsPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { userProfile, loading: profileLoading, hasPermission, hasAnyPermission } = useUserProfile();
  
  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('reports');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Permission checks
  const canViewAnalytics = hasAnyPermission([
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.FULL_ACCESS,
    PERMISSIONS.ADMIN
  ]);

  const canExportReports = hasAnyPermission([
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.FULL_ACCESS,
    PERMISSIONS.ADMIN
  ]);

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', badge: null },
    { id: 'individuals', icon: Users, label: 'Individuals', badge: null },
    { id: 'daily-notes', icon: FileText, label: 'Daily Notes', badge: '12' },
    { id: 'medications', icon: Pill, label: 'Medications', badge: null },
    { id: 'incidents', icon: AlertTriangle, label: 'Incidents', badge: '3' },
    { id: 'hcbs', icon: MapPin, label: 'HCBS Tracking', badge: null },
    { id: 'reports', icon: BarChart3, label: 'Analytics', badge: null },
    { id: 'settings', icon: Settings, label: 'Settings', badge: null },
  ];

  const timeRanges = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: '1 Year', value: '1y' },
    { label: 'Custom', value: 'custom' }
  ];

  const metrics = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'compliance', label: 'Compliance', icon: CheckCircle },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'goals', label: 'Goals & Outcomes', icon: Target }
  ];

  useEffect(() => {
    if (isLoaded && user && !profileLoading && userProfile) {
      if (canViewAnalytics) {
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

  // Analytics calculations
  const analyticsData = useMemo(() => {
    const filteredIndividuals = individuals.filter(ind => {
      const matchesSearch = 
        ind.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ind.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ind.individualid?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    const startDate = new Date(dateFilter.start);
    const endDate = new Date(dateFilter.end);

    // Calculate metrics
    const totalIndividuals = filteredIndividuals.length;
    const activeIndividuals = filteredIndividuals.filter(ind => ind.status === 'Active').length;
    
    // Compliance scores
    const avgCompliance = filteredIndividuals.length > 0 
      ? Math.round(filteredIndividuals.reduce((acc, ind) => acc + (ind.compliance_score || 0), 0) / filteredIndividuals.length)
      : 0;

    // Goals and outcomes
    const totalGoals = filteredIndividuals.reduce((acc, ind) => acc + (ind.goals?.length || 0), 0);
    const achievedGoals = filteredIndividuals.reduce((acc, ind) => 
      acc + (ind.goals?.filter(goal => goal.status === 'Completed').length || 0), 0);
    const goalsAchievementRate = totalGoals > 0 ? Math.round((achievedGoals / totalGoals) * 100) : 0;

    // Incidents
    const totalIncidents = filteredIndividuals.reduce((acc, ind) => 
      acc + (ind.incidents?.length || 0), 0);
    const openIncidents = filteredIndividuals.reduce((acc, ind) => 
      acc + (ind.incidents?.filter(inc => inc.status === 'Open').length || 0), 0);

    // Medications
    const totalMedications = filteredIndividuals.reduce((acc, ind) => 
      acc + (ind.medications?.length || 0), 0);
    const highComplianceMeds = filteredIndividuals.reduce((acc, ind) => 
      acc + (ind.medications?.filter(med => med.compliance > 80).length || 0), 0);
    const medComplianceRate = totalMedications > 0 ? Math.round((highComplianceMeds / totalMedications) * 100) : 0;

    // Daily notes
    const totalDailyNotes = filteredIndividuals.reduce((acc, ind) => 
      acc + (ind.dailynotes?.length || 0), 0);
    const recentNotes = filteredIndividuals.reduce((acc, ind) => {
      const recent = ind.dailynotes?.filter(note => {
        const noteDate = new Date(note.date);
        return noteDate >= startDate && noteDate <= endDate;
      }) || [];
      return acc + recent.length;
    }, 0);

    // Risk analysis
    const highRiskIndividuals = filteredIndividuals.filter(ind => 
      (ind.riskplans?.length || 0) > 0 || 
      (ind.medicalalerts?.length || 0) > 2 ||
      (ind.behavioralalerts?.length || 0) > 2
    ).length;

    // Division breakdown
    const divisionBreakdown = filteredIndividuals.reduce((acc, ind) => {
      acc[ind.division] = (acc[ind.division] || 0) + 1;
      return acc;
    }, {});

    // Status breakdown
    const statusBreakdown = filteredIndividuals.reduce((acc, ind) => {
      acc[ind.status] = (acc[ind.status] || 0) + 1;
      return acc;
    }, {});

    // Activity participation
    const activityParticipation = filteredIndividuals.reduce((acc, ind) => {
      const recentNotes = ind.dailynotes?.filter(note => {
        const noteDate = new Date(note.date);
        return noteDate >= startDate && noteDate <= endDate;
      }) || [];
      
      const totalActivities = recentNotes.reduce((sum, note) => sum + (note.activities?.length || 0), 0);
      return acc + totalActivities;
    }, 0);

    return {
      filteredIndividuals,
      totalIndividuals,
      activeIndividuals,
      avgCompliance,
      totalGoals,
      achievedGoals,
      goalsAchievementRate,
      totalIncidents,
      openIncidents,
      totalMedications,
      highComplianceMeds,
      medComplianceRate,
      totalDailyNotes,
      recentNotes,
      highRiskIndividuals,
      divisionBreakdown,
      statusBreakdown,
      activityParticipation
    };
  }, [individuals, searchTerm, dateFilter]);

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

  const exportData = () => {
    if (!canExportReports) {
      alert('You do not have permission to export reports.');
      return;
    }

    const data = {
      exportDate: new Date().toISOString(),
      timeRange: selectedTimeRange,
      metrics: analyticsData,
      dateRange: dateFilter
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carebridge-analytics-${selectedTimeRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
        <div className="hidden md:flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm rounded-2xl px-5 py-2.5 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300">
          <Search size={18} className="text-emerald-400" />
          <input 
            type="text" 
            placeholder="Search analytics..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
              {userProfile?.fullname?.charAt(0) || 'U'}
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
            <span className="text-xs text-slate-400 font-medium">Analytics Coverage</span>
            <span className="text-xs text-purple-400 font-bold">
              {analyticsData.totalIndividuals > 0 ? '100%' : '0%'}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-1000" 
              style={{width: analyticsData.totalIndividuals > 0 ? '100%' : '0%'}}>
            </div>
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
  if (!profileLoading && !canViewAnalytics) {
    return (
      <div className="h-screen flex flex-col bg-slate-950 text-white">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
            <p className="text-slate-400 mb-6">
              You do not have permission to view analytics. Please contact your administrator if you believe this is an error.
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
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500">
                Analytics Dashboard
              </h1>
              <p className="text-slate-400 mt-1">
                IPMS-Aligned • Comprehensive Individual Reporting
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {canExportReports && (
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all"
              >
                <Download size={18} />
                Export Data
              </button>
            )}
          </div>
        </div>

        {/* Time Range & Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex items-center gap-3 bg-slate-900/50 rounded-xl px-5 py-3 border border-slate-700/50">
            <Calendar className="text-slate-400" size={20} />
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-white focus:ring-0"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value} className="bg-slate-800">
                  {range.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={dateFilter.start}
              onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
              className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-emerald-500"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={dateFilter.end}
              onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
              className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex-1 flex items-center gap-3 bg-slate-900/50 rounded-xl px-5 py-3 border border-slate-700/50">
            <Search size={20} className="text-slate-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search individuals..." 
              className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative bg-gradient-to-br from-emerald-600/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-600 to-teal-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                  <Users className="text-white" size={26} />
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="text-green-400" size={18} />
                  <span className="text-sm font-bold text-green-400">+12%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-slate-400 text-sm font-medium">Total Individuals</p>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-black text-white">{analyticsData.totalIndividuals}</p>
                  <Sparkles className="text-lime-400 mb-2 animate-pulse" size={20} />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {analyticsData.activeIndividuals} active • {analyticsData.totalIndividuals - analyticsData.activeIndividuals} inactive
                </p>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-blue-600/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600 to-cyan-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                  <CheckCircle className="text-white" size={26} />
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="text-blue-400" size={18} />
                  <span className="text-sm font-bold text-blue-400">+8%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-slate-400 text-sm font-medium">Avg Compliance</p>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-black text-white">{analyticsData.avgCompliance}%</p>
                </div>
                <p className="text-xs text-slate-500 mt-2">Across all individuals</p>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-purple-600/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                  <Target className="text-white" size={26} />
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="text-purple-400" size={18} />
                  <span className="text-sm font-bold text-purple-400">{analyticsData.goalsAchievementRate}%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-slate-400 text-sm font-medium">Goals Achievement</p>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-black text-white">{analyticsData.achievedGoals}</p>
                  <span className="text-sm text-slate-400">/{analyticsData.totalGoals}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">{analyticsData.goalsAchievementRate}% success rate</p>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-orange-600/20 to-red-500/20 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-600 to-red-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                  <AlertTriangle className="text-white" size={26} />
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="text-orange-400" size={18} />
                  <span className="text-sm font-bold text-orange-400">{analyticsData.openIncidents}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-slate-400 text-sm font-medium">Open Incidents</p>
                <div className="flex items-end gap-2">
                  <p className="text-4xl font-black text-white">{analyticsData.openIncidents}</p>
                  <span className="text-sm text-slate-400">/{analyticsData.totalIncidents}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">{analyticsData.highRiskIndividuals} high-risk individuals</p>
              </div>
            </div>
          </div>
        </div>

        {/* Metric Navigation */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-2 flex gap-2 overflow-x-auto">
          {metrics.map(metric => {
            const Icon = metric.icon;
            return (
              <button
                key={metric.id}
                onClick={() => setSelectedMetric(metric.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  selectedMetric === metric.id
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon size={18} />
                {metric.label}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300">
          <ScrollArea className="h-[calc(100vh-400px)]">
            <div className="pr-4 space-y-8">
              
              {/* Overview Section */}
              {selectedMetric === 'overview' && (
                <div className="space-y-6">
                  {/* Division Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <PieChart className="text-emerald-400" size={24} />
                        Division Breakdown
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(analyticsData.divisionBreakdown).map(([division, count]) => (
                          <div key={division} className="flex items-center justify-between">
                            <span className="text-slate-300">{division}</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 bg-slate-700 rounded-full h-2">
                                <div 
                                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full"
                                  style={{width: `${(count / analyticsData.totalIndividuals) * 100}%`}}
                                ></div>
                              </div>
                              <span className="text-white font-semibold w-12 text-right">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <BarChart className="text-blue-400" size={24} />
                        Status Distribution
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(analyticsData.statusBreakdown).map(([status, count]) => (
                          <div key={status} className="flex items-center justify-between">
                            <span className="text-slate-300">{status}</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 bg-slate-700 rounded-full h-2">
                                <div 
                                  className={`h-full rounded-full ${
                                    status === 'Active' ? 'bg-gradient-to-r from-green-600 to-emerald-500' :
                                    status === 'Review' ? 'bg-gradient-to-r from-yellow-600 to-orange-500' :
                                    'bg-gradient-to-r from-red-600 to-pink-500'
                                  }`}
                                  style={{width: `${(count / analyticsData.totalIndividuals) * 100}%`}}
                                ></div>
                              </div>
                              <span className="text-white font-semibold w-12 text-right">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Individual Performance Table */}
                  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Users className="text-purple-400" size={24} />
                      Individual Performance Summary
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Individual</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Status</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Compliance</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Goals</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Incidents</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Alerts</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Last Activity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analyticsData.filteredIndividuals.slice(0, 20).map((individual, idx) => (
                            <tr key={individual.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-all">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 bg-gradient-to-br ${getColorClass(idx)} rounded-xl flex items-center justify-center text-white font-bold`}>
                                    {getInitials(individual.firstname, individual.lastname)}
                                  </div>
                                  <div>
                                    <p className="text-white font-semibold">{individual.firstname} {individual.lastname}</p>
                                    <p className="text-slate-400 text-sm">ID: {individual.individualid}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  individual.status === 'Active' ? 'bg-green-900/30 text-green-400' :
                                  individual.status === 'Review' ? 'bg-yellow-900/30 text-yellow-400' :
                                  'bg-red-900/30 text-red-400'
                                }`}>
                                  {individual.status}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-slate-700 rounded-full h-2">
                                    <div 
                                      className={`h-full rounded-full ${
                                        (individual.compliance_score || 0) >= 90 ? 'bg-gradient-to-r from-green-600 to-emerald-500' :
                                        (individual.compliance_score || 0) >= 70 ? 'bg-gradient-to-r from-yellow-600 to-orange-500' :
                                        'bg-gradient-to-r from-red-600 to-pink-500'
                                      }`}
                                      style={{width: `${individual.compliance_score || 0}%`}}
                                    ></div>
                                  </div>
                                  <span className="text-white text-sm font-semibold">{(individual.compliance_score || 0)}%</span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="text-white">
                                  {individual.goals?.filter(g => g.status === 'Completed').length || 0}/
                                  {individual.goals?.length || 0}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="text-white">
                                  {individual.incidents?.filter(inc => inc.status === 'Open').length || 0}/
                                  {individual.incidents?.length || 0}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="text-white">
                                  {(individual.medicalalerts?.length || 0) + (individual.behavioralalerts?.length || 0)}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-slate-400 text-sm">
                                {new Date(individual.last_activity).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Compliance Section */}
              {selectedMetric === 'compliance' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4">Compliance by Individual</h3>
                      <div className="space-y-3">
                        {analyticsData.filteredIndividuals.slice(0, 10).map((individual, idx) => (
                          <div key={individual.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 bg-gradient-to-br ${getColorClass(idx)} rounded-lg flex items-center justify-center text-white text-sm font-bold`}>
                                {getInitials(individual.firstname, individual.lastname)}
                              </div>
                              <span className="text-slate-300 text-sm">{individual.firstname} {individual.lastname}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-24 bg-slate-700 rounded-full h-2">
                                <div 
                                  className={`h-full rounded-full ${
                                    (individual.compliance_score || 0) >= 90 ? 'bg-gradient-to-r from-green-600 to-emerald-500' :
                                    (individual.compliance_score || 0) >= 70 ? 'bg-gradient-to-r from-yellow-600 to-orange-500' :
                                    'bg-gradient-to-r from-red-600 to-pink-500'
                                  }`}
                                  style={{width: `${individual.compliance_score || 0}%`}}
                                ></div>
                              </div>
                              <span className="text-white text-sm font-semibold w-12 text-right">{(individual.compliance_score || 0)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-white mb-4">Compliance Categories</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Excellent (90-100%)</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-slate-700 rounded-full h-2">
                              <div className="h-full bg-gradient-to-r from-green-600 to-emerald-500 rounded-full"
                                style={{width: `${(analyticsData.filteredIndividuals.filter(ind => (ind.compliance_score || 0) >= 90).length / analyticsData.totalIndividuals) * 100}%`}}
                              ></div>
                            </div>
                            <span className="text-white font-semibold w-12 text-right">
                              {analyticsData.filteredIndividuals.filter(ind => (ind.compliance_score || 0) >= 90).length}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Good (70-89%)</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-slate-700 rounded-full h-2">
                              <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"
                                style={{width: `${(analyticsData.filteredIndividuals.filter(ind => (ind.compliance_score || 0) >= 70 && (ind.compliance_score || 0) < 90).length / analyticsData.totalIndividuals) * 100}%`}}
                              ></div>
                            </div>
                            <span className="text-white font-semibold w-12 text-right">
                              {analyticsData.filteredIndividuals.filter(ind => (ind.compliance_score || 0) >= 70 && (ind.compliance_score || 0) < 90).length}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Needs Attention (50-69%)</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-slate-700 rounded-full h-2">
                              <div className="h-full bg-gradient-to-r from-yellow-600 to-orange-500 rounded-full"
                                style={{width: `${(analyticsData.filteredIndividuals.filter(ind => (ind.compliance_score || 0) >= 50 && (ind.compliance_score || 0) < 70).length / analyticsData.totalIndividuals) * 100}%`}}
                              ></div>
                            </div>
                            <span className="text-white font-semibold w-12 text-right">
                              {analyticsData.filteredIndividuals.filter(ind => (ind.compliance_score || 0) >= 50 && (ind.compliance_score || 0) < 70).length}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Critical (Below 50%)</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-slate-700 rounded-full h-2">
                              <div className="h-full bg-gradient-to-r from-red-600 to-pink-500 rounded-full"
                                style={{width: `${(analyticsData.filteredIndividuals.filter(ind => (ind.compliance_score || 0) < 50).length / analyticsData.totalIndividuals) * 100}%`}}
                              ></div>
                            </div>
                            <span className="text-white font-semibold w-12 text-right">
                              {analyticsData.filteredIndividuals.filter(ind => (ind.compliance_score || 0) < 50).length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Add more metric sections as needed */}
              
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;