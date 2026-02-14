'use client';

import React, { useState, useEffect } from 'react';
import { 
  Brain, TrendingUp, AlertTriangle, Target, Activity, Shield, Users,
  ChevronRight, Loader2, Search, Filter, X, Menu, Bell, ChevronDown,
  Settings, Home, Pill, CreditCard, BarChart3, NetworkIcon, Sparkles,
  Zap, ArrowUp, ArrowDown, Clock, CheckCircle, AlertCircle, Info,
  TrendingDown, Eye, RefreshCcw, Download, FileText, Heart, MapPin, User2Icon,
  User, Calendar, Clipboard, Award, Briefcase, AlertOctagon, TrendingUpDown
} from 'lucide-react';
import { ScrollArea } from "../../../components/ui/scroll-area";
import { useUser, UserButton } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '../../../contexts/userProfileContext';
import { PERMISSIONS } from '../../../utils/permissions';

const supabase = createClient(
  'https://bbikcxalypttfgrlxstf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWtjeGFseXB0dGZncmx4c3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODcwOCwiZXhwIjoyMDY5Mjk0NzA4fQ.4BLQyvPA0eB745Sfdn2Tl4oCDRTzNhLXrJ8Os8wOXfs'
);

const GROQ_API_KEY = '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';

const ForesightEnginePage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { userProfile, loading: profileLoading, hasPermission, hasAnyPermission } = useUserProfile();
  
  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedIndividual, setSelectedIndividual] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('intelligence');
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [programLevelInsights, setProgramLevelInsights] = useState(null);

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

  const canViewEngine = hasAnyPermission([
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  useEffect(() => {
    if (isLoaded && user && !profileLoading && userProfile) {
      if (canViewEngine) {
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
      
      const parsedData = (data || []).map(individual => ({
        ...individual,
        medications: parseJSONData(individual.medications) || [],
        dailynotes: parseJSONData(individual.dailynotes) || [],
        incidents: parseJSONData(individual.incidents) || [],
        goals: parseJSONData(individual.goals) || [],
        wellness_data: parseJSONData(individual.wellness_data) || [],
        hcbs_data: parseJSONData(individual.hcbs_data) || {},
        marhistory: parseJSONData(individual.marhistory) || [],
        outcomes: parseJSONData(individual.outcomes) || [],
        riskplans: parseJSONData(individual.riskplans) || [],
        medicalalerts: parseJSONData(individual.medicalalerts) || [],
        behavioralalerts: parseJSONData(individual.behavioralalerts) || [],
        assigned_staff: parseJSONData(individual.assigned_staff) || [],
        complaints: parseJSONData(individual.complaints) || [],
        corrective_action_plans: parseJSONData(individual.corrective_action_plans) || [],
        quarterly_reviews: parseJSONData(individual.quarterly_reviews) || []
      }));
      
      setIndividuals(parsedData);
    } catch (error) {
      console.error('Error fetching individuals:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseJSONData = (data) => {
    if (!data) return null;
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        return null;
      }
    }
    return data;
  };

  // Enhanced analysis with comprehensive individual data
  const analyzeIndividual = async () => {
    if (!selectedIndividual) return;

    try {
      setAnalyzing(true);
      setPrediction(null);

      // Calculate advanced metrics
      const medicationCompliance = calculateMedicationCompliance(selectedIndividual);
      const engagementScore = calculateEngagementScore(selectedIndividual);
      const riskScore = calculateRiskScore(selectedIndividual);
      const behaviorTrends = analyzeBehaviorTrends(selectedIndividual);
      const staffingAnalysis = analyzeStaffing(selectedIndividual);
      const hcbsCompliance = analyzeHCBSCompliance(selectedIndividual);

      const prompt = `You are an advanced predictive analytics AI for the CareBridge Foresight Engine, designed to provide strategic, program-level insights for developmental disabilities care management. Your analysis must be fully compliant with our Data Governance & Privacy standards - NO PHI, NO diagnoses, NO clinical decision-making.

**CRITICAL COMPLIANCE REQUIREMENTS:**
- Provide PROGRAM-LEVEL and ORGANIZATIONAL insights, not individual clinical predictions
- Focus on engagement, participation, workforce stability, and operational performance
- Never predict individual medical outcomes or treatment responses
- All recommendations must enhance quality, equity, and sustainability
- This is decision-support only, never a replacement for professional judgment

**INDIVIDUAL PROFILE (De-identified for Analysis):**
Individual ID: ${selectedIndividual.individualid}
Home Assignment: ${selectedIndividual.homeassignment}
Division: ${selectedIndividual.division || 'DD'}
Status: ${selectedIndividual.status}
Admission Date: ${selectedIndividual.admissiondate}
Compliance Score: ${selectedIndividual.compliance_score}%

**COMPUTED METRICS (Non-PHI):**
- Medication Compliance Rate: ${medicationCompliance.rate}%
- Engagement Score: ${engagementScore.score}/100 (${engagementScore.level})
- Overall Risk Score: ${riskScore}/100
- Active Goals Progress: ${selectedIndividual.goals?.filter(g => g.status === 'Active').length || 0} active
- HCBS Compliance Level: ${hcbsCompliance.level}

**ENGAGEMENT & PARTICIPATION DATA:**
- Daily Notes (Last 30 Days): ${selectedIndividual.dailynotes?.length || 0} entries
- Activities Participation: ${selectedIndividual.dailynotes?.filter(n => n.activities?.length > 0).length || 0} days with activities
- Community Outings: ${selectedIndividual.dailynotes?.filter(n => n.communityouting).length || 0} outings
- Mood Trends: ${getMoodTrends(selectedIndividual)}
- Choice Honored Rate: ${getChoiceHonoredRate(selectedIndividual)}%

**MEDICATION MANAGEMENT (Aggregated, Non-Clinical):**
- Total Active Medications: ${selectedIndividual.medications?.filter(m => m.status === 'Active').length || 0}
- MAR Administration Rate: ${medicationCompliance.marRate}%
- Missed Doses (Last 30 Days): ${selectedIndividual.misseddoses?.length || 0}
- PRN Administrations: ${selectedIndividual.marhistory?.filter(m => m.medicationid && selectedIndividual.medications?.find(med => med.id === m.medicationid && med.prn)).length || 0}
- Medication Refusals: ${selectedIndividual.marhistory?.filter(m => m.status === 'Refused').length || 0}

**INCIDENT & SAFETY PATTERNS (Aggregated):**
- Total Incidents (Last 6 Months): ${selectedIndividual.incidents?.length || 0}
- Severity Distribution: ${getIncidentSeverityDistribution(selectedIndividual)}
- Incident Types: ${getIncidentTypes(selectedIndividual)}
- Medical Alerts: ${selectedIndividual.medicalalerts?.length || 0} active
- Behavioral Alerts: ${selectedIndividual.behavioralalerts?.length || 0} active
- Active Risk Plans: ${selectedIndividual.riskplans?.filter(r => r.status === 'Active').length || 0}

**GOAL ACHIEVEMENT & PROGRESS:**
- Total Goals: ${selectedIndividual.goals?.length || 0}
- Active Goals: ${selectedIndividual.goals?.filter(g => g.status === 'Active').length || 0}
- Average Goal Progress: ${getAverageGoalProgress(selectedIndividual)}%
- HCBS Domains Addressed: ${selectedIndividual.hcbsdomains || 'Not specified'}
- ISP Outcomes: ${selectedIndividual.outcomes?.length || 0} defined

**HCBS COMPLIANCE & PERSON-CENTERED PLANNING:**
- Rights Restrictions: ${selectedIndividual.rightsrestrictions?.length || 0} documented
- Choice Acknowledgments: ${selectedIndividual.choice_acknowledgments?.length || 0}
- Community Activities Logged: ${selectedIndividual.community_activity_log?.length || 0}
- Lease Agreements: ${selectedIndividual.lease_agreements ? 'Active' : 'None'}
- Important To/For Documented: ${selectedIndividual.important_to ? 'Yes' : 'No'}

**WORKFORCE & STAFFING INDICATORS:**
- Assigned Staff: ${selectedIndividual.assigned_staff?.length || 0}
- Staff Training Requirements: ${selectedIndividual.staff_training_requirements?.length || 0}
- Staff Changes (Last Quarter): ${staffingAnalysis.turnoverIndicators}
- Documentation Completeness: ${getDocumentationCompleteness(selectedIndividual)}%

**WELLNESS & HEALTH MONITORING (Non-Clinical):**
- Wellness Check Frequency: ${selectedIndividual.wellness_data?.length || 0} checks
- Recent Vital Signs Stability: ${getVitalSignsStability(selectedIndividual)}
- Appointment Attendance: ${getAppointmentAttendance(selectedIndividual)}%
- Health Summary Documented: ${selectedIndividual.health_summary ? 'Yes' : 'No'}

**QUALITY & COMPLIANCE TRACKING:**
- Complaints Filed: ${selectedIndividual.complaints?.length || 0}
- Corrective Action Plans: ${selectedIndividual.corrective_action_plans?.filter(c => c.status === 'Open').length || 0} active
- Quarterly Reviews Completed: ${selectedIndividual.quarterly_reviews?.length || 0}
- Last Review Date: ${selectedIndividual.review_date || 'Not recorded'}

**BEHAVIOR TRENDS ANALYSIS:**
${JSON.stringify(behaviorTrends, null, 2)}

**RECENT ACTIVITY SAMPLE (Last 3 Daily Notes - Abbreviated):**
${JSON.stringify(selectedIndividual.dailynotes?.slice(0, 3).map(note => ({
  date: note.date,
  shift: note.shift,
  mood: note.mood,
  activities: note.activities?.slice(0, 2),
  behaviors: note.behaviors,
  communityOuting: note.communityouting || false,
  choiceHonored: note.choiceHonored || false,
  ispGoalAddressed: note.ispGoalAddressed || false
})) || [], null, 2)}

**PROVIDE COMPREHENSIVE FORESIGHT ANALYSIS IN THIS JSON FORMAT:**
{
  "organizationalInsights": {
    "programLevelRisks": [
      {
        "category": "engagement" | "workforce" | "compliance" | "capacity",
        "description": "Program-level pattern or trend",
        "probability": 0-100,
        "impact": "high" | "medium" | "low",
        "timeframe": "immediate" | "short-term" | "long-term"
      }
    ],
    "opportunityAreas": [
      {
        "area": "community_integration" | "skill_development" | "choice_expansion",
        "description": "Strategic opportunity for program improvement",
        "estimatedImpact": "Description of potential positive outcomes"
      }
    ]
  },
  "engagementForecast": {
    "currentLevel": "high" | "moderate" | "low",
    "trendDirection": "improving" | "stable" | "declining",
    "projectedEngagement30Days": 0-100,
    "projectedEngagement90Days": 0-100,
    "keyDrivers": ["driver1", "driver2", "driver3"],
    "interventionPriority": "critical" | "high" | "medium" | "low"
  },
  "capacityAndDemand": {
    "currentUtilization": 0-100,
    "projectedDemand": "increasing" | "stable" | "decreasing",
    "staffingAdequacy": "sufficient" | "stretched" | "insufficient",
    "programFit": "excellent" | "good" | "needs_review",
    "recommendations": ["recommendation1", "recommendation2"]
  },
  "workforceStability": {
    "turnoverRisk": "high" | "medium" | "low",
    "trainingGaps": ["gap1", "gap2"],
    "staffingPressure": 0-100,
    "supportNeeds": ["need1", "need2"]
  },
  "complianceAndQuality": {
    "hcbsAlignment": "strong" | "adequate" | "needs_improvement",
    "documentationQuality": "excellent" | "good" | "needs_attention",
    "personCenteredPractice": "exemplary" | "standard" | "developing",
    "areasForImprovement": ["area1", "area2"]
  },
  "strategicRecommendations": {
    "immediate": [
      {
        "action": "Specific action item",
        "rationale": "Why this matters for program quality",
        "expectedOutcome": "What this will achieve"
      }
    ],
    "shortTerm": [
      {
        "action": "Action for 1-4 weeks",
        "rationale": "Strategic importance",
        "expectedOutcome": "Projected improvement"
      }
    ],
    "longTerm": [
      {
        "action": "Action for 1-6 months",
        "rationale": "Program development goal",
        "expectedOutcome": "Organizational benefit"
      }
    ]
  },
  "riskMitigation": {
    "identifiedRisks": [
      {
        "risk": "Description of program-level risk",
        "likelihood": "high" | "medium" | "low",
        "impact": "high" | "medium" | "low",
        "mitigationStrategy": "How to address this risk"
      }
    ]
  },
  "programHealthScore": {
    "overall": 0-100,
    "engagement": 0-100,
    "compliance": 0-100,
    "personCentered": 0-100,
    "staffing": 0-100,
    "summary": "Overall program health assessment"
  },
  "forecastConfidence": {
    "level": "high" | "medium" | "low",
    "dataQuality": "excellent" | "good" | "limited",
    "factors": ["factor affecting confidence"]
  },
  "ethicalConsiderations": [
    "Consideration 1: How this respects autonomy and dignity",
    "Consideration 2: How this promotes equity and inclusion"
  ]
}

**ANALYSIS PRINCIPLES:**
1. Focus on PATTERNS and TRENDS, not individual predictions
2. Emphasize PREVENTION and ENHANCEMENT, not deficits
3. Consider SYSTEMIC factors (staffing, resources, processes)
4. Promote PERSON-CENTERED values (choice, community, dignity)
5. Support STRATEGIC planning (capacity, workforce, programs)
6. Ensure recommendations are ACTIONABLE and MEASURABLE
7. Never stigmatize or label individuals - focus on support systems
8. Always consider equity, inclusion, and quality of life

Provide evidence-based, actionable insights that help leadership make strategic decisions to improve program quality, workforce stability, and individual outcomes while fully respecting privacy and dignity.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are the CareBridge Foresight Engine AI - an expert in strategic, program-level predictive analytics for developmental disabilities care. You provide organizational insights that enhance quality, equity, and sustainability while strictly adhering to data governance standards. Focus on program-level forecasts, workforce stability, engagement trends, and capacity planning. Never make individual clinical predictions or use PHI. Provide comprehensive JSON responses with actionable, evidence-based recommendations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.6,
          max_tokens: 4000,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const predictionData = JSON.parse(data.choices[0].message.content);

      const fullPrediction = {
        individualId: selectedIndividual.id,
        individualIdentifier: selectedIndividual.individualid,
        individualName: `${selectedIndividual.firstname} ${selectedIndividual.lastname}`,
        homeAssignment: selectedIndividual.homeassignment,
        division: selectedIndividual.division || 'DD',
        timestamp: new Date().toISOString(),
        computedMetrics: {
          medicationCompliance,
          engagementScore,
          riskScore,
          behaviorTrends,
          staffingAnalysis,
          hcbsCompliance
        },
        ...predictionData
      };

      setPrediction(fullPrediction);
      
      // Add to analysis history
      setAnalysisHistory(prev => [{
        id: Date.now(),
        individualId: selectedIndividual.id,
        individualName: `${selectedIndividual.firstname} ${selectedIndividual.lastname}`,
        timestamp: new Date().toISOString(),
        programHealthScore: predictionData.programHealthScore?.overall || 0
      }, ...prev.slice(0, 9)]);
      
      setShowPredictionModal(true);
    } catch (error) {
      console.error('Error analyzing individual:', error);
      alert('Error analyzing individual. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Helper functions for metric calculations
  const calculateMedicationCompliance = (individual) => {
    const activeMeds = individual.medications?.filter(m => m.status === 'Active') || [];
    const marHistory = individual.marhistory || [];
    const givenDoses = marHistory.filter(m => m.status === 'Given').length;
    const totalScheduled = marHistory.length;
    
    return {
      rate: totalScheduled > 0 ? Math.round((givenDoses / totalScheduled) * 100) : 100,
      marRate: totalScheduled > 0 ? Math.round((givenDoses / totalScheduled) * 100) : 100,
      activeMedications: activeMeds.length,
      totalAdministrations: marHistory.length
    };
  };

  const calculateEngagementScore = (individual) => {
    const dailyNotes = individual.dailynotes || [];
    const recentNotes = dailyNotes.slice(0, 30);
    
    let score = 0;
    let factors = [];
    
    // Activity participation
    const activeDays = recentNotes.filter(n => n.activities?.length > 0).length;
    const activityScore = (activeDays / Math.max(recentNotes.length, 1)) * 30;
    score += activityScore;
    
    // Community integration
    const communityOutings = recentNotes.filter(n => n.communityouting).length;
    const communityScore = (communityOutings / Math.max(recentNotes.length, 1)) * 25;
    score += communityScore;
    
    // Goal work
    const goalWorkDays = recentNotes.filter(n => n.ispGoalAddressed).length;
    const goalScore = (goalWorkDays / Math.max(recentNotes.length, 1)) * 25;
    score += goalScore;
    
    // Choice honored
    const choiceHonored = recentNotes.filter(n => n.choiceHonored).length;
    const choiceScore = (choiceHonored / Math.max(recentNotes.length, 1)) * 20;
    score += choiceScore;
    
    const level = score >= 80 ? 'High' : score >= 60 ? 'Moderate' : 'Low';
    
    return {
      score: Math.round(score),
      level,
      factors: {
        activityParticipation: Math.round(activityScore),
        communityIntegration: Math.round(communityScore),
        goalProgress: Math.round(goalScore),
        choiceExercise: Math.round(choiceScore)
      }
    };
  };

  const calculateRiskScore = (individual) => {
    let risk = 0;
    
    // Incident frequency
    const incidents = individual.incidents || [];
    const criticalIncidents = incidents.filter(i => i.severity === 'Critical - Life Threatening').length;
    const highIncidents = incidents.filter(i => i.severity === 'High').length;
    risk += criticalIncidents * 15 + highIncidents * 10;
    
    // Behavioral alerts
    const behavioralAlerts = individual.behavioralalerts || [];
    risk += behavioralAlerts.filter(a => a.severity === 'High').length * 10;
    
    // Medical alerts
    const medicalAlerts = individual.medicalalerts || [];
    risk += medicalAlerts.filter(a => a.severity === 'High').length * 10;
    
    // Medication non-compliance
    const marHistory = individual.marhistory || [];
    const refusals = marHistory.filter(m => m.status === 'Refused').length;
    risk += refusals * 5;
    
    // Missed doses
    const missedDoses = individual.misseddoses || [];
    risk += missedDoses.length * 3;
    
    return Math.min(risk, 100);
  };

  const analyzeBehaviorTrends = (individual) => {
    const dailyNotes = individual.dailynotes || [];
    const recentNotes = dailyNotes.slice(0, 30);
    
    const behaviorCounts = {};
    recentNotes.forEach(note => {
      (note.behaviors || []).forEach(behavior => {
        behaviorCounts[behavior] = (behaviorCounts[behavior] || 0) + 1;
      });
    });
    
    return {
      totalBehaviorDays: recentNotes.filter(n => n.behaviors?.length > 0).length,
      mostCommonBehaviors: Object.entries(behaviorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([behavior, count]) => ({ behavior, count })),
      behaviorFrequency: recentNotes.filter(n => n.behaviors?.length > 0).length / Math.max(recentNotes.length, 1)
    };
  };

  const analyzeStaffing = (individual) => {
    const assignedStaff = individual.assigned_staff || [];
    const activeStaff = assignedStaff.filter(s => s.status === 'Active');
    
    return {
      totalAssigned: assignedStaff.length,
      activeStaff: activeStaff.length,
      trainedStaff: assignedStaff.filter(s => s.training_completed).length,
      turnoverIndicators: assignedStaff.filter(s => s.status !== 'Active').length
    };
  };

  const analyzeHCBSCompliance = (individual) => {
    const domains = individual.hcbsdomains || [];
    const choiceAcknowledgments = individual.choice_acknowledgments || [];
    const rightsExplained = individual.rights_explained;
    const importantTo = individual.important_to;
    const importantFor = individual.important_for;
    
    let complianceScore = 0;
    if (domains.length > 0) complianceScore += 25;
    if (choiceAcknowledgments.length > 0) complianceScore += 25;
    if (rightsExplained) complianceScore += 25;
    if (importantTo && importantFor) complianceScore += 25;
    
    const level = complianceScore >= 75 ? 'Strong' : complianceScore >= 50 ? 'Adequate' : 'Needs Improvement';
    
    return {
      score: complianceScore,
      level,
      domainsAddressed: domains.length,
      choiceDocumented: choiceAcknowledgments.length > 0
    };
  };

  const getMoodTrends = (individual) => {
    const dailyNotes = individual.dailynotes || [];
    const recentNotes = dailyNotes.slice(0, 30);
    const moods = recentNotes.map(n => n.mood).filter(Boolean);
    
    const moodCounts = moods.reduce((acc, mood) => {
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});
    
    const dominant = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
    return dominant ? `${dominant[0]} (${Math.round(dominant[1]/moods.length*100)}%)` : 'Not recorded';
  };

  const getChoiceHonoredRate = (individual) => {
    const dailyNotes = individual.dailynotes || [];
    const recentNotes = dailyNotes.slice(0, 30);
    const honored = recentNotes.filter(n => n.choiceHonored).length;
    return recentNotes.length > 0 ? Math.round((honored / recentNotes.length) * 100) : 0;
  };

  const getIncidentSeverityDistribution = (individual) => {
    const incidents = individual.incidents || [];
    const distribution = incidents.reduce((acc, inc) => {
      const severity = inc.severity || 'Unknown';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(distribution)
      .map(([severity, count]) => `${severity}: ${count}`)
      .join(', ') || 'None';
  };

  const getIncidentTypes = (individual) => {
    const incidents = individual.incidents || [];
    const types = [...new Set(incidents.map(i => i.incidenttype))];
    return types.join(', ') || 'None';
  };

  const getAverageGoalProgress = (individual) => {
    const goals = individual.goals?.filter(g => g.progress !== undefined) || [];
    if (goals.length === 0) return 0;
    const total = goals.reduce((sum, g) => sum + (g.progress || 0), 0);
    return Math.round(total / goals.length);
  };

  const getDocumentationCompleteness = (individual) => {
    const dailyNotes = individual.dailynotes || [];
    const recentNotes = dailyNotes.slice(0, 30);
    const complete = recentNotes.filter(n => 
      n.narrative && n.mood && n.activities && n.approved
    ).length;
    return recentNotes.length > 0 ? Math.round((complete / recentNotes.length) * 100) : 0;
  };

  const getVitalSignsStability = (individual) => {
    const wellness = individual.wellness_data || [];
    const recentVitals = wellness.filter(w => w.type === 'vital_signs').slice(0, 5);
    return recentVitals.length > 0 ? 'Monitored' : 'Limited data';
  };

  const getAppointmentAttendance = (individual) => {
    const wellness = individual.wellness_data || [];
    const appointments = wellness.filter(w => w.type === 'appointment');
    const completed = appointments.filter(a => a.status === 'Completed').length;
    return appointments.length > 0 ? Math.round((completed / appointments.length) * 100) : 0;
  };

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'from-red-600 to-red-700';
      case 'high': return 'from-orange-600 to-orange-700';
      case 'moderate': case 'medium': return 'from-yellow-600 to-yellow-700';
      case 'low': return 'from-green-600 to-green-700';
      default: return 'from-slate-600 to-slate-700';
    }
  };

  const getRiskBorderColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'border-red-500/50';
      case 'high': return 'border-orange-500/50';
      case 'moderate': case 'medium': return 'border-yellow-500/50';
      case 'low': return 'border-green-500/50';
      default: return 'border-slate-500/50';
    }
  };

  const getRiskTextColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'moderate': case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const getRiskBgColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'bg-red-900/30';
      case 'high': return 'bg-orange-900/30';
      case 'moderate': case 'medium': return 'bg-yellow-900/30';
      case 'low': return 'bg-green-900/30';
      default: return 'bg-slate-900/30';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'health': return Heart;
      case 'behavioral': return Brain;
      case 'compliance': return Shield;
      case 'goals': return Target;
      case 'community': return MapPin;
      case 'medication': return Pill;
      case 'engagement': return Activity;
      case 'workforce': return Users;
      case 'capacity': return BarChart3;
      default: return Activity;
    }
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search individuals..." 
            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-500"
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

  const Sidebar = () => (
    <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-900/10 border-r border-slate-800/50 transition-all duration-300 flex flex-col backdrop-blur-xl h-screen`}>
      <div className="p-6 border-b border-slate-800/50 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <span className="text-slate-300 font-semibold">AI Engine Active</span>
          </div>
          <div className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
            <span className="text-emerald-400 text-xs font-bold">v2.1</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Total Individuals</span>
            <span className="text-xs text-purple-400 font-bold">{individuals.length}</span>
          </div>
          {selectedIndividual && (
            <div className="mt-2 pt-2 border-t border-purple-500/20">
              <span className="text-xs text-purple-400 font-medium">Selected: {selectedIndividual.firstname}</span>
            </div>
          )}
          {analysisHistory.length > 0 && (
            <div className="mt-2 pt-2 border-t border-purple-500/20">
              <span className="text-xs text-purple-400 font-medium">Analyses: {analysisHistory.length}</span>
            </div>
          )}
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
                if (item.id !== 'engine' && item.id !== 'intelligence') {
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
              <Brain className="text-emerald-400" size={18} />
              <p className="text-sm font-bold text-white">Enhanced Foresight</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">Strategic Program Intelligence</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!profileLoading && !canViewEngine) {
    return (
      <div className="h-screen flex flex-col bg-slate-950 text-white">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
            <p className="text-slate-400 mb-6">
              You do not have permission to access the Foresight Engine. Please contact your administrator.
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
          <p className="text-slate-400 text-lg">Loading Foresight Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
    
      <div className="flex flex-1 overflow-hidden">
        
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
                          <Brain size={12} /> ENHANCED AI
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-lg">
                      Strategic Program-Level Predictive Intelligence • {individuals.length} individuals • {analysisHistory.length} analyses
                    </p>
                  </div>
                </div>

                {/* Analysis History */}
                {analysisHistory.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/30 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                      <Clock size={24} />
                      Recent Analyses
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {analysisHistory.slice(0, 6).map((analysis) => (
                        <div key={analysis.id} className="bg-slate-900/50 rounded-lg p-3 border border-blue-500/20">
                          <p className="text-white font-semibold text-sm">{analysis.individualName}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-slate-400">
                              {new Date(analysis.timestamp).toLocaleString()}
                            </span>
                            <span className="text-xs font-bold text-blue-400">
                              Score: {analysis.programHealthScore}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Individual Card */}
                {selectedIndividual && (
                  <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-6">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
                          {getInitials(selectedIndividual.firstname, selectedIndividual.lastname)}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1">
                            {selectedIndividual.firstname} {selectedIndividual.lastname}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="text-slate-400">ID: {selectedIndividual.individualid}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-400">{selectedIndividual.homeassignment}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-400">{selectedIndividual.division || 'DD'}</span>
                            <span className="text-slate-600">•</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${selectedIndividual.status === 'Active' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                              {selectedIndividual.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="text-sm">
                              <span className="text-slate-500">Compliance: </span>
                              <span className="text-white font-bold">{selectedIndividual.compliance_score}%</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-slate-500">Daily Notes: </span>
                              <span className="text-white font-bold">{selectedIndividual.dailynotes?.length || 0}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-slate-500">Active Goals: </span>
                              <span className="text-white font-bold">{selectedIndividual.goals?.filter(g => g.status === 'Active').length || 0}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-slate-500">Incidents: </span>
                              <span className="text-white font-bold">{selectedIndividual.incidents?.length || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedIndividual(null)}
                          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
                        >
                          Change Selection
                        </button>
                        <button
                          onClick={analyzeIndividual}
                          disabled={analyzing}
                          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {analyzing ? (
                            <>
                              <Loader2 size={20} className="animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Sparkles size={20} />
                              Run Enhanced Analysis
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Search and Filter */}
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
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-emerald-500 hover:border-emerald-500/50 transition-all font-semibold"
                  >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Review">Review</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Individuals List */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Users size={24} className="text-emerald-400" />
                    Select an Individual for Strategic Analysis
                  </h3>

                  {filteredIndividuals.length === 0 ? (
                    <div className="text-center py-16">
                      <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-slate-400 mb-2">No individuals found</h4>
                      <p className="text-slate-500">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[600px] rounded-xl">
                      <div className="pr-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredIndividuals.map((individual, idx) => (
                          <button
                            key={individual.id}
                            onClick={() => setSelectedIndividual(individual)}
                            className={`text-left bg-gradient-to-br from-slate-900/50 to-slate-800/50 border rounded-xl p-5 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                              selectedIndividual?.id === individual.id
                                ? 'border-purple-500/50 shadow-lg shadow-purple-500/30 scale-105'
                                : 'border-slate-700/50 hover:border-emerald-500/50'
                            }`}
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div className={`w-12 h-12 bg-gradient-to-br ${getColorClass(idx)} rounded-xl flex items-center justify-center text-white font-bold shadow-lg`}>
                                {getInitials(individual.firstname, individual.lastname)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-semibold truncate">
                                  {individual.firstname} {individual.lastname}
                                </h4>
                                <p className="text-slate-500 text-xs font-mono">{individual.individualid}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Home</span>
                                <span className="text-white font-medium truncate ml-2">{individual.homeassignment}</span>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Status</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                  individual.status === 'Active' ? 'bg-green-900/30 text-green-400' : 
                                  individual.status === 'Review' ? 'bg-yellow-900/30 text-yellow-400' :
                                  'bg-red-900/30 text-red-400'
                                }`}>
                                  {individual.status}
                                </span>
                              </div>
                              
                              <div className="pt-2 border-t border-slate-700/50">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-slate-500">Compliance</span>
                                  <span className="text-white font-bold">{individual.compliance_score}%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-1.5">
                                  <div 
                                    className={`h-full rounded-full ${
                                      individual.compliance_score >= 95 ? 'bg-lime-500' : 
                                      individual.compliance_score >= 85 ? 'bg-yellow-500' : 
                                      'bg-red-500'
                                    }`}
                                    style={{width: `${individual.compliance_score}%`}}
                                  ></div>
                                </div>
                              </div>

                              <div className="grid grid-cols-4 gap-2 pt-2 text-xs">
                                <div className="text-center">
                                  <p className="text-slate-500">Notes</p>
                                  <p className="text-white font-bold">{individual.dailynotes?.length || 0}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-slate-500">Meds</p>
                                  <p className="text-white font-bold">{individual.medications?.filter(m => m.status === 'Active').length || 0}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-slate-500">Goals</p>
                                  <p className="text-white font-bold">{individual.goals?.filter(g => g.status === 'Active').length || 0}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-slate-500">Inc.</p>
                                  <p className="text-white font-bold">{individual.incidents?.length || 0}</p>
                                </div>
                              </div>
                            </div>

                            {selectedIndividual?.id === individual.id && (
                              <div className="mt-3 pt-3 border-t border-purple-500/30">
                                <p className="text-xs text-purple-400 font-semibold text-center flex items-center justify-center gap-1">
                                  <CheckCircle size={12} />
                                  Selected for Analysis
                                </p>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>
            </main>
          </ScrollArea>
        </div>
      </div>

      {/* Enhanced Prediction Modal */}
      {showPredictionModal && prediction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
                  {getInitials(selectedIndividual.firstname, selectedIndividual.lastname)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{prediction.individualName}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-slate-400 text-sm">
                      {prediction.individualIdentifier} • {prediction.homeAssignment} • {prediction.division}
                    </span>
                    <span className="text-slate-500 text-xs">
                      {new Date(prediction.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowPredictionModal(false);
                  setPrediction(null);
                }}
                className="p-2 hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="text-slate-400" size={24} />
              </button>
            </div>

            <ScrollArea className="h-[calc(90vh-180px)]">
              <div className="p-6 space-y-6">
                {/* Program Health Score */}
                {prediction.programHealthScore && (
                  <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/30 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                      <Award size={20} />
                      Program Health Scorecard
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center mb-2">
                          <span className="text-3xl font-black text-white">{prediction.programHealthScore.overall}</span>
                        </div>
                        <p className="text-xs text-slate-400 uppercase">Overall</p>
                      </div>
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center mb-2">
                          <span className="text-2xl font-bold text-white">{prediction.programHealthScore.engagement}</span>
                        </div>
                        <p className="text-xs text-slate-400 uppercase">Engagement</p>
                      </div>
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center mb-2">
                          <span className="text-2xl font-bold text-white">{prediction.programHealthScore.compliance}</span>
                        </div>
                        <p className="text-xs text-slate-400 uppercase">Compliance</p>
                      </div>
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center mb-2">
                          <span className="text-2xl font-bold text-white">{prediction.programHealthScore.personCentered}</span>
                        </div>
                        <p className="text-xs text-slate-400 uppercase">Person-Centered</p>
                      </div>
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto bg-slate-800 rounded-2xl flex items-center justify-center mb-2">
                          <span className="text-2xl font-bold text-white">{prediction.programHealthScore.staffing}</span>
                        </div>
                        <p className="text-xs text-slate-400 uppercase">Staffing</p>
                      </div>
                    </div>
                    <p className="text-slate-300 mt-4">{prediction.programHealthScore.summary}</p>
                  </div>
                )}

                {/* Organizational Insights */}
                {prediction.organizationalInsights && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Program-Level Risks */}
                    {prediction.organizationalInsights.programLevelRisks && prediction.organizationalInsights.programLevelRisks.length > 0 && (
                      <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-xl p-6">
                        <h4 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                          <AlertTriangle size={20} />
                          Program-Level Risks
                        </h4>
                        <div className="space-y-3">
                          {prediction.organizationalInsights.programLevelRisks.map((risk, i) => (
                            <div key={i} className={`bg-slate-900/50 rounded-lg p-4 border ${getRiskBorderColor(risk.impact)}`}>
                              <div className="flex items-start gap-3">
                                <AlertTriangle className={getRiskTextColor(risk.impact)} size={18} />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-bold uppercase text-slate-400">{risk.category}</span>
                                    <span className="text-xs text-slate-600">•</span>
                                    <span className="text-xs text-slate-500">{risk.timeframe}</span>
                                  </div>
                                  <p className="text-slate-300 text-sm mb-2">{risk.description}</p>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-slate-500">Probability: <span className="font-bold text-white">{risk.probability}%</span></span>
                                    <span className={`text-xs px-2 py-1 rounded font-bold ${getRiskBgColor(risk.impact)} ${getRiskTextColor(risk.impact)}`}>
                                      {risk.impact} impact
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Opportunity Areas */}
                    {prediction.organizationalInsights.opportunityAreas && prediction.organizationalInsights.opportunityAreas.length > 0 && (
                      <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-6">
                        <h4 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                          <Target size={20} />
                          Strategic Opportunities
                        </h4>
                        <div className="space-y-3">
                          {prediction.organizationalInsights.opportunityAreas.map((opp, i) => (
                            <div key={i} className="bg-slate-900/50 rounded-lg p-4 border border-green-500/20">
                              <div className="flex items-start gap-3">
                                <CheckCircle className="text-green-400" size={18} />
                                <div className="flex-1">
                                  <p className="text-xs font-bold uppercase text-green-400 mb-2">{opp.area.replace(/_/g, ' ')}</p>
                                  <p className="text-slate-300 text-sm mb-2">{opp.description}</p>
                                  <p className="text-xs text-slate-500">{opp.estimatedImpact}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Engagement Forecast */}
                {prediction.engagementForecast && (
                  <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/30 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                      <TrendingUp size={20} />
                      Engagement Forecast
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <p className="text-xs text-slate-400 uppercase mb-2">Current Level</p>
                        <p className="text-2xl font-bold text-white capitalize">{prediction.engagementForecast.currentLevel}</p>
                        <p className="text-xs text-slate-500 mt-1">Trend: {prediction.engagementForecast.trendDirection}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <p className="text-xs text-slate-400 uppercase mb-2">30-Day Projection</p>
                        <p className="text-2xl font-bold text-white">{prediction.engagementForecast.projectedEngagement30Days}%</p>
                        <p className="text-xs text-slate-500 mt-1">Short-term outlook</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <p className="text-xs text-slate-400 uppercase mb-2">90-Day Projection</p>
                        <p className="text-2xl font-bold text-white">{prediction.engagementForecast.projectedEngagement90Days}%</p>
                        <p className="text-xs text-slate-500 mt-1">Long-term outlook</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-blue-400">Key Drivers:</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {prediction.engagementForecast.keyDrivers?.map((driver, i) => (
                          <div key={i} className="flex items-start gap-2 bg-slate-900/30 rounded-lg p-2">
                            <ChevronRight size={14} className="text-blue-400 mt-0.5" />
                            <span className="text-xs text-slate-300">{driver}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-blue-500/20">
                      <span className={`text-sm px-3 py-1 rounded-full font-bold ${getRiskBgColor(prediction.engagementForecast.interventionPriority)} ${getRiskTextColor(prediction.engagementForecast.interventionPriority)}`}>
                        Intervention Priority: {prediction.engagementForecast.interventionPriority}
                      </span>
                    </div>
                  </div>
                )}

                {/* Capacity & Demand + Workforce Stability */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {prediction.capacityAndDemand && (
                    <div className="bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border border-yellow-500/30 rounded-xl p-6">
                      <h4 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
                        <BarChart3 size={20} />
                        Capacity & Demand
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Current Utilization:</span>
                          <span className="text-lg font-bold text-white">{prediction.capacityAndDemand.currentUtilization}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Projected Demand:</span>
                          <span className="text-sm font-bold text-yellow-400 capitalize">{prediction.capacityAndDemand.projectedDemand}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Staffing Adequacy:</span>
                          <span className="text-sm font-bold text-white capitalize">{prediction.capacityAndDemand.staffingAdequacy}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Program Fit:</span>
                          <span className="text-sm font-bold text-white capitalize">{prediction.capacityAndDemand.programFit}</span>
                        </div>
                      </div>
                      {prediction.capacityAndDemand.recommendations && prediction.capacityAndDemand.recommendations.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-yellow-500/20">
                          <p className="text-xs font-bold text-yellow-400 uppercase mb-2">Recommendations:</p>
                          <div className="space-y-1">
                            {prediction.capacityAndDemand.recommendations.map((rec, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <ChevronRight size={12} className="text-yellow-400 mt-1" />
                                <span className="text-xs text-slate-300">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {prediction.workforceStability && (
                    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6">
                      <h4 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                        <Users size={20} />
                        Workforce Stability
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Turnover Risk:</span>
                          <span className={`text-sm font-bold capitalize ${getRiskTextColor(prediction.workforceStability.turnoverRisk)}`}>
                            {prediction.workforceStability.turnoverRisk}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Staffing Pressure:</span>
                          <span className="text-lg font-bold text-white">{prediction.workforceStability.staffingPressure}/100</span>
                        </div>
                      </div>
                      {prediction.workforceStability.trainingGaps && prediction.workforceStability.trainingGaps.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-purple-500/20">
                          <p className="text-xs font-bold text-purple-400 uppercase mb-2">Training Gaps:</p>
                          <div className="space-y-1">
                            {prediction.workforceStability.trainingGaps.map((gap, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <AlertCircle size={12} className="text-purple-400 mt-1" />
                                <span className="text-xs text-slate-300">{gap}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {prediction.workforceStability.supportNeeds && prediction.workforceStability.supportNeeds.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-bold text-purple-400 uppercase mb-2">Support Needs:</p>
                          <div className="space-y-1">
                            {prediction.workforceStability.supportNeeds.map((need, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <ChevronRight size={12} className="text-purple-400 mt-1" />
                                <span className="text-xs text-slate-300">{need}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Compliance & Quality */}
                {prediction.complianceAndQuality && (
                  <div className="bg-gradient-to-br from-indigo-900/20 to-violet-900/20 border border-indigo-500/30 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-indigo-400 mb-4 flex items-center gap-2">
                      <Shield size={20} />
                      Compliance & Quality Assessment
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                        <p className="text-xs text-slate-400 uppercase mb-2">HCBS Alignment</p>
                        <p className="text-lg font-bold text-indigo-400 capitalize">{prediction.complianceAndQuality.hcbsAlignment}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                        <p className="text-xs text-slate-400 uppercase mb-2">Documentation Quality</p>
                        <p className="text-lg font-bold text-indigo-400 capitalize">{prediction.complianceAndQuality.documentationQuality}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                        <p className="text-xs text-slate-400 uppercase mb-2">Person-Centered Practice</p>
                        <p className="text-lg font-bold text-indigo-400 capitalize">{prediction.complianceAndQuality.personCenteredPractice}</p>
                      </div>
                    </div>
                    {prediction.complianceAndQuality.areasForImprovement && prediction.complianceAndQuality.areasForImprovement.length > 0 && (
                      <div>
                        <p className="text-sm font-bold text-indigo-400 mb-2">Areas for Improvement:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {prediction.complianceAndQuality.areasForImprovement.map((area, i) => (
                            <div key={i} className="flex items-start gap-2 bg-slate-900/30 rounded-lg p-2">
                              <Info size={14} className="text-indigo-400 mt-0.5" />
                              <span className="text-xs text-slate-300">{area}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Strategic Recommendations */}
                {prediction.strategicRecommendations && (
                  <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/30 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                      <Target size={20} />
                      Strategic Action Plan
                    </h4>
                    <div className="space-y-6">
                      {prediction.strategicRecommendations.immediate && prediction.strategicRecommendations.immediate.length > 0 && (
                        <div>
                          <h5 className="text-sm font-bold text-red-400 uppercase mb-3 flex items-center gap-2">
                            <AlertCircle size={16} />
                            Immediate Actions (24-48 Hours)
                          </h5>
                          <div className="space-y-3">
                            {prediction.strategicRecommendations.immediate.map((action, i) => (
                              <div key={i} className="bg-red-900/10 rounded-lg p-4 border border-red-500/20">
                                <p className="text-white font-semibold mb-2">{action.action}</p>
                                <p className="text-sm text-slate-400 mb-2"><span className="font-bold text-slate-300">Why:</span> {action.rationale}</p>
                                <p className="text-sm text-emerald-400"><span className="font-bold">Expected Outcome:</span> {action.expectedOutcome}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {prediction.strategicRecommendations.shortTerm && prediction.strategicRecommendations.shortTerm.length > 0 && (
                        <div>
                          <h5 className="text-sm font-bold text-yellow-400 uppercase mb-3 flex items-center gap-2">
                            <Clock size={16} />
                            Short-Term Actions (1-4 Weeks)
                          </h5>
                          <div className="space-y-3">
                            {prediction.strategicRecommendations.shortTerm.map((action, i) => (
                              <div key={i} className="bg-yellow-900/10 rounded-lg p-4 border border-yellow-500/20">
                                <p className="text-white font-semibold mb-2">{action.action}</p>
                                <p className="text-sm text-slate-400 mb-2"><span className="font-bold text-slate-300">Why:</span> {action.rationale}</p>
                                <p className="text-sm text-emerald-400"><span className="font-bold">Expected Outcome:</span> {action.expectedOutcome}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {prediction.strategicRecommendations.longTerm && prediction.strategicRecommendations.longTerm.length > 0 && (
                        <div>
                          <h5 className="text-sm font-bold text-blue-400 uppercase mb-3 flex items-center gap-2">
                            <Target size={16} />
                            Long-Term Actions (1-6 Months)
                          </h5>
                          <div className="space-y-3">
                            {prediction.strategicRecommendations.longTerm.map((action, i) => (
                              <div key={i} className="bg-blue-900/10 rounded-lg p-4 border border-blue-500/20">
                                <p className="text-white font-semibold mb-2">{action.action}</p>
                                <p className="text-sm text-slate-400 mb-2"><span className="font-bold text-slate-300">Why:</span> {action.rationale}</p>
                                <p className="text-sm text-emerald-400"><span className="font-bold">Expected Outcome:</span> {action.expectedOutcome}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Risk Mitigation */}
                {prediction.riskMitigation && prediction.riskMitigation.identifiedRisks && prediction.riskMitigation.identifiedRisks.length > 0 && (
                  <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
                      <AlertOctagon size={20} />
                      Risk Mitigation Strategies
                    </h4>
                    <div className="space-y-3">
                      {prediction.riskMitigation.identifiedRisks.map((risk, i) => (
                        <div key={i} className={`bg-slate-900/50 rounded-lg p-4 border ${getRiskBorderColor(risk.impact)}`}>
                          <div className="flex items-start gap-3 mb-3">
                            <AlertTriangle className={getRiskTextColor(risk.impact)} size={18} />
                            <div className="flex-1">
                              <p className="text-white font-semibold mb-2">{risk.risk}</p>
                              <div className="flex items-center gap-3 mb-2">
                                <span className={`text-xs px-2 py-1 rounded font-bold ${getRiskBgColor(risk.likelihood)} ${getRiskTextColor(risk.likelihood)}`}>
                                  Likelihood: {risk.likelihood}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded font-bold ${getRiskBgColor(risk.impact)} ${getRiskTextColor(risk.impact)}`}>
                                  Impact: {risk.impact}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-emerald-900/20 rounded-lg p-3 border border-emerald-500/20">
                            <p className="text-xs font-bold text-emerald-400 uppercase mb-1">Mitigation Strategy:</p>
                            <p className="text-sm text-slate-300">{risk.mitigationStrategy}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Forecast Confidence */}
                {prediction.forecastConfidence && (
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <TrendingUpDown size={20} className="text-blue-400" />
                      Forecast Confidence & Data Quality
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <p className="text-sm text-slate-400 mb-2">Confidence Level</p>
                        <p className="text-2xl font-bold text-blue-400 capitalize">{prediction.forecastConfidence.level}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <p className="text-sm text-slate-400 mb-2">Data Quality</p>
                        <p className="text-2xl font-bold text-emerald-400 capitalize">{prediction.forecastConfidence.dataQuality}</p>
                      </div>
                    </div>
                    {prediction.forecastConfidence.factors && prediction.forecastConfidence.factors.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-bold text-slate-400 uppercase mb-2">Factors Affecting Confidence:</p>
                        <div className="space-y-1">
                          {prediction.forecastConfidence.factors.map((factor, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <Info size={12} className="text-blue-400 mt-1" />
                              <span className="text-xs text-slate-300">{factor}</span>
                            </div>
                          ))}
                        </div>
                        </div>
                )}
              </div>
            )}

            {/* Ethical Considerations */}
            {prediction.ethicalConsiderations && prediction.ethicalConsiderations.length > 0 && (
              <div className="bg-gradient-to-br from-violet-900/20 to-purple-900/20 border border-violet-500/30 rounded-xl p-6">
                <h4 className="text-lg font-bold text-violet-400 mb-4 flex items-center gap-2">
                  <Heart size={20} />
                  Ethical Considerations
                </h4>
                <div className="space-y-2">
                  {prediction.ethicalConsiderations.map((consideration, i) => (
                    <div key={i} className="flex items-start gap-3 bg-slate-900/30 rounded-lg p-3">
                      <Heart size={16} className="text-violet-400 mt-0.5" />
                      <p className="text-sm text-slate-300">{consideration}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Computed Metrics Reference */}
            <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-slate-700/30 rounded-xl p-6">
              <h4 className="text-lg font-bold text-slate-400 mb-4 flex items-center gap-2">
                <BarChart3 size={20} />
                Analysis Metrics Reference
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-slate-500 mb-1">Med Compliance</p>
                  <p className="text-white font-bold">{prediction.computedMetrics.medicationCompliance.rate}%</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Engagement Score</p>
                  <p className="text-white font-bold">{prediction.computedMetrics.engagementScore.score}/100</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Risk Score</p>
                  <p className="text-white font-bold">{prediction.computedMetrics.riskScore}/100</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">HCBS Level</p>
                  <p className="text-white font-bold">{prediction.computedMetrics.hcbsCompliance.level}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-slate-700 flex justify-between items-center">
          <div className="text-xs text-slate-500">
            Analysis generated: {new Date(prediction.timestamp).toLocaleString()} • Foresight Engine v2.1
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowPredictionModal(false);
                setPrediction(null);
              }}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
            >
              Close
            </button>
            <button
              onClick={() => {
                const dataStr = JSON.stringify(prediction, null, 2);
                const dataBlob = new Blob([dataStr], {type: 'application/json'});
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `foresight-analysis-${prediction.individualIdentifier}-${new Date().toISOString()}.json`;
                link.click();
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              <Download size={18} />
              Export Analysis
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
    </div>
  )}
</div>
);
};
export default ForesightEnginePage;