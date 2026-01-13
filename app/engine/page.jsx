'use client';
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Brain, Zap, Sparkles, Target, 
  Users, Clock, Calendar, Filter, ChevronRight, ChevronDown,
  CheckCircle, AlertCircle, X, Download, Upload, BarChart3,
  Activity, Shield, Home, MapPin, DollarSign, Target as TargetIcon,
  AlertTriangle, RefreshCw, Eye, EyeOff, PieChart, LineChart,
  ThumbsUp, ThumbsDown, Trophy, Award, Star, TrendingUp as TrendingUpIcon,Pill, CreditCard,
  ArrowUpRight, ArrowDownRight, Percent, Calculator, UserPlus,
  LogOut, Settings, Menu, Bell, Search, Plus, Loader2,
  MessageSquare, HelpCircle, Info, ExternalLink, Link,
  GitBranch, GitPullRequest, GitCommit, GitMerge, GitCompare,
  NetworkIcon
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

const ForesightPage = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { userProfile, loading: profileLoading, hasPermission, hasAnyPermission } = useUserProfile();
  
  const [loading, setLoading] = useState(true);
  const [individualsData, setIndividualsData] = useState([]);
  const [dailyNotesData, setDailyNotesData] = useState([]);
  const [incidentsData, setIncidentsData] = useState([]);
  
  const [predictions, setPredictions] = useState([]);
  const [forecastMarkets, setForecastMarkets] = useState([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [timeFilter, setTimeFilter] = useState('quarterly');
  const [divisionFilter, setDivisionFilter] = useState('all');

  // Permission check - Only executives and managers
  const canAccessForesight = hasAnyPermission([
    PERMISSIONS.FULL_ACCESS,
    PERMISSIONS.SYSTEM_ADMIN,
    PERMISSIONS.STRATEGIC_PLANNING,
    PERMISSIONS.ADMIN,
    'QDDP',
    'ExecDirector',
    'ExecPresident',
    'HouseManager_DD',
    'SUD_Director',
    'MI_Supervisor'
  ]);

  useEffect(() => {
    if (isLoaded && user && !profileLoading && userProfile) {
      if (canAccessForesight) {
        fetchAllData();
      } else {
        setLoading(false);
      }
    }
  }, [isLoaded, user, profileLoading, userProfile]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch individuals data
      const { data: individuals, error: indError } = await supabase
        .from('individuals')
        .select('*')
        .eq('status', 'Active');

      if (indError) throw indError;
      setIndividualsData(individuals || []);

      // 2. Fetch daily notes (if table exists) for engagement analysis
      try {
        const { data: dailyNotes, error: notesError } = await supabase
          .from('daily_notes')
          .select('*')
          .limit(100)
          .order('created_at', { ascending: false });

        if (!notesError) {
          setDailyNotesData(dailyNotes || []);
        }
      } catch (e) {
        console.log('Daily notes table might not exist');
      }

      // 3. Fetch incidents (if table exists) for risk analysis
      try {
        const { data: incidents, error: incidentsError } = await supabase
          .from('incidents')
          .select('*')
          .limit(100)
          .order('created_at', { ascending: false });

        if (!incidentsError) {
          setIncidentsData(incidents || []);
        }
      } catch (e) {
        console.log('Incidents table might not exist');
      }

      // 4. Generate predictions based on real data
      generatePredictionsFromData(individuals || [], dailyNotesData || [], incidentsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate predictions from existing data
  const generatePredictionsFromData = (individuals, dailyNotes, incidents) => {
    if (!individuals || individuals.length === 0) return;

    // Calculate real metrics from data
    const totalIndividuals = individuals.length;
    
    // Calculate average compliance from individuals
    const avgCompliance = individuals.reduce((acc, ind) => acc + (ind.compliance_score || 80), 0) / totalIndividuals;
    
    // Group by location
    const locations = {};
    individuals.forEach(ind => {
      const location = ind.homeassignment || ind.location || 'Unknown';
      if (!locations[location]) locations[location] = [];
      locations[location].push(ind);
    });

    // Calculate engagement (simplified - based on last activity)
    const recentIndividuals = individuals.filter(ind => {
      const lastActivity = new Date(ind.last_activity || ind.created_at);
      const daysSince = (new Date() - lastActivity) / (1000 * 60 * 60 * 24);
      return daysSince < 30;
    });
    const engagementRate = (recentIndividuals.length / totalIndividuals) * 100;

    // Calculate incidents per individual
    const incidentsPerIndividual = incidents.length / Math.max(totalIndividuals, 1);
    const riskScore = Math.min(incidentsPerIndividual * 20, 100); // Scale to 100

    // Calculate capacity pressure (simplified)
    const maxCapacity = totalIndividuals * 1.2; // Assume 20% buffer
    const capacityUtilization = (totalIndividuals / maxCapacity) * 100;

    // Generate predictions based on real metrics
    const generatedPredictions = [
      {
        id: 'pred-1',
        prediction_type: 'engagement',
        time_period: 'quarterly',
        forecast_date: new Date().toISOString(),
        period_start: new Date().toISOString(),
        period_end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        division: userProfile?.division || 'DD',
        program: 'All Programs',
        region: 'All Regions',
        base_probability: engagementRate > 80 ? 0.75 : engagementRate > 60 ? 0.65 : 0.45,
        market_probability: engagementRate > 80 ? 0.70 : engagementRate > 60 ? 0.60 : 0.50,
        final_probability: engagementRate > 80 ? 0.72 : engagementRate > 60 ? 0.63 : 0.47,
        confidence_band_low: Math.max(0, engagementRate/100 - 0.1),
        confidence_band_high: Math.min(1, engagementRate/100 + 0.1),
        drivers: {
          factors: [
            `High compliance (${Math.round(avgCompliance)}%)`,
            `${totalIndividuals} active individuals`,
            `${recentIndividuals.length} recently active`
          ],
          warning_signs: incidents.length > 0 ? [
            `${incidents.length} recent incidents`,
            incidentsPerIndividual > 0.5 ? 'High incident rate' : null
          ].filter(Boolean) : ['No recent incidents']
        },
        status: 'active'
      },
      {
        id: 'pred-2',
        prediction_type: 'capacity',
        time_period: 'quarterly',
        forecast_date: new Date().toISOString(),
        period_start: new Date().toISOString(),
        period_end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        division: userProfile?.division || 'DD',
        program: 'Residential',
        region: 'Main Region',
        base_probability: capacityUtilization > 90 ? 0.85 : capacityUtilization > 80 ? 0.75 : 0.60,
        market_probability: capacityUtilization > 90 ? 0.80 : capacityUtilization > 80 ? 0.70 : 0.65,
        final_probability: capacityUtilization > 90 ? 0.82 : capacityUtilization > 80 ? 0.72 : 0.62,
        confidence_band_low: Math.max(0, capacityUtilization/100 - 0.1),
        confidence_band_high: Math.min(1, capacityUtilization/100 + 0.1),
        drivers: {
          factors: [
            `${totalIndividuals} current individuals`,
            `Utilization at ${Math.round(capacityUtilization)}%`,
            `${Object.keys(locations).length} locations active`
          ],
          warning_signs: capacityUtilization > 80 ? [
            'High utilization rate',
            capacityUtilization > 90 ? 'Near capacity limit' : null
          ].filter(Boolean) : ['Good capacity margin']
        },
        status: 'active'
      },
      {
        id: 'pred-3',
        prediction_type: 'workforce',
        time_period: 'quarterly',
        forecast_date: new Date().toISOString(),
        period_start: new Date().toISOString(),
        period_end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        division: userProfile?.division || 'DD',
        program: 'All Programs',
        region: 'All Regions',
        base_probability: riskScore > 60 ? 0.65 : riskScore > 40 ? 0.55 : 0.35,
        market_probability: riskScore > 60 ? 0.60 : riskScore > 40 ? 0.50 : 0.40,
        final_probability: riskScore > 60 ? 0.62 : riskScore > 40 ? 0.52 : 0.37,
        confidence_band_low: Math.max(0, riskScore/100 - 0.15),
        confidence_band_high: Math.min(1, riskScore/100 + 0.15),
        drivers: {
          factors: [
            `Risk score: ${Math.round(riskScore)}%`,
            `Avg compliance: ${Math.round(avgCompliance)}%`,
            'Stable staff patterns'
          ],
          warning_signs: incidents.length > 0 ? [
            `${incidents.length} incidents in system`,
            riskScore > 50 ? 'Elevated risk level' : null
          ].filter(Boolean) : ['Low incident rate']
        },
        status: 'active'
      },
      {
        id: 'pred-4',
        prediction_type: 'operations',
        time_period: 'monthly',
        forecast_date: new Date().toISOString(),
        period_start: new Date().toISOString(),
        period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        division: userProfile?.division || 'DD',
        program: 'Documentation',
        region: 'All Regions',
        base_probability: avgCompliance > 90 ? 0.88 : avgCompliance > 80 ? 0.75 : 0.60,
        market_probability: avgCompliance > 90 ? 0.85 : avgCompliance > 80 ? 0.72 : 0.65,
        final_probability: avgCompliance > 90 ? 0.86 : avgCompliance > 80 ? 0.73 : 0.62,
        confidence_band_low: Math.max(0, avgCompliance/100 - 0.08),
        confidence_band_high: Math.min(1, avgCompliance/100 + 0.08),
        drivers: {
          factors: [
            `Current compliance: ${Math.round(avgCompliance)}%`,
            `${totalIndividuals} active records`,
            'Regular documentation'
          ],
          warning_signs: avgCompliance < 85 ? [
            'Compliance below target',
            avgCompliance < 80 ? 'Needs immediate attention' : null
          ].filter(Boolean) : ['Compliance on track']
        },
        status: 'active'
      }
    ];

    setPredictions(generatedPredictions);

    // Generate sample forecast markets
    const generatedMarkets = [
      {
        id: 'market-1',
        question_text: 'Will overall engagement exceed 85% next quarter?',
        close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        ml_probability: 0.72,
        market_probability: 0.68,
        final_probability: 0.70,
        status: 'open'
      },
      {
        id: 'market-2',
        question_text: 'Will we need to add staff in Northern Region within 6 months?',
        close_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        ml_probability: 0.65,
        market_probability: 0.60,
        final_probability: 0.62,
        status: 'open'
      },
      {
        id: 'market-3',
        question_text: 'Will compliance scores average above 90% this month?',
        close_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        ml_probability: 0.85,
        market_probability: 0.80,
        final_probability: 0.82,
        status: 'open'
      }
    ];

    setForecastMarkets(generatedMarkets);
  };
const [currentPage, setCurrentPage] = useState('engine');
    const [sidebarOpen, setSidebarOpen] = useState(true);
   // Sidebar Compon
  // Calculate metrics from data
  const calculateMetrics = () => {
    if (!individualsData || individualsData.length === 0) {
      return {
        totalIndividuals: 0,
        avgCompliance: 0,
        engagementScore: 0,
        capacityUtilization: 0,
        riskScore: 0,
        activeLocations: 0
      };
    }

    const total = individualsData.length;
    
    // Average compliance
    const avgCompliance = individualsData.reduce((acc, ind) => acc + (ind.compliance_score || 80), 0) / total;
    
    // Engagement (based on last activity)
    const recentActive = individualsData.filter(ind => {
      const lastActivity = new Date(ind.last_activity || ind.created_at);
      const daysSince = (new Date() - lastActivity) / (1000 * 60 * 60 * 24);
      return daysSince < 30;
    }).length;
    
    const engagementScore = (recentActive / total) * 100;

    // Capacity (simplified calculation)
    const maxCapacity = total * 1.2; // 20% buffer
    const capacityUtilization = (total / maxCapacity) * 100;

    // Risk score (based on incidents)
    const incidentsCount = incidentsData.length;
    const riskScore = Math.min((incidentsCount / Math.max(total, 1)) * 100, 100);

    // Count unique locations
    const locations = new Set();
    individualsData.forEach(ind => {
      if (ind.homeassignment) locations.add(ind.homeassignment);
      if (ind.location) locations.add(ind.location);
    });

    return {
      totalIndividuals: total,
      avgCompliance: Math.round(avgCompliance),
      engagementScore: Math.round(engagementScore),
      capacityUtilization: Math.round(capacityUtilization),
      riskScore: Math.round(riskScore),
      activeLocations: locations.size
    };
  };

  const metrics = calculateMetrics();

  // NavBar Component
  const NavBar = () => (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-900/20 backdrop-blur-xl border-b border-slate-800/50 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-2xl">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50 animate-pulse">
              <Brain className="text-white" size={26} />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
              CareBridge Foresight Engine
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">Predictive Intelligence Dashboard</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm rounded-2xl px-5 py-2.5 w-96 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300">
          <Search size={18} className="text-emerald-400" />
          <input 
            type="text" 
            placeholder="Search predictions..." 
            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-500"
          />
          <kbd className="px-2 py-0.5 text-xs bg-slate-700 rounded text-slate-400 font-mono">⌘F</kbd>
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
              {userProfile?.role_name || 'Staff'} • Foresight Access
            </p>
          </div>
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/50">
              {userProfile?.fullname?.charAt(0) || 'U'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
          </div>
          <ChevronDown size={16} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
        </div>
      </div>
    </div>
  );

  // Permission Check
  if (!profileLoading && !canAccessForesight) {
    return (
      <div className="h-screen flex flex-col bg-slate-950 text-white">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Foresight Engine Access Restricted</h2>
            <p className="text-slate-400 mb-6">
              You do not have permission to access the Foresight Engine. This feature is available only to leadership roles.
            </p>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <p className="text-sm text-slate-400">Your Current Role:</p>
              <p className="text-lg font-bold text-emerald-400 mt-1">{userProfile?.role_name}</p>
              <p className="text-sm text-slate-500 mt-2">Division: {userProfile?.division}</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300"
            >
              Return to Dashboard
            </button>
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
          <p className="text-slate-400 text-lg">Loading Foresight Engine...</p>
          <p className="text-slate-500 text-sm mt-2">Analyzing {individualsData.length} individuals for predictions</p>
        </div>
      </div>
    );
  }

  // Probability Indicator Component
  const ProbabilityIndicator = ({ probability, showLabel = true }) => {
    let color = 'bg-emerald-500';
    let textColor = 'text-emerald-400';
    
    if (probability < 0.3) {
      color = 'bg-red-500';
      textColor = 'text-red-400';
    } else if (probability < 0.5) {
      color = 'bg-amber-500';
      textColor = 'text-amber-400';
    } else if (probability < 0.7) {
      color = 'bg-yellow-500';
      textColor = 'text-yellow-400';
    }

    return (
      <div className="flex items-center gap-2">
        <div className="w-24 bg-slate-800 rounded-full h-2">
          <div 
            className={`h-full rounded-full ${color}`}
            style={{ width: `${probability * 100}%` }}
          />
        </div>
        <span className={`font-bold ${textColor}`}>
          {Math.round(probability * 100)}%
        </span>
        {showLabel && (
          <span className="text-xs text-slate-500">
            {probability < 0.3 ? 'Very Low' : 
             probability < 0.5 ? 'Low' : 
             probability < 0.7 ? 'Medium' : 'High'}
          </span>
        )}
      </div>
    );
  };

  // Prediction Card Component
  const PredictionCard = ({ prediction }) => {
    const getPredictionIcon = (type) => {
      switch(type) {
        case 'engagement': return <Users className="text-emerald-400" size={20} />;
        case 'capacity': return <Home className="text-blue-400" size={20} />;
        case 'workforce': return <UserPlus className="text-amber-400" size={20} />;
        case 'waitlist': return <Clock className="text-purple-400" size={20} />;
        case 'operations': return <Activity className="text-slate-400" size={20} />;
        default: return <Activity className="text-slate-400" size={20} />;
      }
    };

    const getPredictionTitle = (type) => {
      switch(type) {
        case 'engagement': return 'Engagement Forecast';
        case 'capacity': return 'Capacity & Demand';
        case 'workforce': return 'Workforce Stability';
        case 'waitlist': return 'Waitlist Growth';
        case 'operations': return 'Operations Performance';
        default: return 'Prediction';
      }
    };

    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 hover:scale-[1.02] group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
              {getPredictionIcon(prediction.prediction_type)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{getPredictionTitle(prediction.prediction_type)}</h3>
              <p className="text-slate-400 text-sm">
                {prediction.program} • {prediction.region} • {prediction.time_period}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Probability</span>
            <div className="px-2 py-1 bg-slate-800 rounded-lg">
              <span className="text-emerald-400 font-bold">{Math.round(prediction.final_probability * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <ProbabilityIndicator probability={prediction.final_probability} showLabel={false} />
            <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
              <span>ML: {Math.round(prediction.base_probability * 100)}%</span>
              <span>Market: {Math.round(prediction.market_probability * 100)}%</span>
              <span>Blended: {Math.round(prediction.final_probability * 100)}%</span>
            </div>
          </div>

          {prediction.drivers && (
            <div>
              <p className="text-sm text-slate-400 mb-2">Key Drivers:</p>
              <div className="space-y-2">
                {prediction.drivers.factors?.slice(0, 3).map((factor, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400" />
                    <span className="text-sm text-slate-300">{factor}</span>
                  </div>
                ))}
                {prediction.drivers.warning_signs?.slice(0, 2).map((warning, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <AlertCircle size={14} className="text-amber-400" />
                    <span className="text-sm text-slate-300">{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-700/50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Forecast period
              </span>
              <button 
                onClick={() => console.log('View details', prediction.id)}
                className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                View Details
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Market Card Component
  const MarketCard = ({ market }) => (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">{market.question_text}</h3>
          <p className="text-slate-400 text-sm">
            Closes: {new Date(market.close_date).toLocaleDateString()}
          </p>
        </div>
        <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
          <span className="text-blue-400 text-xs font-bold">Market</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Current Probability</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">ML: {Math.round((market.ml_probability || 0.5) * 100)}%</span>
              <span className="text-xs text-slate-500">Market: {Math.round((market.market_probability || 0.5) * 100)}%</span>
            </div>
          </div>
          <ProbabilityIndicator probability={market.final_probability || 0.5} showLabel={false} />
        </div>

        <div className="pt-4 border-t border-slate-700/50">
          <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-bold hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300">
            Place Your Bet (100 credits)
          </button>
          <p className="text-xs text-slate-500 text-center mt-2">
            Market closes in {Math.ceil((new Date(market.close_date) - new Date()) / (1000 * 60 * 60 * 24))} days
          </p>
        </div>
      </div>
    </div>
  );

  // Tabs component
  const Tabs = () => (
    <div className="flex border-b border-slate-700/50 mb-6">
      {['overview', 'predictions', 'analytics'].map((tab) => (
        <button
          key={tab}
          onClick={() => setSelectedTab(tab)}
          className={`px-6 py-3 font-semibold transition-all duration-300 border-b-2 ${
            selectedTab === tab
              ? 'text-emerald-400 border-emerald-500'
              : 'text-slate-400 hover:text-white border-transparent'
          }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  );

  const menuItems = [
     { id: 'individual', icon: Users, label: 'Individuals', badge: null },
     { id: 'medicine', icon: Pill, label: 'Medications', badge: null },
     { id: 'incident', icon: AlertTriangle, label: 'Incidents', badge: '3' },
     { id: 'privacy', icon: Shield, label: 'Data Privacy', badge: 'NEW' },
     { id: 'hcbs', icon: Shield, label: 'HCBS Compliance', badge: 'NEW' },
      {id: 'engine', icon: Pill, label: 'Foresight Engine', badge: 'NEW'},
     { id: 'intelligence', icon: NetworkIcon, label: 'User Foresight', badge: 'NEW' },
     { id: 'billing', icon: CreditCard, label: 'Billing', badge: null },
     { id: 'analytics', icon: TrendingUp, label: 'Analytics', badge: null }
   ];

 // const [sidebarOpen, setSidebarOpen] = useState(true);
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
            <span className="text-xs text-slate-400 font-medium">Billing Status</span>
            <span className="text-xs text-emerald-400 font-bold">Active</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-1000" 
              style={{width: '100%'}}></div>
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
                if (item.id !== 'billing') {
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
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-rose-500">
                      Foresight Engine
                    </h2>
                    <div className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full">
                      <span className="text-purple-400 text-xs font-bold flex items-center gap-1">
                        <Zap size={12} /> LIVE
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-lg">
                    Predictive intelligence based on {metrics.totalIndividuals} active individuals
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <select
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="weekly">Weekly View</option>
                    <option value="monthly">Monthly View</option>
                    <option value="quarterly">Quarterly View</option>
                  </select>
                  
                  <button 
                    onClick={() => fetchAllData()}
                    className="p-2 hover:bg-slate-800 rounded-xl transition-all"
                    title="Refresh predictions"
                  >
                    <RefreshCw size={20} className="text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <Tabs />

              {/* Overview Tab */}
              {selectedTab === 'overview' && (
                <>
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center">
                          <Brain className="text-white" size={26} />
                        </div>
                        <div className={`px-2 py-1 rounded-lg ${metrics.riskScore < 30 ? 'bg-emerald-500/20 text-emerald-400' : metrics.riskScore < 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                          {metrics.riskScore < 30 ? 'Low' : metrics.riskScore < 60 ? 'Medium' : 'High'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Overall Risk Score</p>
                        <p className="text-4xl font-black text-white">{metrics.riskScore}%</p>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div className={`h-full rounded-full ${metrics.riskScore < 30 ? 'bg-emerald-500' : metrics.riskScore < 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${metrics.riskScore}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center">
                          <Users className="text-white" size={26} />
                        </div>
                        <div className={`px-2 py-1 rounded-lg ${metrics.engagementScore > 80 ? 'bg-emerald-500/20 text-emerald-400' : metrics.engagementScore > 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                          {metrics.engagementScore > 80 ? 'Strong' : metrics.engagementScore > 60 ? 'Good' : 'Needs Attention'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Engagement Health</p>
                        <p className="text-4xl font-black text-white">{metrics.engagementScore}%</p>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                              className={`h-full rounded-full ${metrics.engagementScore > 80 ? 'bg-emerald-500' : metrics.engagementScore > 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${metrics.engagementScore}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-600 to-yellow-500 rounded-2xl flex items-center justify-center">
                          <Home className="text-white" size={26} />
                        </div>
                        <div className={`px-2 py-1 rounded-lg ${metrics.capacityUtilization > 90 ? 'bg-red-500/20 text-red-400' : metrics.capacityUtilization > 80 ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {metrics.capacityUtilization > 90 ? 'Full' : metrics.capacityUtilization > 80 ? 'High' : 'Good'}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Capacity Utilization</p>
                        <p className="text-4xl font-black text-white">{metrics.capacityUtilization}%</p>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                              className={`h-full rounded-full ${metrics.capacityUtilization > 90 ? 'bg-red-500' : metrics.capacityUtilization > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${metrics.capacityUtilization}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center">
                          <Target className="text-white" size={26} />
                        </div>
                        <div className="px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full">
                          <span className="text-purple-400 text-xs font-bold">Based on {metrics.totalIndividuals} individuals</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Active Individuals</p>
                        <p className="text-4xl font-black text-white">{metrics.totalIndividuals}</p>
                        <p className="text-xs text-slate-500">Across {metrics.activeLocations} locations</p>
                      </div>
                    </div>
                  </div>

                  {/* Top Predictions */}
                  {predictions.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-white">Top Predictions This Quarter</h3>
                        <button 
                          onClick={() => setSelectedTab('predictions')}
                          className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold flex items-center gap-1"
                        >
                          View All <ChevronRight size={16} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {predictions.slice(0, 4).map(prediction => (
                          <PredictionCard key={prediction.id} prediction={prediction} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
                      <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-slate-400 mb-2">No Predictions Yet</h3>
                      <p className="text-slate-500 mb-6">
                        Predictions are being generated based on your {metrics.totalIndividuals} active individuals.
                      </p>
                      <button 
                        onClick={() => fetchAllData()}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300"
                      >
                        Generate Predictions
                      </button>
                    </div>
                  )}

                 
                </>
              )}

              {/* Predictions Tab */}
              {selectedTab === 'predictions' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white">All Predictions</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-sm">
                        Based on {metrics.totalIndividuals} individuals, {incidentsData.length} incidents
                      </span>
                      <button 
                        onClick={() => fetchAllData()}
                        className="p-2 hover:bg-slate-800 rounded-xl transition-all"
                      >
                        <RefreshCw size={20} className="text-slate-400" />
                      </button>
                    </div>
                  </div>

                  {predictions.length === 0 ? (
                    <div className="text-center py-16 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
                      <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-slate-400 mb-2">No predictions generated yet</h3>
                      <p className="text-slate-500 mb-6">
                        Click the refresh button above to generate predictions from your data.
                      </p>
                      <button 
                        onClick={() => fetchAllData()}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300"
                      >
                        Generate Predictions Now
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {predictions.map(prediction => (
                        <PredictionCard key={prediction.id} prediction={prediction} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Markets Tab */}
              {selectedTab === 'markets' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white">Forecast Markets</h3>
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl">
                        <span className="text-white font-bold">{forecastMarkets.length} Active Markets</span>
                      </div>
                      <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-blue-500/50">
                        <Plus size={18} className="inline mr-2" />
                        New Market
                      </button>
                    </div>
                  </div>

                  {forecastMarkets.length === 0 ? (
                    <div className="text-center py-16 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl">
                      <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-slate-400 mb-2">No active markets</h3>
                      <p className="text-slate-500 mb-6">
                        Create your first forecast market to start collective intelligence predictions.
                      </p>
                      <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300">
                        <Plus size={18} className="inline mr-2" />
                        Create First Market
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {forecastMarkets.map(market => (
                        <MarketCard key={market.id} market={market} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Analytics Tab */}
              {selectedTab === 'analytics' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white">Prediction Analytics</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Data Summary */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                      <h4 className="text-lg font-bold text-white mb-4">Data Summary</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Active Individuals</span>
                          <span className="text-emerald-400 font-bold">{metrics.totalIndividuals}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Average Compliance</span>
                          <span className="text-emerald-400 font-bold">{metrics.avgCompliance}%</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Active Locations</span>
                          <span className="text-emerald-400 font-bold">{metrics.activeLocations}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Recent Incidents</span>
                          <span className="text-red-400 font-bold">{incidentsData.length}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Daily Notes</span>
                          <span className="text-blue-400 font-bold">{dailyNotesData.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Prediction Performance */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                      <h4 className="text-lg font-bold text-white mb-4">Prediction Performance</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Total Predictions</span>
                          <span className="text-emerald-400 font-bold">{predictions.length}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Active Markets</span>
                          <span className="text-blue-400 font-bold">{forecastMarkets.length}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Avg Prediction Confidence</span>
                          <span className="text-purple-400 font-bold">
                            {predictions.length > 0 
                              ? Math.round(predictions.reduce((acc, p) => acc + p.final_probability, 0) / predictions.length * 100)
                              : 0}%
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Data Freshness</span>
                          <span className="text-emerald-400 font-bold">Live</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Driver Analysis */}
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <h4 className="text-lg font-bold text-white mb-4">Key Prediction Drivers</h4>
                    <div className="space-y-3">
                      {[
                        { factor: 'Individual Compliance Score', impact: 'High', value: `${metrics.avgCompliance}%` },
                        { factor: 'Engagement Rate', impact: 'High', value: `${metrics.engagementScore}%` },
                        { factor: 'Capacity Utilization', impact: 'Medium', value: `${metrics.capacityUtilization}%` },
                        { factor: 'Incident Rate', impact: 'Medium', value: `${incidentsData.length} incidents` },
                        { factor: 'Active Locations', impact: 'Low', value: `${metrics.activeLocations} locations` },
                      ].map((driver, idx) => (
                        <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                          <span className="text-slate-300">{driver.factor}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400">{driver.value}</span>
                            <span className={`px-2 py-1 text-xs rounded ${
                              driver.impact === 'High' ? 'bg-emerald-500/20 text-emerald-400' :
                              driver.impact === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-slate-500/20 text-slate-400'
                            }`}>
                              {driver.impact}
                            </span>
                          </div>
                        </div>
                      ))}
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
};

export default ForesightPage;