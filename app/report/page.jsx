'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Calendar, Filter, Search, ChevronRight, ChevronDown,
  Users, Activity, AlertTriangle, CheckCircle, XCircle, Clock, Shield,
  BarChart3, TrendingUp, Eye, Printer, Share2, RefreshCw, Lock,
  Home, MapPin, Heart, Pill, AlertCircle, Award, Target, BookOpen,
  Menu, X, Bell, Settings, ChevronLeft, Info
} from 'lucide-react';
import { ScrollArea, ScrollBar } from "../../components/ui/scroll-area";
import { useUser, UserButton } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '../../contexts/userProfileContext';
import { PERMISSIONS } from '../../utils/permissions';

const supabase = createClient(
  'https://bbikcxalypttfgrlxstf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWtjeGFseXB0dGZncmx4c3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODcwOCwiZXhwIjoyMDY5Mjk0NzA4fQ.4BLQyvPA0eB745Sfdn2Tl4oCDRTzNhLXrJ8Os8wOXfs'
);

const ReportsPage = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { userProfile, loading: profileLoading } = useUserProfile();
  
  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('HCBS');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [auditMode, setAuditMode] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '2026-01-01',
    end: '2026-03-31'
  });

  // Filter states
  const [homeFilter, setHomeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const tabs = [
    { id: 'HCBS', label: 'HCBS Compliance', icon: Shield, color: 'emerald' },
    { id: 'Clinical', label: 'Clinical', icon: Heart, color: 'pink' },
    { id: 'Incidents', label: 'Incidents', icon: AlertTriangle, color: 'red' },
    { id: 'Medications', label: 'Medications', icon: Pill, color: 'purple' },
    { id: 'Residential', label: 'Residential', icon: Home, color: 'blue' },
    { id: 'QA', label: 'QA/QAPI', icon: Award, color: 'teal' },
    { id: 'Billing', label: 'Billing', icon: FileText, color: 'indigo' }
  ];

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', badge: null },
    { id: 'individual', icon: Users, label: 'Individuals', badge: null },
    { id: 'medicine', icon: Pill, label: 'Medications', badge: null },
    { id: 'incident', icon: AlertTriangle, label: 'Incidents', badge: '3' },
    { id: 'bill', icon: Shield, label: 'Billing Report', badge: 'NEW' },
    { id: 'staff', icon: Users, label: 'Add Staff', badge: 'NEW' },
    { id: 'privacy', icon: Shield, label: 'Data Privacy', badge: 'NEW' },
    { id: 'report', icon: FileText, label: 'Report', badge: 'NEW' },
    { id: 'engine', icon: Pill, label: 'Foresight Engine', badge: 'NEW' },
    { id: 'intelligence', icon: BarChart3, label: 'User Foresight', badge: 'NEW' },
    { id: 'billing', icon: FileText, label: 'Billing', badge: null },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics', badge: null }
  ];

  useEffect(() => {
    if (isLoaded && user && !profileLoading && userProfile) {
      fetchIndividuals();
    }
  }, [isLoaded, user, profileLoading, userProfile, homeFilter, statusFilter, dateFilter]);

  const fetchIndividuals = async () => {
    try {
      setLoading(true);
      let query = supabase.from('individuals').select('*').order('created_at', { ascending: false });

      if (homeFilter !== 'all') {
        query = query.eq('homeassignment', homeFilter);
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate;
        switch (dateFilter) {
          case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            break;
          case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          case 'quarter':
            startDate = new Date(now.setMonth(now.getMonth() - 3));
            break;
          case 'year':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
        }
        if (startDate) {
          query = query.gte('created_at', startDate.toISOString());
        }
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

  const getUniqueHomes = () => {
    const homes = individuals.map(ind => ind.homeassignment).filter(Boolean);
    return [...new Set(homes)].sort();
  };

  const getStatusOptions = () => {
    const statuses = individuals.map(ind => ind.status).filter(Boolean);
    return [...new Set(statuses)].sort();
  };

  // ============================================
  // DATA CALCULATION FUNCTIONS
  // ============================================

  // Community Integration Data
  const getCommunityIntegrationData = () => {
    return individuals.map(individual => {
      const communityActivities = individual.community_activity_log || [];
      const dailyNotes = individual.dailynotes || [];
      
      const totalWeeks = 12;
      const totalHours = communityActivities.reduce((acc, activity) => {
        return acc + parseFloat(activity.duration_minutes || 0) / 60;
      }, 0);
      const avgHoursPerWeek = totalWeeks > 0 ? (totalHours / totalWeeks).toFixed(1) : 0;
      
      const totalEncounters = dailyNotes.length;
      const choiceDocumented = dailyNotes.filter(note => note.choiceOffered && note.choiceHonored).length;
      const choicePercent = totalEncounters > 0 ? Math.round((choiceDocumented / totalEncounters) * 100) : 0;
      
      const ispLinked = dailyNotes.filter(note => note.ispGoalAddressed).length;
      
      const lastOuting = communityActivities.length > 0 
        ? new Date(communityActivities[communityActivities.length - 1].date).toLocaleDateString()
        : 'Never';

      let hcbsStatus = '🟢 Fully Met';
      if (communityActivities.length === 0) {
        hcbsStatus = '🔴 Not Met';
      } else if (communityActivities.length < 6 || choicePercent < 80) {
        hcbsStatus = '🟡 Partial';
      }

      return {
        name: `${individual.firstname} ${individual.lastname}`,
        home: individual.homeassignment,
        waiver: 'ID/DD',
        communityActivities: communityActivities.length,
        avgHoursPerWeek,
        ispLinked,
        choicePercent,
        lastOuting,
        hcbsStatus,
        individual
      };
    });
  };

  // Choice & Autonomy Data
  const getChoiceAutonomyData = () => {
    return individuals.map(individual => {
      const dailyNotes = individual.dailynotes || [];
      const choiceAcknowledgments = individual.choice_acknowledgments || [];
      const totalEncounters = dailyNotes.length;
      const choiceDocumented = dailyNotes.filter(note => note.choiceOffered && note.choiceHonored).length;
      const choicePercent = totalEncounters > 0 ? Math.round((choiceDocumented / totalEncounters) * 100) : 0;
      
      const leaseSigned = individual.signed_by_individual || false;
      const complaints = individual.complaints || [];
      const complaints12Mo = complaints.length;
      const openComplaints = complaints.filter(c => c.resolution_status === 'Open').length;

      let riskFlag = '🟢';
      if (choicePercent < 80 || !leaseSigned || openComplaints > 0) {
        riskFlag = '🟡';
      }
      if (choicePercent < 50 || !leaseSigned || openComplaints > 1) {
        riskFlag = '🔴';
      }

      return {
        name: `${individual.firstname} ${individual.lastname}`,
        totalEncounters,
        choiceDocumented,
        choicePercent,
        leaseSigned,
        complaints12Mo,
        openComplaints,
        choiceAcknowledgments: choiceAcknowledgments.length,
        riskFlag,
        individual
      };
    });
  };

  // ISP Goal Implementation Data
  const getISPGoalData = () => {
    const goalData = [];
    individuals.forEach(individual => {
      const goals = individual.goals || [];
      const dailyNotes = individual.dailynotes || [];
      
      if (goals.length === 0) {
        goalData.push({
          individualName: `${individual.firstname} ${individual.lastname}`,
          ispGoal: 'No Goals Set',
          goalStatus: 'N/A',
          linkedEncounters: 0,
          totalHours: 0,
          avgPerMonth: 0,
          lastSession: 'N/A',
          individual
        });
      } else {
        goals.forEach(goal => {
          const linkedNotes = dailyNotes.filter(note => 
            note.goalsworked?.includes(goal.id)
          );
          
          const totalHours = linkedNotes.length;
          const avgPerMonth = totalHours > 0 ? (totalHours / 3).toFixed(1) : 0;
          
          const lastSession = linkedNotes.length > 0 
            ? new Date(linkedNotes[linkedNotes.length - 1].date).toLocaleDateString()
            : 'Never';

          goalData.push({
            individualName: `${individual.firstname} ${individual.lastname}`,
            ispGoal: goal.description?.substring(0, 50) + '...' || 'No description',
            goalStatus: goal.status,
            linkedEncounters: linkedNotes.length,
            totalHours,
            avgPerMonth,
            lastSession,
            individual
          });
        });
      }
    });
    return goalData;
  };

  // Incident Data
  const getIncidentData = () => {
    return individuals.map(individual => {
      const incidents = individual.incidents || [];
      const openIncidents = incidents.filter(inc => inc.status === 'Open').length;
      const closedIncidents = incidents.filter(inc => inc.status === 'Closed').length;
      const totalIncidents = incidents.length;
      
      const avgDaysToClose = closedIncidents > 0 ? 
        (incidents.filter(inc => inc.status === 'Closed').reduce((acc, inc) => {
          const created = new Date(inc.created_at);
          const updated = new Date(inc.updated_at);
          return acc + Math.ceil((updated - created) / (1000 * 60 * 60 * 24));
        }, 0) / closedIncidents).toFixed(1) : 0;
      
      const criticalOpen = incidents.filter(inc => 
        inc.status === 'Open' && inc.severity?.includes('Critical')
      ).length;

      return {
        name: `${individual.firstname} ${individual.lastname}`,
        home: individual.homeassignment,
        totalIncidents,
        openIncidents,
        closedIncidents,
        avgDaysToClose,
        criticalOpen,
        riskFlag: criticalOpen > 0 ? '🔴' : openIncidents > 0 ? '🟡' : '🟢',
        individual
      };
    });
  };

  // Medication Data
  const getMedicationData = () => {
    const allMedicationData = [];
    
    individuals.forEach(individual => {
      const medications = individual.medications || [];
      const marHistory = individual.marhistory || [];
      
      const activeMeds = medications.filter(med => med.status === 'Active');
      
      if (activeMeds.length === 0) {
        allMedicationData.push({
          individualName: `${individual.firstname} ${individual.lastname}`,
          medicationname: 'No Active Medications',
          scheduled: 0,
          given: 0,
          missed: 0,
          late: 0,
          adherence: 'N/A',
          lastMiss: 'N/A'
        });
      } else {
        activeMeds.forEach(med => {
          const medHistory = marHistory.filter(mar => mar.medicationid === med.id);
          const scheduled = medHistory.length;
          const given = medHistory.filter(mar => mar.status === 'Given').length;
          const missed = medHistory.filter(mar => mar.status === 'Missed' || mar.status === 'Refused').length;
          const late = medHistory.filter(mar => mar.lateminutes && parseInt(mar.lateminutes) > 0).length;
          
          const adherence = scheduled > 0 ? ((given / scheduled) * 100).toFixed(1) : 100;
          const missedDoses = medHistory.filter(mar => mar.status === 'Missed' || mar.status === 'Refused');
          const lastMiss = missedDoses.length > 0 ? 
            new Date(missedDoses[missedDoses.length - 1].date).toLocaleDateString() : 'None';

          allMedicationData.push({
            individualName: `${individual.firstname} ${individual.lastname}`,
            medicationname: med.medicationname,
            scheduled,
            given,
            missed,
            late,
            adherence,
            lastMiss
          });
        });
      }
    });
    
    return allMedicationData;
  };

  // Wellness & Vital Signs Data
  const getWellnessVitalsData = () => {
    const wellnessData = [];
    individuals.forEach(individual => {
      const wellness = individual.wellness_data || [];
      const vitalSigns = wellness.filter(w => w.type === 'vital_signs');
      const appointments = wellness.filter(w => w.type === 'appointment');
      
      const latestVitals = vitalSigns.length > 0 ? vitalSigns[vitalSigns.length - 1] : null;
      
      wellnessData.push({
        individualName: `${individual.firstname} ${individual.lastname}`,
        home: individual.homeassignment,
        lastVitalsDate: latestVitals ? new Date(latestVitals.date).toLocaleDateString() : 'Never',
        bloodPressure: latestVitals?.bloodPressure || 'N/A',
        heartRate: latestVitals?.heartRate || 'N/A',
        temperature: latestVitals?.temperature || 'N/A',
        oxygenSat: latestVitals?.oxygenSaturation || 'N/A',
        weight: latestVitals?.weight || 'N/A',
        upcomingAppts: appointments.filter(a => a.status === 'Scheduled').length,
        vitalsTrend: vitalSigns.length >= 2 ? 'Stable' : 'Insufficient Data',
        individual
      });
    });
    return wellnessData;
  };

  // Medical Alerts & Risk Plans Data
  const getMedicalAlertsData = () => {
    const alertsData = [];
    individuals.forEach(individual => {
      const medAlerts = individual.medicalalerts || [];
      const behavAlerts = individual.behavioralalerts || [];
      const riskPlans = individual.riskplans || [];
      
      const activeRiskPlans = riskPlans.filter(r => r.status === 'Active');
      
      alertsData.push({
        individualName: `${individual.firstname} ${individual.lastname}`,
        home: individual.homeassignment,
        primaryDiagnosis: individual.primarydiagnosis || 'N/A',
        medicalAlerts: medAlerts.filter(a => a.status === 'Active').length,
        behavioralAlerts: behavAlerts.filter(a => a.status === 'Active').length,
        activeRiskPlans: activeRiskPlans.length,
        highSeverityAlerts: medAlerts.filter(a => a.severity === 'High').length,
        lastReviewDate: activeRiskPlans.length > 0 ? new Date(activeRiskPlans[0].reviewdate).toLocaleDateString() : 'N/A',
        nextReviewDue: individual.nextreviewdate ? new Date(individual.nextreviewdate).toLocaleDateString() : 'N/A',
        riskFlag: (medAlerts.filter(a => a.severity === 'High').length > 0 || activeRiskPlans.length > 2) ? '🔴' : 
                   (medAlerts.length > 0 || activeRiskPlans.length > 0) ? '🟡' : '🟢',
        individual
      });
    });
    return alertsData;
  };

  const [currentPage, setCurrentPage] = useState('report');
  

  // Appointment Tracking Data
  const getAppointmentTrackingData = () => {
    const apptData = [];
    individuals.forEach(individual => {
      const wellness = individual.wellness_data || [];
      const appointments = wellness.filter(w => w.type === 'appointment');
      
      const scheduled = appointments.filter(a => a.status === 'Scheduled');
      const completed = appointments.filter(a => a.status === 'Completed');
      const upcoming = scheduled.filter(a => new Date(a.date) >= new Date());
      const overdue = scheduled.filter(a => new Date(a.date) < new Date());
      
      apptData.push({
        individualName: `${individual.firstname} ${individual.lastname}`,
        home: individual.homeassignment,
        scheduledAppts: scheduled.length,
        completedAppts: completed.length,
        upcomingAppts: upcoming.length,
        overdueAppts: overdue.length,
        nextApptDate: upcoming.length > 0 ? new Date(upcoming[0].date).toLocaleDateString() : 'None',
        nextApptProvider: upcoming.length > 0 ? upcoming[0].provider : 'N/A',
        complianceRate: (scheduled.length + completed.length) > 0 ? 
          Math.round((completed.length / (scheduled.length + completed.length)) * 100) : 100,
        riskFlag: overdue.length > 0 ? '🔴' : upcoming.length > 3 ? '🟡' : '🟢',
        individual
      });
    });
    return apptData;
  };

  // Lease Compliance Data
  const getLeaseComplianceData = () => {
    return individuals.map(individual => {
      const hasLease = individual.signed_by_individual || false;
      const leaseStart = individual.lease_start_date || null;
      const leaseEnd = individual.lease_end_date || null;
      
      const rightsRestrictions = individual.rightsrestrictions || [];
      const activeRestrictions = rightsRestrictions.filter(r => r.status === 'Active');
      
      return {
        name: `${individual.firstname} ${individual.lastname}`,
        home: individual.homeassignment,
        leaseStart: leaseStart ? new Date(leaseStart).toLocaleDateString() : 'N/A',
        leaseEnd: leaseEnd ? new Date(leaseEnd).toLocaleDateString() : 'N/A',
        leaseSigned: hasLease,
        leaseStatus: hasLease ? 'Active' : '🔴 Missing',
        activeRestrictions: activeRestrictions.length,
        admissionDate: new Date(individual.admissiondate).toLocaleDateString(),
        daysInHome: Math.floor((new Date() - new Date(individual.admissiondate)) / (1000 * 60 * 60 * 24)),
        complianceFlag: hasLease && activeRestrictions.length === 0 ? '🟢' : 
                        hasLease ? '🟡' : '🔴',
        individual
      };
    });
  };

  // Rights Restrictions Data
  const getRightsRestrictionsData = () => {
    const restrictionsData = [];
    individuals.forEach(individual => {
      const restrictions = individual.rightsrestrictions || [];
      
      if (restrictions.length === 0) {
        restrictionsData.push({
          individualName: `${individual.firstname} ${individual.lastname}`,
          home: individual.homeassignment,
          restrictionType: 'No Restrictions',
          status: 'N/A',
          approvedBy: 'N/A',
          reviewDate: 'N/A',
          justification: 'N/A',
          daysActive: 0,
          individual
        });
      } else {
        restrictions.forEach(restriction => {
          restrictionsData.push({
            individualName: `${individual.firstname} ${individual.lastname}`,
            home: individual.homeassignment,
            restrictionType: restriction.type || 'Unknown',
            status: restriction.status,
            approvedBy: restriction.approved_by || 'N/A',
            reviewDate: restriction.review_date ? new Date(restriction.review_date).toLocaleDateString() : 'N/A',
            justification: (restriction.justification || '').substring(0, 50) + '...',
            daysActive: restriction.effective_date ? 
              Math.floor((new Date() - new Date(restriction.effective_date)) / (1000 * 60 * 60 * 24)) : 0,
            individual
          });
        });
      }
    });
    return restrictionsData;
  };

  // QAPI Trend Data
  const getQAPITrendData = () => {
    const trendData = {};
    
    individuals.forEach(individual => {
      const home = individual.homeassignment || 'Unassigned';
      if (!trendData[home]) {
        trendData[home] = {
          home: home,
          totalIncidents: 0,
          medErrors: 0,
          behaviorEvents: 0,
          missedMeds: 0,
          communityOutings: 0,
          choiceDocumented: 0,
          totalEncounters: 0,
          individualsCount: 0
        };
      }
      
      trendData[home].individualsCount += 1;
      const incidents = individual.incidents || [];
      const dailyNotes = individual.dailynotes || [];
      const marHistory = individual.marhistory || [];
      const communityActivities = individual.community_activity_log || [];
      
      trendData[home].totalIncidents += incidents.length;
      trendData[home].medErrors += marHistory.filter(m => m.status === 'Error').length;
      trendData[home].behaviorEvents += dailyNotes.filter(n => n.behaviors && n.behaviors.length > 0).length;
      trendData[home].missedMeds += marHistory.filter(m => m.status === 'Missed').length;
      trendData[home].communityOutings += communityActivities.length;
      trendData[home].choiceDocumented += dailyNotes.filter(n => n.choiceOffered && n.choiceHonored).length;
      trendData[home].totalEncounters += dailyNotes.length;
    });
    
    return Object.values(trendData).map(data => ({
      ...data,
      choiceRate: data.totalEncounters > 0 ? 
        Math.round((data.choiceDocumented / data.totalEncounters) * 100) : 0,
      avgOutingsPerPerson: data.individualsCount > 0 ? 
        (data.communityOutings / data.individualsCount).toFixed(1) : 0,
      trendFlag: (data.totalIncidents > 5 || data.medErrors > 2) ? '🔴' : 
                 (data.totalIncidents > 2 || data.medErrors > 0) ? '🟡' : '🟢'
    }));
  };

  // Compliance Score Data
  const getComplianceScoreData = () => {
    return individuals.map(individual => {
      const dailyNotes = individual.dailynotes || [];
      const totalEncounters = dailyNotes.length;
      const goals = individual.goals || [];
      const activeGoals = goals.filter(g => g.status === 'Active');
      const communityActivities = individual.community_activity_log || [];
      const choiceDocumented = dailyNotes.filter(n => n.choiceOffered && n.choiceHonored).length;
      const hasLease = individual.signed_by_individual || false;
      
      let score = 0;
      if (totalEncounters > 0) score += 20;
      if (communityActivities.length >= 6) score += 20;
      if (totalEncounters > 0 && (choiceDocumented / totalEncounters) >= 0.8) score += 20;
      if (hasLease) score += 20;
      if (activeGoals.length > 0) score += 20;
      
      return {
        name: `${individual.firstname} ${individual.lastname}`,
        home: individual.homeassignment,
        complianceScore: score,
        documentation: totalEncounters > 0 ? '✔' : '❌',
        communityIntegration: communityActivities.length >= 6 ? '✔' : '❌',
        choiceAutonomy: (totalEncounters > 0 && (choiceDocumented / totalEncounters) >= 0.8) ? '✔' : '❌',
        hcbsLease: hasLease ? '✔' : '❌',
        activeISPGoals: activeGoals.length > 0 ? '✔' : '❌',
        riskLevel: score >= 80 ? '🟢 Low' : score >= 60 ? '🟡 Medium' : '🔴 High',
        individual
      };
    });
  };

  // Billing Readiness Data
  const calculateHours = (timeIn, timeOut) => {
    if (!timeIn || !timeOut) return 0;
    const [inHour, inMin] = timeIn.split(':').map(Number);
    const [outHour, outMin] = timeOut.split(':').map(Number);
    const hours = outHour - inHour + (outMin - inMin) / 60;
    return Math.max(0, hours).toFixed(1);
  };

  const getBillingReadinessData = () => {
    const billingData = [];
    individuals.forEach(individual => {
      const dailyNotes = individual.dailynotes || [];
      const incidents = individual.incidents || [];
      
      dailyNotes.forEach(note => {
        const hasOpenIncident = incidents.some(inc => 
          inc.status === 'Open' && 
          new Date(inc.dateoccurred).toDateString() === new Date(note.date).toDateString()
        );
        
        const isApproved = note.approved === true;
        const hasNarrative = note.narrative && note.narrative.trim().length > 0;
        const hasBillingValidation = note.billingValidated === true;
        
        billingData.push({
          encounterId: note.id?.substring(0, 8) || 'N/A',
          date: new Date(note.date).toLocaleDateString(),
          individualName: `${individual.firstname} ${individual.lastname}`,
          service: note.shift === 'Day' ? 'Community Support' : 'Residential Support',
          units: note.shiftTimeOut && note.shiftTimeIn ? 
            calculateHours(note.shiftTimeIn, note.shiftTimeOut) : 0,
          docStatus: hasBillingValidation && isApproved && hasNarrative ? 'Validated' : 'Incomplete',
          billingStatus: (hasBillingValidation && isApproved && hasNarrative && !hasOpenIncident) ? 'Ready' : 'HOLD',
          holdReason: hasOpenIncident ? 'Open Incident' : 
                      !isApproved ? 'Not Approved' : 
                      !hasNarrative ? 'Missing Narrative' :
                      !hasBillingValidation ? 'Not Validated' : '',
          ready: (hasBillingValidation && isApproved && hasNarrative && !hasOpenIncident) ? '✔' : '❌',
          individual
        });
      });
    });
    return billingData;
  };

  // ============================================
  // PRINT FUNCTIONS
  // ============================================

  const printReport = (title, subtitle, headers, data, period = true) => {
    const printWindow = window.open('', '', 'width=1200,height=800');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #059669; margin-bottom: 10px; }
            .header { margin-bottom: 30px; }
            .date { color: #666; font-size: 14px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #059669; color: white; padding: 12px; text-align: left; font-size: 12px; }
            td { border: 1px solid #ddd; padding: 10px; font-size: 11px; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .status-met { color: #059669; font-weight: bold; }
            .status-partial { color: #f59e0b; font-weight: bold; }
            .status-not-met { color: #dc2626; font-weight: bold; }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <p><strong>Beyond Barriers, LLC - DD Division</strong></p>
            <p><strong>${subtitle}</strong></p>
            ${period ? `<p class="date">Report Period: ${dateRange.start} - ${dateRange.end}</p>` : ''}
            <p class="date">Generated: ${new Date().toLocaleString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                ${headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${Object.values(row).slice(0, headers.length).map(val => `<td>${val}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const printCommunityIntegrationReport = () => {
    const data = getCommunityIntegrationData();
    printReport(
      'Community Integration Report',
      'HCBS Settings Rule – Community Access Proof',
      ['Individual', 'Home', 'Waiver', 'Activities', 'Avg Hrs/Week', 'ISP-Linked', 'Choice %', 'Last Outing', 'HCBS Status'],
      data.map(d => ({
        name: d.name,
        home: d.home,
        waiver: d.waiver,
        activities: d.communityActivities,
        avgHrs: d.avgHoursPerWeek,
        ispLinked: d.ispLinked,
        choice: d.choicePercent + '%',
        lastOuting: d.lastOuting,
        status: d.hcbsStatus
      }))
    );
  };

  const printChoiceAutonomyReport = () => {
    const data = getChoiceAutonomyData();
    printReport(
      'Choice & Autonomy Documentation Report',
      'HCBS Core Requirement',
      ['Individual', 'Total Encounters', 'Choice Documented', 'Choice %', 'Lease Signed', 'Complaints (12mo)', 'Open Complaints', 'Acknowledgments', 'Risk Flag'],
      data.map(d => ({
        name: d.name,
        encounters: d.totalEncounters,
        documented: d.choiceDocumented,
        percent: d.choicePercent + '%',
        lease: d.leaseSigned ? 'Yes' : 'No',
        complaints: d.complaints12Mo,
        open: d.openComplaints,
        ack: d.choiceAcknowledgments,
        risk: d.riskFlag
      }))
    );
  };

  const printISPGoalReport = () => {
    const data = getISPGoalData();
    printReport(
      'ISP Goal Implementation Report',
      'Evidence of Service Alignment',
      ['Individual', 'ISP Goal', 'Status', 'Linked Encounters', 'Total Hours', 'Avg/Month', 'Last Session'],
      data.map(d => ({
        name: d.individualName,
        goal: d.ispGoal,
        status: d.goalStatus,
        encounters: d.linkedEncounters,
        hours: d.totalHours,
        avg: d.avgPerMonth,
        last: d.lastSession
      }))
    );
  };

  const printIncidentReport = () => {
    const data = getIncidentData();
    printReport(
      'Incident Log Report (IPMS)',
      'Alabama DMH IPMS Reporting',
      ['Individual', 'Home', 'Total', 'Open', 'Closed', 'Avg Days to Close', 'Critical Open', 'Risk'],
      data.map(d => ({
        name: d.name,
        home: d.home,
        total: d.totalIncidents,
        open: d.openIncidents,
        closed: d.closedIncidents,
        avg: d.avgDaysToClose,
        critical: d.criticalOpen,
        risk: d.riskFlag
      }))
    );
  };

  const printMedicationReport = () => {
    const data = getMedicationData();
    printReport(
      'MAR Administration Summary',
      'Medication Administration Compliance',
      ['Individual', 'Medication', 'Scheduled', 'Given', 'Missed', 'Late', 'Adherence %', 'Last Miss'],
      data.map(d => ({
        name: d.individualName,
        med: d.medicationname,
        scheduled: d.scheduled,
        given: d.given,
        missed: d.missed,
        late: d.late,
        adherence: d.adherence + '%',
        lastMiss: d.lastMiss
      }))
    );
  };

  const printWellnessVitalsReport = () => {
    const data = getWellnessVitalsData();
    printReport(
      'Wellness & Vital Signs Tracking Report',
      'Clinical Health Monitoring',
      ['Individual', 'Home', 'Last Vitals', 'BP', 'HR', 'Temp', 'O2 Sat', 'Weight', 'Upcoming Appts', 'Trend'],
      data.map(d => ({
        name: d.individualName,
        home: d.home,
        date: d.lastVitalsDate,
        bp: d.bloodPressure,
        hr: d.heartRate,
        temp: d.temperature,
        o2: d.oxygenSat,
        weight: d.weight,
        appts: d.upcomingAppts,
        trend: d.vitalsTrend
      }))
    );
  };

  const printMedicalAlertsReport = () => {
    const data = getMedicalAlertsData();
    printReport(
      'Medical Alerts & Risk Plans Report',
      'Active Alerts & Risk Management',
      ['Individual', 'Home', 'Diagnosis', 'Medical Alerts', 'Behavioral Alerts', 'Risk Plans', 'High Severity', 'Last Review', 'Next Review', 'Risk'],
      data.map(d => ({
        name: d.individualName,
        home: d.home,
        dx: d.primaryDiagnosis,
        medAlerts: d.medicalAlerts,
        behavAlerts: d.behavioralAlerts,
        riskPlans: d.activeRiskPlans,
        highSev: d.highSeverityAlerts,
        lastReview: d.lastReviewDate,
        nextReview: d.nextReviewDue,
        risk: d.riskFlag
      }))
    );
  };

  const printAppointmentTrackingReport = () => {
    const data = getAppointmentTrackingData();
    printReport(
      'Appointment Tracking Report',
      'Medical Appointment Compliance',
      ['Individual', 'Home', 'Scheduled', 'Completed', 'Upcoming', 'Overdue', 'Next Appt', 'Provider', 'Compliance %', 'Status'],
      data.map(d => ({
        name: d.individualName,
        home: d.home,
        scheduled: d.scheduledAppts,
        completed: d.completedAppts,
        upcoming: d.upcomingAppts,
        overdue: d.overdueAppts,
        nextDate: d.nextApptDate,
        provider: d.nextApptProvider,
        compliance: d.complianceRate + '%',
        status: d.riskFlag
      }))
    );
  };

  const printLeaseComplianceReport = () => {
    const data = getLeaseComplianceData();
    printReport(
      'Lease & Residency Status Report',
      'HCBS Residential Rights Compliance',
      ['Individual', 'Home', 'Lease Start', 'Lease End', 'Signed', 'Status', 'Restrictions', 'Admission', 'Days in Home', 'Compliance'],
      data.map(d => ({
        name: d.name,
        home: d.home,
        start: d.leaseStart,
        end: d.leaseEnd,
        signed: d.leaseSigned ? 'Yes' : 'No',
        status: d.leaseStatus,
        restrictions: d.activeRestrictions,
        admission: d.admissionDate,
        days: d.daysInHome,
        compliance: d.complianceFlag
      }))
    );
  };

  const printRightsRestrictionsReport = () => {
    const data = getRightsRestrictionsData();
    printReport(
      'Rights Restrictions Report',
      'HCBS Rights & Restrictions Tracking',
      ['Individual', 'Home', 'Type', 'Status', 'Approved By', 'Review Date', 'Justification', 'Days Active'],
      data.map(d => ({
        name: d.individualName,
        home: d.home,
        type: d.restrictionType,
        status: d.status,
        approved: d.approvedBy,
        review: d.reviewDate,
        justification: d.justification,
        days: d.daysActive
      }))
    );
  };

  const printQAPITrendReport = () => {
    const data = getQAPITrendData();
    printReport(
      'QAPI Trend Analysis Report',
      'Quality Indicators by Home',
      ['Home', 'Individuals', 'Incidents', 'Med Errors', 'Behavior Events', 'Missed Meds', 'Outings', 'Avg Outings/Person', 'Choice %', 'Trend'],
      data.map(d => ({
        home: d.home,
        count: d.individualsCount,
        incidents: d.totalIncidents,
        medErrors: d.medErrors,
        behavior: d.behaviorEvents,
        missed: d.missedMeds,
        outings: d.communityOutings,
        avg: d.avgOutingsPerPerson,
        choice: d.choiceRate + '%',
        trend: d.trendFlag
      }))
    );
  };

  const printComplianceScoreReport = () => {
    const data = getComplianceScoreData();
    printReport(
      'Individual Compliance Score Summary Report',
      '5-Point HCBS Compliance Framework',
      ['Individual', 'Home', 'Score', 'Documentation', 'Community', 'Choice', 'Lease', 'ISP Goals', 'Risk Level'],
      data.map(d => ({
        name: d.name,
        home: d.home,
        score: d.complianceScore,
        doc: d.documentation,
        community: d.communityIntegration,
        choice: d.choiceAutonomy,
        lease: d.hcbsLease,
        goals: d.activeISPGoals,
        risk: d.riskLevel
      }))
    );
  };

  const printBillingReadinessReport = () => {
    const data = getBillingReadinessData();
    printReport(
      'Billing Readiness Report',
      'Billing Validation Status',
      ['Encounter ID', 'Date', 'Individual', 'Service', 'Units', 'Doc Status', 'Billing Status', 'Hold Reason', 'Ready'],
      data.map(d => ({
        id: d.encounterId,
        date: d.date,
        name: d.individualName,
        service: d.service,
        units: d.units,
        docStatus: d.docStatus,
        billStatus: d.billingStatus,
        holdReason: d.holdReason,
        ready: d.ready
      }))
    );
  };

  // ============================================
  // REPORT COMPONENTS
  // ============================================

  const CommunityIntegrationReport = () => {
    const data = getCommunityIntegrationData();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">Community Integration Report</h3>
            <p className="text-slate-400">HCBS Settings Rule – Community Access Proof</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={printCommunityIntegrationReport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
            >
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Individual</th>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Home</th>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Waiver</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Activities</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Avg Hrs/Week</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">ISP-Linked</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Choice %</th>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Last Outing</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">HCBS Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 text-white font-medium">{row.name}</td>
                    <td className="py-4 px-4 text-slate-300">{row.home}</td>
                    <td className="py-4 px-4 text-slate-300">{row.waiver}</td>
                    <td className="py-4 px-4 text-center text-emerald-400 font-bold">{row.communityActivities}</td>
                    <td className="py-4 px-4 text-center text-white">{row.avgHoursPerWeek}</td>
                    <td className="py-4 px-4 text-center text-white">{row.ispLinked}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        row.choicePercent >= 80 ? 'bg-green-900/30 text-green-400' :
                        row.choicePercent >= 50 ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-red-900/30 text-red-400'
                      }`}>
                        {row.choicePercent}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-300">{row.lastOuting}</td>
                    <td className="py-4 px-4 text-center text-lg">{row.hcbsStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-green-400" size={20} />
              <span className="text-green-400 font-bold">Fully Met</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {data.filter(d => d.hcbsStatus.includes('Fully Met')).length}
            </p>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="text-yellow-400" size={20} />
              <span className="text-yellow-400 font-bold">Partial</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {data.filter(d => d.hcbsStatus.includes('Partial')).length}
            </p>
          </div>
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="text-red-400" size={20} />
              <span className="text-red-400 font-bold">Not Met</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {data.filter(d => d.hcbsStatus.includes('Not Met')).length}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const ChoiceAutonomyReport = () => {
    const data = getChoiceAutonomyData();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">Choice & Autonomy Documentation</h3>
            <p className="text-slate-400">HCBS Core Requirement</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={printChoiceAutonomyReport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
            >
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Individual</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Total Encounters</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Choice Documented</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Choice %</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Lease Signed</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Complaints (12mo)</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Open Complaints</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Acknowledgments</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Risk Flag</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 text-white font-medium">{row.name}</td>
                    <td className="py-4 px-4 text-center text-white">{row.totalEncounters}</td>
                    <td className="py-4 px-4 text-center text-white">{row.choiceDocumented}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        row.choicePercent >= 80 ? 'bg-green-900/30 text-green-400' :
                        row.choicePercent >= 50 ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-red-900/30 text-red-400'
                      }`}>
                        {row.choicePercent}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.leaseSigned ? (
                        <CheckCircle className="text-green-400 mx-auto" size={20} />
                      ) : (
                        <XCircle className="text-red-400 mx-auto" size={20} />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-white">{row.complaints12Mo}</td>
                    <td className="py-4 px-4 text-center text-white">{row.openComplaints}</td>
                    <td className="py-4 px-4 text-center text-emerald-400 font-bold">{row.choiceAcknowledgments}</td>
                    <td className="py-4 px-4 text-center text-2xl">{row.riskFlag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const ISPGoalReport = () => {
    const data = getISPGoalData();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">ISP Goal Implementation</h3>
            <p className="text-slate-400">Evidence of Service Alignment</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={printISPGoalReport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
            >
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Individual</th>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">ISP Goal</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Status</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Linked Encounters</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Total Hours</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Avg/Month</th>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Last Session</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 text-white font-medium">{row.individualName}</td>
                    <td className="py-4 px-4 text-slate-300">{row.ispGoal}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        row.goalStatus === 'Active' ? 'bg-green-900/30 text-green-400' :
                        row.goalStatus === 'N/A' ? 'bg-slate-700 text-slate-300' :
                        'bg-blue-900/30 text-blue-400'
                      }`}>
                        {row.goalStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-emerald-400 font-bold">{row.linkedEncounters}</td>
                    <td className="py-4 px-4 text-center text-white">{row.totalHours}</td>
                    <td className="py-4 px-4 text-center text-white">{row.avgPerMonth}</td>
                    <td className="py-4 px-4 text-slate-300">{row.lastSession}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
          <p className="text-blue-400 font-semibold mb-2">
            🔎 Audit Question Answered: "Are ISP goals actually being worked on?"
          </p>
          <p className="text-slate-300 text-sm">
            This report demonstrates direct evidence linking daily service delivery to individualized support plan goals, 
            ensuring compliance with HCBS requirements for person-centered planning.
          </p>
        </div>
      </div>
    );
  };

  const IncidentLogReport = () => {
    const data = getIncidentData();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">Incident Log (IPMS)</h3>
            <p className="text-slate-400">Alabama DMH IPMS Reporting</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={printIncidentReport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
            >
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Individual</th>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Home</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Total</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Open</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Closed</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Avg Days to Close</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Critical Open</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Risk</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 text-white font-medium">{row.name}</td>
                    <td className="py-4 px-4 text-slate-300">{row.home}</td>
                    <td className="py-4 px-4 text-center text-white">{row.totalIncidents}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        row.openIncidents > 0 ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'
                      }`}>
                        {row.openIncidents}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-white">{row.closedIncidents}</td>
                    <td className="py-4 px-4 text-center text-white">{row.avgDaysToClose}</td>
                    <td className="py-4 px-4 text-center">
                      {row.criticalOpen > 0 ? (
                        <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-900/30 text-red-400">
                          {row.criticalOpen}
                        </span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-2xl">{row.riskFlag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {data.some(d => d.criticalOpen > 0) && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-red-400" size={20} />
              <span className="text-red-400 font-bold">
                Critical Alert: {data.filter(d => d.criticalOpen > 0).length} individual(s) with open critical incidents
              </span>
            </div>
            <p className="text-slate-300 text-sm">
              Immediate review and resolution required for IPMS compliance.
            </p>
          </div>
        )}
      </div>
    );
  };

  const MedicationReport = () => {
    const data = getMedicationData();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">MAR Administration Summary</h3>
            <p className="text-slate-400">Medication Administration Compliance</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={printMedicationReport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
            >
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Individual</th>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Medication</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Scheduled</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Given</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Missed</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Late</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Adherence %</th>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Last Miss</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 text-white font-medium">{row.individualName}</td>
                    <td className="py-4 px-4 text-slate-300">{row.medicationname}</td>
                    <td className="py-4 px-4 text-center text-white">{row.scheduled}</td>
                    <td className="py-4 px-4 text-center text-white">{row.given}</td>
                    <td className="py-4 px-4 text-center">
                      {row.missed > 0 ? (
                        <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-900/30 text-red-400">
                          {row.missed}
                        </span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-white">{row.late}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        parseFloat(row.adherence) >= 95 ? 'bg-green-900/30 text-green-400' :
                        parseFloat(row.adherence) >= 85 ? 'bg-yellow-900/30 text-yellow-400' :
                        row.adherence === 'N/A' ? 'bg-slate-700 text-slate-300' :
                        'bg-red-900/30 text-red-400'
                      }`}>
                        {row.adherence}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-300">{row.lastMiss}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-1">Excellent Adherence (≥95%)</p>
            <p className="text-2xl font-bold text-white">
              {data.filter(d => parseFloat(d.adherence) >= 95).length}
            </p>
          </div>
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-1">Needs Monitoring (85-94%)</p>
            <p className="text-2xl font-bold text-white">
              {data.filter(d => parseFloat(d.adherence) >= 85 && parseFloat(d.adherence) < 95).length}
            </p>
          </div>
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-1">Critical (&lt;85%)</p>
            <p className="text-2xl font-bold text-white">
              {data.filter(d => parseFloat(d.adherence) < 85 && d.adherence !== 'N/A').length}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const WellnessVitalsReport = () => {
    const data = getWellnessVitalsData();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">Wellness & Vital Signs Tracking</h3>
            <p className="text-slate-400">Clinical Health Monitoring</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={printWellnessVitalsReport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
            >
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Individual</th>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Home</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Last Vitals</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">BP</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">HR</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Temp (°F)</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">O2 Sat %</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Weight</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Upcoming Appts</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Trend</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 text-white font-medium">{row.individualName}</td>
                    <td className="py-4 px-4 text-slate-300">{row.home}</td>
                    <td className="py-4 px-4 text-center text-slate-300">{row.lastVitalsDate}</td>
                    <td className="py-4 px-4 text-center text-white">{row.bloodPressure}</td>
                    <td className="py-4 px-4 text-center text-white">{row.heartRate}</td>
                    <td className="py-4 px-4 text-center text-white">{row.temperature}</td>
                    <td className="py-4 px-4 text-center text-white">{row.oxygenSat}</td>
                    <td className="py-4 px-4 text-center text-white">{row.weight}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        row.upcomingAppts > 0 ? 'bg-blue-900/30 text-blue-400' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {row.upcomingAppts}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-slate-300">{row.vitalsTrend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const MedicalAlertsReport = () => {
    const data = getMedicalAlertsData();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">Medical Alerts & Risk Plans</h3>
            <p className="text-slate-400">Active Alerts & Risk Management</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={printMedicalAlertsReport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
            >
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Individual</th>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Home</th>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Primary Diagnosis</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Medical Alerts</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Behavioral Alerts</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Active Risk Plans</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">High Severity</th>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Last Review</th>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Next Review</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Risk</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 text-white font-medium">{row.individualName}</td>
                    <td className="py-4 px-4 text-slate-300">{row.home}</td>
                    <td className="py-4 px-4 text-slate-300">{row.primaryDiagnosis}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        row.medicalAlerts > 0 ? 'bg-orange-900/30 text-orange-400' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {row.medicalAlerts}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        row.behavioralAlerts > 0 ? 'bg-purple-900/30 text-purple-400' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {row.behavioralAlerts}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-white">{row.activeRiskPlans}</td>
                    <td className="py-4 px-4 text-center">
                      {row.highSeverityAlerts > 0 ? (
                        <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-900/30 text-red-400">
                          {row.highSeverityAlerts}
                        </span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-300">{row.lastReviewDate}</td>
                    <td className="py-4 px-4 text-slate-300">{row.nextReviewDue}</td>
                    <td className="py-4 px-4 text-center text-2xl">{row.riskFlag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {data.filter(d => d.riskFlag === '🔴').length > 0 && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-red-400" size={20} />
              <span className="text-red-400 font-bold">
                High Risk Alert: {data.filter(d => d.riskFlag === '🔴').length} individual(s) require immediate review
              </span>
            </div>
            <p className="text-slate-300 text-sm">
              Multiple high-severity alerts or overdue risk plan reviews detected.
            </p>
          </div>
        )}
      </div>
    );
  };

  const AppointmentTrackingReport = () => {
    const data = getAppointmentTrackingData();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">Appointment Tracking</h3>
            <p className="text-slate-400">Medical Appointment Compliance</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={printAppointmentTrackingReport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
            >
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Individual</th>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Home</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Scheduled</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Completed</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Upcoming</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Overdue</th>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Next Appt</th>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Provider</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Compliance %</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 text-white font-medium">{row.individualName}</td>
                    <td className="py-4 px-4 text-slate-300">{row.home}</td>
                    <td className="py-4 px-4 text-center text-white">{row.scheduledAppts}</td>
                    <td className="py-4 px-4 text-center text-white">{row.completedAppts}</td>
                    <td className="py-4 px-4 text-center text-white">{row.upcomingAppts}</td>
                    <td className="py-4 px-4 text-center">
                      {row.overdueAppts > 0 ? (
                        <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-900/30 text-red-400">
                          {row.overdueAppts}
                        </span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-300">{row.nextApptDate}</td>
                    <td className="py-4 px-4 text-slate-300">{row.nextApptProvider}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        row.complianceRate >= 90 ? 'bg-green-900/30 text-green-400' :
                        row.complianceRate >= 75 ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-red-900/30 text-red-400'
                      }`}>
                        {row.complianceRate}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-2xl">{row.riskFlag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-1">Total Upcoming</p>
            <p className="text-2xl font-bold text-white">
              {data.reduce((acc, d) => acc + d.upcomingAppts, 0)}
            </p>
          </div>
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-1">Completed</p>
            <p className="text-2xl font-bold text-white">
              {data.reduce((acc, d) => acc + d.completedAppts, 0)}
            </p>
          </div>
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-1">Overdue</p>
            <p className="text-2xl font-bold text-white">
              {data.reduce((acc, d) => acc + d.overdueAppts, 0)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const LeaseComplianceReport = () => {
    const data = getLeaseComplianceData();
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">Lease & Residency Status</h3>
            <p className="text-slate-400">HCBS Residential Rights Compliance</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={printLeaseComplianceReport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
            >
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Individual</th>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Home</th>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Lease Start</th>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Lease End</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Signed</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Status</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Restrictions</th>
                  <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Admission</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Days in Home</th>
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Compliance</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 text-white font-medium">{row.name}</td>
                    <td className="py-4 px-4 text-slate-300">{row.home}</td>
                    <td className="py-4 px-4 text-slate-300">{row.leaseStart}</td>
                    <td className="py-4 px-4 text-slate-300">{row.leaseEnd}</td>
                    <td className="py-4 px-4 text-center">
                      {row.leaseSigned ? (
                        <CheckCircle className="text-green-400 mx-auto" size={20} />
                      ) : (
                        <XCircle className="text-red-400 mx-auto" size={20} />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={row.leaseStatus.includes('🔴') ? 'text-red-400 font-bold' : 'text-green-400'}>
                        {row.leaseStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.activeRestrictions > 0 ? (
                        <span className="px-3 py-1 rounded-full text-sm font-bold bg-yellow-900/30 text-yellow-400">
                          {row.activeRestrictions}
                        </span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-300">{row.admissionDate}</td>
                    <td className="py-4 px-4 text-center text-white">{row.daysInHome}</td>
                    <td className="py-4 px-4 text-center text-2xl">{row.complianceFlag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-green-400" size={20} />
              <span className="text-green-400 font-bold">Fully Compliant</span>
            </div>
            <p className="text-2xl font-bold text-white">
{data.filter(d => d.complianceFlag === '🟢').length}
</p>
</div>
<div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4">
<div className="flex items-center gap-2 mb-2">
<AlertCircle className="text-yellow-400" size={20} />
<span className="text-yellow-400 font-bold">Needs Attention</span>
</div>
<p className="text-2xl font-bold text-white">
{data.filter(d => d.complianceFlag === '🟡').length}
</p>
</div>
<div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
<div className="flex items-center gap-2 mb-2">
<XCircle className="text-red-400" size={20} />
<span className="text-red-400 font-bold">Missing Lease</span>
</div>
<p className="text-2xl font-bold text-white">
{data.filter(d => d.complianceFlag === '🔴').length}
</p>
</div>
</div>
</div>
);
};
const RightsRestrictionsReport = () => {
const data = getRightsRestrictionsData();
return (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-2xl font-bold text-white">Rights Restrictions</h3>
        <p className="text-slate-400">HCBS Rights & Restrictions Tracking</p>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={printRightsRestrictionsReport}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
        >
          <Printer size={16} />
          Print
        </button>
      </div>
    </div>

    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Individual</th>
              <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Home</th>
              <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Type</th>
              <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Status</th>
              <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Approved By</th>
              <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Review Date</th>
              <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Justification</th>
              <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Days Active</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-t border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                <td className="py-4 px-4 text-white font-medium">{row.individualName}</td>
                <td className="py-4 px-4 text-slate-300">{row.home}</td>
                <td className="py-4 px-4 text-slate-300">{row.restrictionType}</td>
                <td className="py-4 px-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    row.status === 'Active' ? 'bg-yellow-900/30 text-yellow-400' :
                    row.status === 'N/A' ? 'bg-slate-700 text-slate-300' :
                    'bg-green-900/30 text-green-400'
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-slate-300">{row.approvedBy}</td>
                <td className="py-4 px-4 text-slate-300">{row.reviewDate}</td>
                <td className="py-4 px-4 text-slate-300">{row.justification}</td>
                <td className="py-4 px-4 text-center text-white">{row.daysActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {data.filter(d => d.status === 'Active').length > 0 && (
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="text-yellow-400" size={20} />
          <span className="text-yellow-400 font-bold">
            Active Restrictions: {data.filter(d => d.status === 'Active').length} restriction(s) in place
          </span>
        </div>
        <p className="text-slate-300 text-sm">
          All restrictions must be reviewed regularly and documented with proper justification per HCBS requirements.
        </p>
      </div>
    )}
  </div>
);
};
const QAPITrendReport = () => {
const data = getQAPITrendData();
return (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-2xl font-bold text-white">QAPI Trend Analysis</h3>
        <p className="text-slate-400">Quality Indicators by Home</p>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={printQAPITrendReport}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
        >
          <Printer size={16} />
          Print
        </button>
      </div>
    </div>

    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Home</th>
              <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Individuals</th>
              <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Incidents</th>
              <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Med Errors</th>
              <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Behavior Events</th>
              <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Missed Meds</th>
              <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Outings</th>
              <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Avg/Person</th>
              <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Choice %</th>
              <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Trend</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-t border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                <td className="py-4 px-4 text-white font-medium">{row.home}</td>
                <td className="py-4 px-4 text-center text-white">{row.individualsCount}</td>
                <td className="py-4 px-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    row.totalIncidents > 5 ? 'bg-red-900/30 text-red-400' :
                    row.totalIncidents > 2 ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-green-900/30 text-green-400'
                  }`}>
                    {row.totalIncidents}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  {row.medErrors > 0 ? (
                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-900/30 text-red-400">
                      {row.medErrors}
                    </span>
                  ) : (
                    <span className="text-slate-500">0</span>
                  )}
                </td>
                <td className="py-4 px-4 text-center text-white">{row.behaviorEvents}</td>
                <td className="py-4 px-4 text-center text-white">{row.missedMeds}</td>
                <td className="py-4 px-4 text-center text-white">{row.communityOutings}</td>
                <td className="py-4 px-4 text-center text-white">{row.avgOutingsPerPerson}</td>
                <td className="py-4 px-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    row.choiceRate >= 80 ? 'bg-green-900/30 text-green-400' :
                    row.choiceRate >= 60 ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-red-900/30 text-red-400'
                  }`}>
                    {row.choiceRate}%
                  </span>
                </td>
                <td className="py-4 px-4 text-center text-2xl">{row.trendFlag}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
      <p className="text-blue-400 font-semibold mb-2">
        📊 QAPI Insight
      </p>
      <p className="text-slate-300 text-sm">
        This report provides aggregate quality indicators by home location, enabling administrators to identify 
        trends, compare performance across sites, and drive continuous quality improvement initiatives.
      </p>
    </div>
  </div>
);
};
const ComplianceScoreReport = () => {
const data = getComplianceScoreData();
return (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-2xl font-bold text-white">Individual Compliance Score Summary</h3>
        <p className="text-slate-400">5-Point HCBS Compliance Framework</p>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={printComplianceScoreReport}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
        >
          <Printer size={16} />
          Print
        </button>
      </div>
    </div>

    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Individual</th>
              <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Home</th>
              <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Score</th>
              <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Documentation</th>
              <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Community</th>
              <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Choice</th>
              <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Lease</th>
              <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">ISP Goals</th>
              <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-t border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                <td className="py-4 px-4 text-white font-medium">{row.name}</td>
                <td className="py-4 px-4 text-slate-300">{row.home}</td>
                <td className="py-4 px-4 text-center">
                  <span className={`text-2xl font-bold ${
                    row.complianceScore >= 80 ? 'text-green-400' :
                    row.complianceScore >= 60 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {row.complianceScore}
                  </span>
                </td>
                <td className="py-4 px-4 text-center text-xl">
                  {row.documentation === '✔' ? (
                    <CheckCircle className="text-green-400 mx-auto" size={20} />
                  ) : (
                    <XCircle className="text-red-400 mx-auto" size={20} />
                  )}
                </td>
                <td className="py-4 px-4 text-center text-xl">
                  {row.communityIntegration === '✔' ? (
                    <CheckCircle className="text-green-400 mx-auto" size={20} />
                  ) : (
                    <XCircle className="text-red-400 mx-auto" size={20} />
                  )}
                </td>
                <td className="py-4 px-4 text-center text-xl">
                  {row.choiceAutonomy === '✔' ? (
                    <CheckCircle className="text-green-400 mx-auto" size={20} />
                  ) : (
                    <XCircle className="text-red-400 mx-auto" size={20} />
                  )}
                </td>
                <td className="py-4 px-4 text-center text-xl">
                  {row.hcbsLease === '✔' ? (
                    <CheckCircle className="text-green-400 mx-auto" size={20} />
                  ) : (
                    <XCircle className="text-red-400 mx-auto" size={20} />
                  )}
                </td>
                <td className="py-4 px-4 text-center text-xl">
                  {row.activeISPGoals === '✔' ? (
                    <CheckCircle className="text-green-400 mx-auto" size={20} />
                  ) : (
                    <XCircle className="text-red-400 mx-auto" size={20} />
                  )}
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    row.riskLevel.includes('🟢') ? 'bg-green-900/30 text-green-400' :
                    row.riskLevel.includes('🟡') ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-red-900/30 text-red-400'
                  }`}>
                    {row.riskLevel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4">
      <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">Low Risk (80-100)</p>
        <p className="text-2xl font-bold text-white">
          {data.filter(d => d.complianceScore >= 80).length}
        </p>
      </div>
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">Medium Risk (60-79)</p>
        <p className="text-2xl font-bold text-white">
          {data.filter(d => d.complianceScore >= 60 && d.complianceScore < 80).length}
        </p>
      </div>
      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">High Risk (&lt;60)</p>
        <p className="text-2xl font-bold text-white">
          {data.filter(d => d.complianceScore < 60).length}
        </p>
      </div>
    </div>
  </div>
);
};
const BillingReadinessReport = () => {
const data = getBillingReadinessData();
return (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-2xl font-bold text-white">Billing Readiness Report</h3>
        <p className="text-slate-400">Billing Validation Status</p>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={printBillingReadinessReport}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
        >
          <Printer size={16} />
          Print
        </button>
      </div>
    </div>

    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Encounter ID</th>
              <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Date</th>
              <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Individual</th>
              <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Service</th>
              <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Units</th>
              <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Doc Status</th>
              <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Billing Status</th>
              <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Hold Reason</th>
              <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Ready</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-t border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                <td className="py-4 px-4 text-white font-mono text-sm">{row.encounterId}</td>
                <td className="py-4 px-4 text-slate-300">{row.date}</td>
                <td className="py-4 px-4 text-white font-medium">{row.individualName}</td>
                <td className="py-4 px-4 text-slate-300">{row.service}</td>
                <td className="py-4 px-4 text-center text-white">{row.units}</td>
                <td className="py-4 px-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    row.docStatus === 'Validated' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {row.docStatus}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    row.billingStatus === 'Ready' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                  }`}>
                    {row.billingStatus}
                  </span>
                </td>
                <td className="py-4 px-4 text-slate-300">{row.holdReason || '-'}</td>
                <td className="py-4 px-4 text-center text-xl">
                  {row.ready === '✔' ? (
                    <CheckCircle className="text-green-400 mx-auto" size={20} />
                  ) : (
                    <XCircle className="text-red-400 mx-auto" size={20} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">Ready for Billing</p>
        <p className="text-2xl font-bold text-white">
          {data.filter(d => d.billingStatus === 'Ready').length}
        </p>
      </div>
      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">On Hold</p>
        <p className="text-2xl font-bold text-white">
          {data.filter(d => d.billingStatus === 'HOLD').length}
        </p>
      </div>
    </div>
  </div>
);
};
// ============================================
// NAVIGATION COMPONENTS
// ============================================
const NavBar = () => (
<div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-900/20 backdrop-blur-xl border-b border-slate-800/50 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-2xl">
<div className="flex items-center gap-4">
<button
onClick={() => setSidebarOpen(!sidebarOpen)}
className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-all duration-300"
>
{sidebarOpen ? <X size={20} /> : <Menu size={20} />}
</button>
<div className="flex items-center gap-3">
<div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/50">
<FileText className="text-white" size={26} />
</div>
<div>
<h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
Reports & Compliance
</h1>
<p className="text-xs text-slate-400 font-medium">Beyond Barriers, LLC • DD Division</p>
</div>
</div>
</div>
<div className="flex items-center gap-4">
    <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
      <Calendar size={16} className="text-emerald-400" />
      <span>Period: {dateRange.start} - {dateRange.end}</span>
    </div>
    
    {auditMode && (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-900/30 border border-yellow-500/50 rounded-lg">
        <Lock size={16} className="text-yellow-400" />
        <span className="text-yellow-400 text-sm font-bold">AUDIT MODE</span>
      </div>
    )}
    
    <button className="relative p-2.5 hover:bg-white/10 rounded-xl transition-all duration-300">
      <Bell size={20} className="text-slate-300" />
      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
    </button>
    
    <div className="flex items-center gap-3 pl-4 border-l border-slate-700/50">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-semibold text-white">{userProfile?.fullname || 'User'}</p>
        <p className="text-xs text-slate-400">{userProfile?.role_name || 'Staff'}</p>
      </div>
      <UserButton afterSignOutUrl="/" />
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
// ============================================
// MAIN RENDER
// ============================================
if (loading) {
return (
<div className="flex items-center justify-center h-screen bg-slate-950">
<div className="text-center">
<RefreshCw className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-4" />
<p className="text-slate-400 text-lg">Loading reports...</p>
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
<ScrollArea className="h-full ">
<main className="p-6 lg:p-8 ">
<div className="space-y-8">
{/* Header */}
<div className="flex items-center justify-between">
<div>
<h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
Reports & Compliance Center
</h2>
<p className="text-slate-400 text-lg mt-2">
Organization: Beyond Barriers, LLC • User: {userProfile?.fullname || 'User'} • Role: {userProfile?.role_name || 'Staff'}
</p>
</div>
<button
onClick={() => router.push('/dashboard')}
className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all"
>
<ChevronLeft size={18} />
Dashboard
</button>
</div>
{/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-emerald-600/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="text-emerald-400" size={24} />
                  <span className="text-slate-300 text-sm font-medium">Total Individuals</span>
                </div>
                <p className="text-4xl font-black text-white">{individuals.length}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-600/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="text-green-400" size={24} />
                  <span className="text-slate-300 text-sm font-medium">HCBS Compliant</span>
                </div>
                <p className="text-4xl font-black text-white">
                  {getCommunityIntegrationData().filter(d => d.hcbsStatus.includes('Fully Met')).length}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="text-blue-400" size={24} />
                  <span className="text-slate-300 text-sm font-medium">Active Goals</span>
                </div>
                <p className="text-4xl font-black text-white">
                  {individuals.reduce((acc, ind) => acc + (ind.goals?.filter(g => g.status === 'Active').length || 0), 0)}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-red-600/20 to-orange-500/20 border border-red-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="text-red-400" size={24} />
                  <span className="text-slate-300 text-sm font-medium">Open Incidents</span>
                </div>
                <p className="text-4xl font-black text-white">
                  {getIncidentData().reduce((acc, ind) => acc + ind.openIncidents, 0)}
                </p>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                <label className="block text-slate-400 text-sm font-medium mb-1">Home Filter</label>
                <select
                  value={homeFilter}
                  onChange={(e) => setHomeFilter(e.target.value)}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Homes</option>
                  {getUniqueHomes().map(home => (
                    <option key={home} value={home}>{home}</option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                <label className="block text-slate-400 text-sm font-medium mb-1">Status Filter</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Statuses</option>
                  {getStatusOptions().map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                <label className="block text-slate-400 text-sm font-medium mb-1">Date Filter</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex items-end">
                <button
                  onClick={() => {
                    setHomeFilter('all');
                    setStatusFilter('all');
                    setDateFilter('all');
                  }}
                  className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            <ScrollArea className='w-[75vw]'>
            <div className="border-b border-slate-700 ">
              <div className="flex gap-4 overflow-x-auto ">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? `border-${tab.color}-500 text-${tab.color}-400`
                          : 'border-transparent text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-semibold">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
           

            {/* Report Content */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-8">
              {activeTab === 'HCBS' && (
                <div className="space-y-8">
                  <CommunityIntegrationReport />
                  <div className="border-t border-slate-700 pt-8">
                    <ChoiceAutonomyReport />
                  </div>
                  <div className="border-t border-slate-700 pt-8">
                    <ISPGoalReport />
                  </div>
                </div>
              )}

              {activeTab === 'Clinical' && (
                <div className="space-y-8">
                  <WellnessVitalsReport />
                  <div className="border-t border-slate-700 pt-8">
                    <MedicalAlertsReport />
                  </div>
                  <div className="border-t border-slate-700 pt-8">
                    <AppointmentTrackingReport />
                  </div>
                </div>
              )}

              {activeTab === 'Incidents' && <IncidentLogReport />}
              
              {activeTab === 'Medications' && <MedicationReport />}
              
              {activeTab === 'Residential' && (
                <div className="space-y-8">
                  <LeaseComplianceReport />
                  <div className="border-t border-slate-700 pt-8">
                    <RightsRestrictionsReport />
                  </div>
                </div>
              )}

              {activeTab === 'QA' && (
                <div className="space-y-8">
                  <QAPITrendReport />
                  <div className="border-t border-slate-700 pt-8">
                    <ComplianceScoreReport />
                  </div>
                </div>
              )}

              {activeTab === 'Billing' && <BillingReadinessReport />}
            </div>
          </div>
        </main>
      </ScrollArea>
    </div>
  </div>
</div>
);
};
export default ReportsPage;