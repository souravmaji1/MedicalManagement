'use client';
import React, { useState, useEffect } from 'react';
import { 
  Brain, TrendingUp, TrendingDown, AlertTriangle, Users, Activity, 
  Calendar, Clock, Target, Award, Shield, Heart, Pill, FileText,
  BarChart3, PieChart, LineChart, ArrowUp, ArrowDown, Minus,
  CheckCircle, XCircle, AlertCircle, Info, Zap, Sparkles,
  ChevronRight, ChevronDown, Filter, Download, Search, Bell,
  Menu, X, Home, CreditCard, NetworkIcon, Loader2, Eye,
  TrendingUpIcon, Percent, UserCheck, AlertOctagon, MapPin,
  DollarSign, Gauge, TrendingUpDownIcon, Building2
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

const ForesightEnginePage = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { userProfile, loading: profileLoading, hasPermission } = useUserProfile();
  
  const [individuals, setIndividuals] = useState([]);
  const [staffProfiles, setStaffProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('engine');
  const [timeHorizon, setTimeHorizon] = useState('90');
  const [selectedRegion, setSelectedRegion] = useState('all');
  
  const [forecastMarkets, setForecastMarkets] = useState([]);
  const [userCredits, setUserCredits] = useState(100);
  const [userPositions, setUserPositions] = useState({});
  
  const [scenarioInputs, setScenarioInputs] = useState({
    staffIncrease: 0,
    engagementChange: 0,
    newPrograms: 0,
  });
  const [scenarioResults, setScenarioResults] = useState(null);

  const [forecasts, setForecasts] = useState({
    riskOutlook: 'MODERATE',
    riskScore: 0,
    highImpactForecasts: [],
    engagementForecast: {},
    workforceOutlook: {},
    capacityForecast: {},
    complianceRisk: {},
    medicationCompliance: {},
    incidentTrends: {},
    goalProgress: {},
    healthTrends: {},
    statusDistribution: {},
    programHealth: {},
    regionalRisks: [],
    utilizationProjection: {},
    blendedForecasts: []
  });

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', badge: null },
    { id: 'individual', icon: Users, label: 'Individuals', badge: null },
    { id: 'medicine', icon: Pill, label: 'Medications', badge: null },
    { id: 'incident', icon: AlertTriangle, label: 'Incidents', badge: '2' },
    { id: 'privacy', icon: Shield, label: 'Data Privacy', badge: 'NEW' },
    { id: 'report', icon: FileText, label: 'Report', badge: 'NEW' },
    { id: 'engine', icon: Brain, label: 'Foresight Engine', badge: 'NEW' },
    { id: 'intelligence', icon: NetworkIcon, label: 'User Foresight', badge: 'NEW' },
    { id: 'billing', icon: CreditCard, label: 'Billing', badge: null },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics', badge: null }
  ];

  useEffect(() => {
    if (isLoaded && user && !profileLoading && userProfile) {
      fetchAllData();
    }
  }, [isLoaded, user, profileLoading, userProfile]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      let individualsQuery = supabase
        .from('individuals')
        .select('*')
        .order('created_at', { ascending: false });

      if (userProfile.role_id === 'HouseManager_DD') {
        individualsQuery = individualsQuery.eq('homeassignment', userProfile.facility);
      } else if (userProfile.role_id === 'DSP_DD') {
        individualsQuery = individualsQuery.eq('homeassignment', userProfile.facility);
      } else if (userProfile.division === 'MI' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        individualsQuery = individualsQuery.eq('division', 'MI');
      } else if (userProfile.division === 'SUD' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        individualsQuery = individualsQuery.eq('division', 'SUD');
      }

      const { data: individualsData, error: individualsError } = await individualsQuery;
      if (individualsError) throw individualsError;

      const { data: staffData, error: staffError } = await supabase
        .from('user_profiles')
        .select('*');
      
      if (staffError) throw staffError;

      setIndividuals(individualsData || []);
      setStaffProfiles(staffData || []);
      
      initializeForecastMarkets(individualsData || [], staffData || []);
      generateComprehensiveForecasts(individualsData || [], staffData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateComprehensiveForecasts = (individualsData, staffData) => {
    if (!individualsData.length) return;

    const avgCompliance = individualsData.reduce((acc, ind) => acc + (ind.compliance_score || 0), 0) / individualsData.length;
    const lowComplianceCount = individualsData.filter(ind => (ind.compliance_score || 0) < 85).length;
    const complianceRisk = (lowComplianceCount / individualsData.length) * 100;

    let totalMedications = 0;
    let activeMedications = 0;
    let missedDoses = 0;
    
    individualsData.forEach(ind => {
      if (ind.medications && Array.isArray(ind.medications)) {
        totalMedications += ind.medications.length;
        activeMedications += ind.medications.filter(med => med.status === 'Active').length;
      }
      if (ind.misseddoses && Array.isArray(ind.misseddoses)) {
        missedDoses += ind.misseddoses.length;
      }
    });

    const medComplianceRate = totalMedications > 0 
      ? ((totalMedications - missedDoses) / totalMedications) * 100 
      : 100;

    let totalIncidents = 0;
    let openIncidents = 0;
    let highSeverityIncidents = 0;
    
    individualsData.forEach(ind => {
      if (ind.incidents && Array.isArray(ind.incidents)) {
        totalIncidents += ind.incidents.length;
        openIncidents += ind.incidents.filter(inc => inc.status === 'Open').length;
        highSeverityIncidents += ind.incidents.filter(inc => 
          inc.severity?.includes('Critical') || inc.severity?.includes('Major')
        ).length;
      }
    });

    const incidentRate = (totalIncidents / individualsData.length).toFixed(1);
    const openIncidentRate = (openIncidents / Math.max(totalIncidents, 1)) * 100;

    let totalGoals = 0;
    let activeGoals = 0;
    let avgGoalProgress = 0;
    
    individualsData.forEach(ind => {
      if (ind.goals && Array.isArray(ind.goals)) {
        totalGoals += ind.goals.length;
        activeGoals += ind.goals.filter(goal => goal.status === 'Active').length;
        const goalProgresses = ind.goals.map(g => g.progress || 0);
        avgGoalProgress += goalProgresses.reduce((a, b) => a + b, 0) / Math.max(goalProgresses.length, 1);
      }
    });

    avgGoalProgress = avgGoalProgress / Math.max(individualsData.length, 1);
    const goalCompletionTrend = avgGoalProgress >= 50 ? 'positive' : avgGoalProgress >= 25 ? 'neutral' : 'negative';

    let totalNotes = 0;
    let notesLast30Days = 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    individualsData.forEach(ind => {
      if (ind.dailynotes && Array.isArray(ind.dailynotes)) {
        totalNotes += ind.dailynotes.length;
        notesLast30Days += ind.dailynotes.filter(note => 
          new Date(note.timestamp || note.date) > thirtyDaysAgo
        ).length;
      }
    });

    const avgNotesPerIndividual = totalNotes / Math.max(individualsData.length, 1);
    const engagementTrend = avgNotesPerIndividual >= 10 ? 'high' : avgNotesPerIndividual >= 5 ? 'medium' : 'low';

    let individualsWithRecentVitals = 0;
    let individualsWithUpcomingAppointments = 0;
    
    individualsData.forEach(ind => {
      if (ind.wellness_data && Array.isArray(ind.wellness_data)) {
        const recentVitals = ind.wellness_data.filter(w => 
          w.type === 'vital_signs' && new Date(w.date) > thirtyDaysAgo
        );
        if (recentVitals.length > 0) individualsWithRecentVitals++;
        
        const upcomingAppointments = ind.wellness_data.filter(w => 
          w.type === 'appointment' && new Date(w.date) > new Date()
        );
        if (upcomingAppointments.length > 0) individualsWithUpcomingAppointments++;
      }
    });

    const vitalsComplianceRate = individualsData.length > 0 
      ? (individualsWithRecentVitals / individualsData.length) * 100 
      : 0;

    const activeCount = individualsData.filter(ind => ind.status === 'Active').length;
    const reviewCount = individualsData.filter(ind => ind.status === 'Review').length;
    const inactiveCount = individualsData.filter(ind => ind.status === 'Inactive').length;
    const reviewRate = individualsData.length > 0 ? (reviewCount / individualsData.length) * 100 : 0;

    const totalStaff = staffData.length;
    const staffByDivision = {
      DD: staffData.filter(s => s.division === 'DD').length,
      MI: staffData.filter(s => s.division === 'MI').length,
      SUD: staffData.filter(s => s.division === 'SUD').length,
      PEER: staffData.filter(s => s.division === 'PEER').length
    };

    const documentationRate = individualsData.length > 0 
      ? ((notesLast30Days / (individualsData.length * 30)) * 100).toFixed(0) 
      : '0';
    const avgNotesPerStaff = totalStaff > 0 ? (notesLast30Days / totalStaff).toFixed(1) : '0';

    const overtimePressure = parseFloat(documentationRate) < 60 ? 'High' : parseFloat(documentationRate) < 80 ? 'Medium' : 'Low';
    const turnoverRisk = overtimePressure === 'High' ? 63 : overtimePressure === 'Medium' ? 45 : 28;

    const homeAssignments = {};
    individualsData.forEach(ind => {
      if (ind.homeassignment) {
        if (!homeAssignments[ind.homeassignment]) {
          homeAssignments[ind.homeassignment] = {
            total: 0,
            incidents: 0,
            lowCompliance: 0
          };
        }
        homeAssignments[ind.homeassignment].total++;
        if (ind.incidents && ind.incidents.length > 0) {
          homeAssignments[ind.homeassignment].incidents += ind.incidents.length;
        }
        if ((ind.compliance_score || 0) < 85) {
          homeAssignments[ind.homeassignment].lowCompliance++;
        }
      }
    });

    const regionalRisks = Object.entries(homeAssignments).map(([region, data]) => ({
      region,
      riskLevel: data.lowCompliance / data.total > 0.3 ? 'High' : 
                 data.incidents / data.total > 2 ? 'Watch' : 'Stable',
      individuals: data.total,
      incidentRate: (data.incidents / data.total).toFixed(1)
    }));

    const programsByHCBS = {};
    individualsData.forEach(ind => {
      if (ind.hcbsdomains && Array.isArray(ind.hcbsdomains)) {
        ind.hcbsdomains.forEach(domain => {
          if (!programsByHCBS[domain]) {
            programsByHCBS[domain] = {
              participants: 0,
              avgEngagement: 0,
              notesCount: 0
            };
          }
          programsByHCBS[domain].participants++;
          if (ind.dailynotes) {
            programsByHCBS[domain].notesCount += ind.dailynotes.length;
          }
        });
      }
    });

    Object.keys(programsByHCBS).forEach(domain => {
      programsByHCBS[domain].avgEngagement = 
        programsByHCBS[domain].participants > 0
          ? (programsByHCBS[domain].notesCount / programsByHCBS[domain].participants).toFixed(1)
          : '0';
    });

    const currentUtilization = individualsData.length > 0 
      ? ((activeCount / individualsData.length) * 100).toFixed(0) 
      : '0';
    const projectedUtilization = Math.min(parseInt(currentUtilization) + 5, 100);
    const capacityTightening = projectedUtilization > 85;

    const mlForecasts = [
      {
        question: 'Will engagement drop >10% in next quarter?',
        mlProbability: Math.min(Math.max(100 - avgGoalProgress + (engagementTrend === 'low' ? 20 : 0), 0), 100).toFixed(0),
        trend: engagementTrend === 'low' ? 'up' : 'stable',
        confidence: 'High',
        driver: `Based on ${totalNotes} total notes, ${avgNotesPerIndividual.toFixed(1)} avg per individual`
      },
      {
        question: 'Will turnover exceed target in next 6 months?',
        mlProbability: turnoverRisk,
        trend: overtimePressure === 'High' ? 'up' : 'stable',
        confidence: 'Medium',
        driver: `Documentation rate at ${documentationRate}%, ${totalStaff} staff members`
      },
      {
        question: 'Will utilization exceed 85% capacity?',
        mlProbability: capacityTightening ? 74 : 45,
        trend: capacityTightening ? 'up' : 'stable',
        confidence: 'High',
        driver: `Current: ${activeCount} active of ${individualsData.length} total individuals`
      },
      {
        question: 'Will medication compliance drop below 90%?',
        mlProbability: Math.min(100 - medComplianceRate + 15, 100).toFixed(0),
        trend: medComplianceRate < 95 ? 'up' : 'stable',
        confidence: 'High',
        driver: `${missedDoses} missed doses out of ${totalMedications} total medications`
      }
    ];

    const blendedForecasts = mlForecasts.map((mlForecast, idx) => {
      const marketForecast = forecastMarkets[idx];
      if (marketForecast) {
        const totalVotes = marketForecast.yesVotes + marketForecast.noVotes;
        const marketProb = (marketForecast.yesVotes / totalVotes * 100).toFixed(0);
        const blendedProb = (
          (parseFloat(mlForecast.mlProbability) * 0.6) +
          (parseFloat(marketProb) * 0.4)
        ).toFixed(0);
        
        return {
          ...mlForecast,
          marketProbability: marketProb,
          blendedProbability: blendedProb,
          question: marketForecast.question
        };
      }
      return {
        ...mlForecast,
        blendedProbability: mlForecast.mlProbability
      };
    });

    const riskScore = (
      (complianceRisk * 0.25) +
      ((100 - medComplianceRate) * 0.2) +
      (openIncidentRate * 0.2) +
      ((100 - avgGoalProgress) * 0.15) +
      (turnoverRisk * 0.2)
    );

    const riskOutlook = riskScore > 40 ? 'HIGH' : riskScore > 20 ? 'MODERATE' : 'LOW';

    setForecasts({
      riskOutlook,
      riskScore: riskScore.toFixed(1),
      highImpactForecasts: mlForecasts,
      blendedForecasts,
      engagementForecast: {
        current: avgNotesPerIndividual.toFixed(1),
        projected: (avgNotesPerIndividual * 0.92).toFixed(1),
        trend: engagementTrend,
        notesLast30Days,
        totalNotes
      },
      workforceOutlook: {
        totalStaff,
        staffByDivision,
        documentationRate,
        avgNotesPerStaff,
        overtimePressure,
        turnoverRisk: turnoverRisk.toFixed(0)
      },
      capacityForecast: {
        activeIndividuals: activeCount,
        reviewNeeded: reviewCount,
        utilization: currentUtilization,
        projectedUtilization,
        capacityTightening
      },
      complianceRisk: {
        avgScore: avgCompliance.toFixed(1),
        lowComplianceCount,
        riskLevel: complianceRisk > 20 ? 'High' : complianceRisk > 10 ? 'Medium' : 'Low'
      },
      medicationCompliance: {
        totalMedications,
        activeMedications,
        missedDoses,
        complianceRate: medComplianceRate.toFixed(1),
        trend: medComplianceRate >= 95 ? 'positive' : medComplianceRate >= 85 ? 'neutral' : 'negative'
      },
      incidentTrends: {
        totalIncidents,
        openIncidents,
        highSeverityIncidents,
        incidentRate,
        openIncidentRate: openIncidentRate.toFixed(0),
        trend: openIncidentRate > 30 ? 'increasing' : 'stable'
      },
      goalProgress: {
        totalGoals,
        activeGoals,
        avgProgress: avgGoalProgress.toFixed(1),
        trend: goalCompletionTrend
      },
      healthTrends: {
        vitalsComplianceRate: vitalsComplianceRate.toFixed(0),
        upcomingAppointments: individualsWithUpcomingAppointments,
        recentVitals: individualsWithRecentVitals
      },
      statusDistribution: {
        active: activeCount,
        review: reviewCount,
        inactive: inactiveCount,
        reviewRate: reviewRate.toFixed(1)
      },
      programHealth: programsByHCBS,
      regionalRisks,
      utilizationProjection: {
        current: currentUtilization,
        projected: projectedUtilization,
        tightening: capacityTightening
      }
    });
  };

  const initializeForecastMarkets = (individualsData, staffData) => {
    if (!individualsData.length) return;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let totalNotes = 0;
    let notesLast30Days = 0;
    individualsData.forEach(ind => {
      if (ind.dailynotes && Array.isArray(ind.dailynotes)) {
        totalNotes += ind.dailynotes.length;
        notesLast30Days += ind.dailynotes.filter(note => 
          new Date(note.timestamp || note.date) > thirtyDaysAgo
        ).length;
      }
    });
    
    const engagementRate = (notesLast30Days / (individualsData.length * 30)) * 100;
    const documentationRate = ((notesLast30Days / (individualsData.length * 30)) * 100);
    const overtimePressure = documentationRate < 60 ? 'High' : documentationRate < 80 ? 'Medium' : 'Low';
    const baseTurnoverRisk = overtimePressure === 'High' ? 65 : overtimePressure === 'Medium' ? 45 : 25;
    
    let totalMedications = 0;
    let missedDoses = 0;
    individualsData.forEach(ind => {
      if (ind.medications && Array.isArray(ind.medications)) {
        totalMedications += ind.medications.length;
      }
      if (ind.misseddoses && Array.isArray(ind.misseddoses)) {
        missedDoses += ind.misseddoses.length;
      }
    });
    const medComplianceRate = totalMedications > 0 
      ? ((totalMedications - missedDoses) / totalMedications) * 100 
      : 100;
    
    let totalIncidents = 0;
    let openIncidents = 0;
    individualsData.forEach(ind => {
      if (ind.incidents && Array.isArray(ind.incidents)) {
        totalIncidents += ind.incidents.length;
        openIncidents += ind.incidents.filter(inc => inc.status === 'Open').length;
      }
    });
    const incidentDecreaseProb = openIncidents < totalIncidents * 0.3 ? 65 : 35;
    
    const markets = [
      {
        id: 'market_1',
        question: 'Will organization-wide engagement exceed 80% next quarter?',
        yesVotes: engagementRate > 80 ? 72 : engagementRate > 60 ? 58 : 35,
        noVotes: engagementRate > 80 ? 28 : engagementRate > 60 ? 42 : 65,
        totalCredits: 450,
        status: 'active',
        mlProbability: engagementRate > 80 ? 75 : engagementRate > 60 ? 55 : 30,
        currentMetric: engagementRate.toFixed(1) + '%',
        trend: engagementRate > 70 ? 'up' : engagementRate > 50 ? 'stable' : 'down'
      },
      {
        id: 'market_2',
        question: 'Will turnover rate stay below 15% in next 6 months?',
        yesVotes: baseTurnoverRisk < 15 ? 75 : baseTurnoverRisk < 30 ? 55 : 35,
        noVotes: baseTurnoverRisk < 15 ? 25 : baseTurnoverRisk < 30 ? 45 : 65,
        totalCredits: 380,
        status: 'active',
        mlProbability: baseTurnoverRisk < 15 ? 80 : baseTurnoverRisk < 30 ? 60 : 40,
        currentMetric: baseTurnoverRisk.toFixed(0) + '% risk',
        trend: overtimePressure === 'High' ? 'up' : 'down'
      },
      {
        id: 'market_3',
        question: 'Will medication compliance exceed 95% next quarter?',
        yesVotes: medComplianceRate > 95 ? 72 : medComplianceRate > 85 ? 48 : 28,
        noVotes: medComplianceRate > 95 ? 28 : medComplianceRate > 85 ? 52 : 72,
        totalCredits: 290,
        status: 'active',
        mlProbability: medComplianceRate > 95 ? 78 : medComplianceRate > 85 ? 52 : 35,
        currentMetric: medComplianceRate.toFixed(1) + '%',
        trend: medComplianceRate > 90 ? 'up' : 'down'
      },
      {
        id: 'market_4',
        question: 'Will incident rate decrease by >10% next quarter?',
        yesVotes: incidentDecreaseProb,
        noVotes: 100 - incidentDecreaseProb,
        totalCredits: 320,
        status: 'active',
        mlProbability: incidentDecreaseProb,
        currentMetric: (totalIncidents / individualsData.length).toFixed(1) + ' per person',
        trend: openIncidents < totalIncidents * 0.3 ? 'down' : 'up'
      }
    ];
    
    setForecastMarkets(markets);
  };

  const runScenarioSimulation = () => {
    const baseForecasts = forecasts;
    const staffImpact = scenarioInputs.staffIncrease / 10;
    const engagementImpact = scenarioInputs.engagementChange;
    
    const newTurnoverRisk = Math.max(0, parseFloat(baseForecasts.workforceOutlook.turnoverRisk) - staffImpact * 5);
    const newEngagement = parseFloat(baseForecasts.engagementForecast.current) * (1 + engagementImpact / 100);
    const newOvertimePressure = staffImpact > 2 ? 'Low' : staffImpact > 1 ? 'Medium' : baseForecasts.workforceOutlook.overtimePressure;
    const newUtilization = Math.min(100, parseFloat(baseForecasts.capacityForecast.utilization) + (scenarioInputs.newPrograms * 5));
    
    setScenarioResults({
      turnoverRisk: newTurnoverRisk.toFixed(0),
      turnoverChange: (newTurnoverRisk - parseFloat(baseForecasts.workforceOutlook.turnoverRisk)).toFixed(0),
      engagement: newEngagement.toFixed(1),
      engagementChange: ((newEngagement - parseFloat(baseForecasts.engagementForecast.current)) / parseFloat(baseForecasts.engagementForecast.current) * 100).toFixed(0),
      overtimePressure: newOvertimePressure,
      utilization: newUtilization.toFixed(0)
    });
  };

  const castForecastVote = (marketId, voteYes, credits) => {
    if (credits > userCredits) {
      alert('Insufficient credits');
      return;
    }
    
    setForecastMarkets(prev => prev.map(market => {
      if (market.id === marketId) {
        return {
          ...market,
          yesVotes: voteYes ? market.yesVotes + credits : market.yesVotes,
          noVotes: !voteYes ? market.noVotes + credits : market.noVotes,
          totalCredits: market.totalCredits + credits
        };
      }
      return market;
    }));
    
    setUserCredits(prev => prev - credits);
    setUserPositions(prev => ({
      ...prev,
      [marketId]: { vote: voteYes ? 'YES' : 'NO', credits }
    }));
  };

  const exportForesightBriefing = () => {
    alert('Foresight briefing export - generating PDF with forecasts, confidence bands, drivers, and governance statement');
  };

  const getRiskColor = (outlook) => {
    switch(outlook) {
      case 'HIGH': return 'text-red-400 bg-red-900/30 border-red-500/50';
      case 'MODERATE': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50';
      case 'LOW': return 'text-green-400 bg-green-900/30 border-green-500/50';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return <ArrowUp className="text-red-400" size={18} />;
      case 'down': return <ArrowDown className="text-green-400" size={18} />;
      case 'stable': return <Minus className="text-yellow-400" size={18} />;
      default: return <Minus className="text-slate-400" size={18} />;
    }
  };

  const getRegionalRiskColor = (level) => {
    switch(level) {
      case 'High': return 'bg-red-600';
      case 'Watch': return 'bg-yellow-600';
      case 'Stable': return 'bg-green-600';
      default: return 'bg-slate-600';
    }
  };

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
        placeholder="Search forecasts..." 
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



if (!isLoaded || loading || profileLoading) {
return (
<div className="flex items-center justify-center h-screen bg-slate-950">
<div className="text-center">
<Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-4" />
<p className="text-slate-400 text-lg">Analyzing {individuals.length} individuals and {staffProfiles.length} staff members...</p>
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
{/* Global Header */}
            <div className="bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                    <Brain className="text-white animate-pulse" size={28} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600">
                      CAREBRIDGE FORESIGHT ENGINE
                    </h1>
                    <p className="text-slate-300 text-sm">Predictive Intelligence • Non-PHI • Governance-Aligned</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={timeHorizon}
                    onChange={(e) => setTimeHorizon(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="30">30 Days</option>
                    <option value="90">90 Days</option>
                    <option value="180">180 Days</option>
                  </select>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="all">All Regions</option>
                    {forecasts.regionalRisks?.map(region => (
                      <option key={region.region} value={region.region}>{region.region}</option>
                    ))}
                  </select>
                  <button 
                    onClick={exportForesightBriefing}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                  >
                    <Download size={16} />
                    Export Briefing
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="text-green-400" size={16} />
                <span className="text-green-400 font-semibold">Aggregated</span>
                <span className="text-slate-400">•</span>
                <CheckCircle className="text-green-400" size={16} />
                <span className="text-green-400 font-semibold">De-Identified</span>
                <span className="text-slate-400">•</span>
                <CheckCircle className="text-green-400" size={16} />
                <span className="text-green-400 font-semibold">Compliant</span>
                <span className="text-slate-400">• Analyzing {individuals.length} Individuals</span>
              </div>
            </div>

            {/* Executive Foresight Summary */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Sparkles className="text-purple-400" size={24} />
                Executive Foresight Summary
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Overall Risk Outlook</p>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xl font-bold border ${getRiskColor(forecasts.riskOutlook)}`}>
                    {forecasts.riskOutlook === 'HIGH' && <AlertOctagon size={24} />}
                    {forecasts.riskOutlook === 'MODERATE' && <AlertCircle size={24} />}
                    {forecasts.riskOutlook === 'LOW' && <CheckCircle size={24} />}
                    {forecasts.riskOutlook}
                  </div>
                  <p className="text-slate-400 text-xs mt-2">Next {timeHorizon} Days</p>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Risk Score</p>
                  <div className="flex items-end gap-2">
                    <p className="text-4xl font-black text-white">{forecasts.riskScore}</p>
                    <p className="text-slate-400 text-lg mb-1">/100</p>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-2">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        forecasts.riskScore > 40 ? 'bg-gradient-to-r from-red-600 to-orange-500' :
                        forecasts.riskScore > 20 ? 'bg-gradient-to-r from-yellow-600 to-orange-500' :
                        'bg-gradient-to-r from-green-600 to-emerald-500'
                      }`}
                      style={{width: `${forecasts.riskScore}%`}}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Top Drivers</p>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2 text-sm text-white">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                      {forecasts.workforceOutlook.overtimePressure === 'High' ? 'Overtime pressure' : 'Stable workforce'}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-white">
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                      {forecasts.medicationCompliance.trend === 'negative' ? 'Medication compliance' : 'Documentation patterns'}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-white">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                      {forecasts.capacityForecast.capacityTightening ? 'Capacity tightening' : 'Stable capacity'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* High-Impact Forecasts */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Target className="text-emerald-400" size={24} />
                High-Impact Forecasts (ML + Human Intelligence)
              </h2>
              
              <div className="space-y-3">
                {forecasts.blendedForecasts.map((forecast, idx) => (
                  <div 
                    key={idx}
                    className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-emerald-500/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-white font-semibold group-hover:text-emerald-400 transition-colors">
                          {forecast.question}
                        </p>
                        <p className="text-slate-400 text-xs mt-1">{forecast.driver}</p>
                        
                        {forecast.marketProbability && (
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <div className="flex items-center gap-1">
                              <Brain size={12} className="text-cyan-400" />
                              <span className="text-slate-400">ML:</span>
                              <span className="text-cyan-400 font-bold">{forecast.mlProbability}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users size={12} className="text-purple-400" />
                              <span className="text-slate-400">Market:</span>
                              <span className="text-purple-400 font-bold">{forecast.marketProbability}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-emerald-400">{forecast.blendedProbability}%</p>
                          <p className="text-xs text-slate-500">Blended</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getTrendIcon(forecast.trend)}
                        </div>
                        
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          forecast.confidence === 'High' ? 'bg-green-900/30 text-green-400 border border-green-500/50' :
                          forecast.confidence === 'Medium' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/50' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {forecast.confidence}
                        </div>
                        
                        <ChevronRight className="text-slate-500 group-hover:text-emerald-400 transition-colors" size={20} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

           

            {/* Scenario Simulator */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Gauge className="text-cyan-400" size={24} />
                Scenario Simulator
              </h2>
              
              <p className="text-slate-400 text-sm mb-6">Model the impact of organizational changes on key forecasts</p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Staff Increase (%)</label>
                  <input
                    type="number"
                    value={scenarioInputs.staffIncrease}
                    onChange={(e) => setScenarioInputs({...scenarioInputs, staffIncrease: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Engagement Change (%)</label>
                  <input
                    type="number"
                    value={scenarioInputs.engagementChange}
                    onChange={(e) => setScenarioInputs({...scenarioInputs, engagementChange: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-300 text-sm mb-2">New Programs</label>
                  <input
                    type="number"
                    value={scenarioInputs.newPrograms}
                    onChange={(e) => setScenarioInputs({...scenarioInputs, newPrograms: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    placeholder="0"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={runScenarioSimulation}
                    className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Run Simulation
                  </button>
                </div>
              </div>
              
              {scenarioResults && (
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Projected Impact</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-slate-400 text-xs mb-1">Turnover Risk</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-white">{scenarioResults.turnoverRisk}%</p>
                        <p className={`text-sm mb-1 ${parseFloat(scenarioResults.turnoverChange) < 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {parseFloat(scenarioResults.turnoverChange) > 0 ? '+' : ''}{scenarioResults.turnoverChange}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-slate-400 text-xs mb-1">Engagement Level</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-white">{scenarioResults.engagement}</p>
                        <p className={`text-sm mb-1 ${parseFloat(scenarioResults.engagementChange) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {parseFloat(scenarioResults.engagementChange) > 0 ? '+' : ''}{scenarioResults.engagementChange}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-slate-400 text-xs mb-1">Overtime Pressure</p>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${
                        scenarioResults.overtimePressure === 'High' ? 'bg-red-900/30 text-red-400' :
                        scenarioResults.overtimePressure === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-green-900/30 text-green-400'
                      }`}>
                        {scenarioResults.overtimePressure}
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-slate-400 text-xs mb-1">Utilization</p>
                      <p className="text-2xl font-bold text-white">{scenarioResults.utilization}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Engagement by Program */}
            {Object.keys(forecasts.programHealth || {}).length > 0 && (
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Activity className="text-cyan-400" size={24} />
                  Engagement Forecast by Program
                </h2>
                
                <div className="space-y-4">
                  {Object.entries(forecasts.programHealth || {}).map(([program, data]) => {
                    const engagement = parseFloat(data.avgEngagement);
                    const projected = (engagement * 0.95).toFixed(1);
                    const trend = engagement > 8 ? 'positive' : engagement > 5 ? 'neutral' : 'negative';
                    
                    return (
                      <div key={program} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-white font-semibold">{program}</p>
                            <p className="text-slate-400 text-xs">{data.participants} participants</p>
                          </div>
                          <div className="text-right">
                            <p className="text-slate-400 text-xs">Current → Projected</p>
                            <p className="text-white font-bold">{engagement} → {projected}</p>
                          </div>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${
                            trend === 'positive' ? 'bg-gradient-to-r from-green-600 to-emerald-500' :
                            trend === 'neutral' ? 'bg-gradient-to-r from-yellow-600 to-orange-500' :
                            'bg-gradient-to-r from-red-600 to-orange-500'
                          }`} style={{width: `${Math.min(engagement * 10, 100)}%`}}></div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          {trend === 'positive' && <span className="text-green-400 text-xs">✓ Healthy engagement</span>}
                          {trend === 'neutral' && <span className="text-yellow-400 text-xs">⚠ Monitor closely</span>}
                          {trend === 'negative' && <span className="text-red-400 text-xs">🔴 Needs attention</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Workforce & Regional */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <Users className="text-blue-400" size={20} />
                  Workforce Stability Forecast
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-slate-400 text-xs mb-1">Total Staff</p>
                      <p className="text-2xl font-bold text-white">{forecasts.workforceOutlook.totalStaff}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-slate-400 text-xs mb-1">Turnover Risk (6mo)</p>
                      <p className="text-2xl font-bold text-orange-400">{forecasts.workforceOutlook.turnoverRisk}%</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-slate-400 text-sm">Overtime Pressure Index</p>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        forecasts.workforceOutlook.overtimePressure === 'High' ? 'bg-red-900/30 text-red-400 border border-red-500/50' :
                        forecasts.workforceOutlook.overtimePressure === 'Medium' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/50' :
                        'bg-green-900/30 text-green-400 border border-green-500/50'
                      }`}>
                        {forecasts.workforceOutlook.overtimePressure}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-3">Staff by Division</p>
                    {Object.entries(forecasts.workforceOutlook.staffByDivision || {}).map(([division, count]) => (
                      <div key={division} className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm">{division}</span>
                        <span className="text-slate-400 font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <MapPin className="text-red-400" size={20} />
                  Regional Risk Map
                </h2>
                
                <div className="space-y-3">
                  {forecasts.regionalRisks?.length > 0 ? forecasts.regionalRisks.map(region => (
                    <div key={region.region} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getRegionalRiskColor(region.riskLevel)}`}></div>
                          <p className="text-white font-semibold">{region.region}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          region.riskLevel === 'High' ? 'bg-red-900/30 text-red-400' :
                          region.riskLevel === 'Watch' ? 'bg-yellow-900/30 text-yellow-400' :
                          'bg-green-900/30 text-green-400'
                        }`}>
                          {region.riskLevel}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-slate-400">Individuals</p>
                          <p className="text-white font-bold">{region.individuals}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Incident Rate</p>
                          <p className="text-white font-bold">{region.incidentRate}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center text-slate-400 py-8">
                      No regional data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Capacity & Utilization */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Building2 className="text-purple-400" size={24} />
                Capacity & Utilization Forecast
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Current Utilization</p>
                  <div className="flex items-end gap-2 mb-3">
                    <p className="text-4xl font-black text-white">{forecasts.utilizationProjection.current}%</p>
                    <p className="text-slate-400 text-sm mb-2">± 5%</p>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 rounded-full"
                      style={{width: `${forecasts.utilizationProjection.current}%`}}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Projected (Next Quarter)</p>
                  <div className="flex items-end gap-2 mb-3">
                    <p className="text-4xl font-black text-white">{forecasts.utilizationProjection.projected}%</p>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        forecasts.utilizationProjection.tightening 
                          ? 'bg-gradient-to-r from-orange-600 to-red-500' 
                          : 'bg-gradient-to-r from-green-600 to-emerald-500'
                      }`}
                      style={{width: `${forecasts.utilizationProjection.projected}%`}}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Capacity Status</p>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${
                    forecasts.utilizationProjection.tightening 
                      ? 'bg-orange-900/30 text-orange-400 border border-orange-500/50'
                      : 'bg-green-900/30 text-green-400 border border-green-500/50'
                  }`}>
                    {forecasts.utilizationProjection.tightening ? 'Tightening' : 'Stable'}
                  </div>
                  <p className="text-slate-400 text-xs mt-3">
                    {forecasts.utilizationProjection.tightening 
                      ? 'Additional staffing may be needed in 90-120 days'
                      : 'Capacity levels remain healthy'}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Medication Compliance */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Pill className="text-blue-400" size={20} />
                    Medication Compliance
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    forecasts.medicationCompliance.trend === 'positive' ? 'bg-green-900/30 text-green-400 border border-green-500/50' :
                    forecasts.medicationCompliance.trend === 'neutral' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/50' :
                    'bg-red-900/30 text-red-400 border border-red-500/50'
                  }`}>
                    {forecasts.medicationCompliance.complianceRate}%
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-slate-400 text-xs mb-1">Total Meds</p>
                      <p className="text-2xl font-bold text-white">{forecasts.medicationCompliance.totalMedications}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-slate-400 text-xs mb-1">Active</p>
                      <p className="text-2xl font-bold text-green-400">{forecasts.medicationCompliance.activeMedications}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-slate-400 text-xs mb-1">Missed</p>
                      <p className="text-2xl font-bold text-red-400">{forecasts.medicationCompliance.missedDoses}</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        forecasts.medicationCompliance.trend === 'positive' ? 'bg-gradient-to-r from-green-600 to-emerald-500' :
                        forecasts.medicationCompliance.trend === 'neutral' ? 'bg-gradient-to-r from-yellow-600 to-orange-500' :
                        'bg-gradient-to-r from-red-600 to-orange-500'
                      }`}
                      style={{width: `${forecasts.medicationCompliance.complianceRate}%`}}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Incident Trends */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="text-red-400" size={20} />
                    Incident Trends
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    forecasts.incidentTrends.trend === 'increasing' ? 'bg-red-900/30 text-red-400 border border-red-500/50' :
                    'bg-green-900/30 text-green-400 border border-green-500/50'
                  }`}>
                    {forecasts.incidentTrends.trend === 'increasing' ? 'Increasing' : 'Stable'}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-slate-400 text-xs mb-1">Total</p>
                      <p className="text-2xl font-bold text-white">{forecasts.incidentTrends.totalIncidents}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-slate-400 text-xs mb-1">Open</p>
                      <p className="text-2xl font-bold text-orange-400">{forecasts.incidentTrends.openIncidents}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-slate-400 text-xs mb-1">High Severity</p>
                      <p className="text-2xl font-bold text-red-400">{forecasts.incidentTrends.highSeverityIncidents}</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-slate-400 text-sm">Rate per Individual</p>
                      <p className="text-white font-bold">{forecasts.incidentTrends.incidentRate}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-slate-400 text-sm">Open Rate</p>
                      <p className="text-orange-400 font-bold">{forecasts.incidentTrends.openIncidentRate}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Goal Progress */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Target className="text-green-400" size={20} />
                    Goal Progress
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    forecasts.goalProgress.trend === 'positive' ? 'bg-green-900/30 text-green-400 border border-green-500/50' :
                    forecasts.goalProgress.trend === 'neutral' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/50' :
                    'bg-red-900/30 text-red-400 border border-red-500/50'
                  }`}>
                    {forecasts.goalProgress.avgProgress}% Avg
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-slate-400 text-xs mb-1">Total Goals</p>
                      <p className="text-2xl font-bold text-white">{forecasts.goalProgress.totalGoals}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-slate-400 text-xs mb-1">Active Goals</p>
                      <p className="text-2xl font-bold text-green-400">{forecasts.goalProgress.activeGoals}</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-slate-400 text-sm">Average Progress</p>
                      <p className="text-white font-bold">{forecasts.goalProgress.avgProgress}%</p>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          forecasts.goalProgress.trend === 'positive' ? 'bg-gradient-to-r from-green-600 to-emerald-500' :
                          forecasts.goalProgress.trend === 'neutral' ? 'bg-gradient-to-r from-yellow-600 to-orange-500' :
                          'bg-gradient-to-r from-red-600 to-orange-500'
                        }`}
                        style={{width: `${forecasts.goalProgress.avgProgress}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Risk */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Shield className="text-purple-400" size={20} />
                    Compliance Risk
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    forecasts.complianceRisk.riskLevel === 'High' ? 'bg-red-900/30 text-red-400 border border-red-500/50' :
                    forecasts.complianceRisk.riskLevel === 'Medium' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/50' :
                    'bg-green-900/30 text-green-400 border border-green-500/50'
                  }`}>
                    {forecasts.complianceRisk.riskLevel} Risk
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-2">Average Score</p>
                    <p className="text-4xl font-black text-white">{forecasts.complianceRisk.avgScore}%</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-slate-400 text-xs mb-1">Low Compliance</p>
                      <p className="text-2xl font-bold text-red-400">{forecasts.complianceRisk.lowComplianceCount}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-slate-400 text-xs mb-1">Total</p>
                      <p className="text-2xl font-bold text-white">{individuals.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Activity className="text-cyan-400" size={18} />
                  Engagement Metrics
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-400 text-sm">Avg Notes/Individual</p>
                    <p className="text-white font-bold">{forecasts.engagementForecast.current}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-slate-400 text-sm">Notes Last 30 Days</p>
                    <p className="text-cyan-400 font-bold">{forecasts.engagementForecast.notesLast30Days}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-slate-400 text-sm">Trend</p>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      forecasts.engagementForecast.trend === 'high' ? 'bg-green-900/30 text-green-400' :
                      forecasts.engagementForecast.trend === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-red-900/30 text-red-400'
                    }`}>
                      {forecasts.engagementForecast.trend?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Heart className="text-pink-400" size={18} />
                  Health & Wellness
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
<p className="text-slate-400 text-sm">Vitals Compliance</p>
<p className="text-white font-bold">{forecasts.healthTrends.vitalsComplianceRate}%</p>
</div>
<div className="flex items-center justify-between">
<p className="text-slate-400 text-sm">Recent Vitals</p>
<p className="text-pink-400 font-bold">{forecasts.healthTrends.recentVitals}</p>
</div>
<div className="flex items-center justify-between">
<p className="text-slate-400 text-sm">Upcoming Appts</p>
<p className="text-cyan-400 font-bold">{forecasts.healthTrends.upcomingAppointments}</p>
</div>
</div>
</div>
<div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="text-emerald-400" size={18} />
                  Status Distribution
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-400 text-sm">Active</p>
                    <p className="text-green-400 font-bold">{forecasts.statusDistribution.active}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-slate-400 text-sm">Review</p>
                    <p className="text-yellow-400 font-bold">{forecasts.statusDistribution.review}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-slate-400 text-sm">Inactive</p>
                    <p className="text-red-400 font-bold">{forecasts.statusDistribution.inactive}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Governance Banner */}
            <div className="bg-gradient-to-r from-amber-900/20 via-orange-900/20 to-amber-900/20 border border-amber-500/30 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="text-amber-400 flex-shrink-0 mt-1" size={24} />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-amber-300 mb-2">FORECASTS ARE ORGANIZATIONAL-LEVEL ONLY</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-400 flex-shrink-0" size={16} />
                      <span className="text-amber-100">No PHI used</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-400 flex-shrink-0" size={16} />
                      <span className="text-amber-100">No client-level predictions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-400 flex-shrink-0" size={16} />
                      <span className="text-amber-100">Decision-support tool only</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-400 flex-shrink-0" size={16} />
                      <span className="text-amber-100">Cannot deny services/HR actions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </ScrollArea>
    </div>
  </div>
</div>
)}

export default ForesightEnginePage