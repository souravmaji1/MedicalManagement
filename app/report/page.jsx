'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Calendar, Filter, Search, ChevronRight, ChevronDown,
  Users, Activity, AlertTriangle, CheckCircle, XCircle, Clock, Shield,NetworkIcon,
  BarChart3, TrendingUp, Eye, Printer, Share2, RefreshCw, Lock,CreditCard,User2Icon,
  Home, MapPin, Heart, Pill, AlertCircle, Award, Target, BookOpen,
  Menu, X, Bell, Settings, ChevronLeft
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

const ReportsPage = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { userProfile, loading: profileLoading } = useUserProfile();
  
  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('HCBS');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [auditMode, setAuditMode] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '2026-01-01',
    end: '2026-03-31'
  });

 const tabs = [
  { id: 'HCBS', label: 'HCBS Compliance', icon: Shield, color: 'emerald' },
  { id: 'Clinical', label: 'Clinical', icon: Heart, color: 'pink' },
  { id: 'Incidents', label: 'Incidents', icon: AlertTriangle, color: 'red' },
  { id: 'Medications', label: 'Medications', icon: Pill, color: 'purple' },
  { id: 'Residential', label: 'Residential', icon: Home, color: 'blue' },
  { id: 'QA', label: 'QA/QAPI', icon: Award, color: 'teal' }
];


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
 

  useEffect(() => {
    if (isLoaded && user && !profileLoading && userProfile) {
      fetchIndividuals();
    }
  }, [isLoaded, user, profileLoading, userProfile]);

  // 1.  Add these three state variables near the top of the component (after the other useState calls):
const [homeFilter, setHomeFilter] = useState('all');
const [statusFilter, setStatusFilter] = useState('all');
const [dateFilter, setDateFilter] = useState('all');

// 2.  Replace the entire fetchIndividuals function with this version:
const fetchIndividuals = async () => {
  try {
    setLoading(true);
    let query = supabase.from('individuals').select('*').order('created_at', { ascending: false });

    // Apply filters
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
        default:
          startDate = null;
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

// 3.  Add these two helper functions anywhere inside the component (after fetchIndividuals):
const getUniqueHomes = () => {
  const homes = individuals.map(ind => ind.homeassignment).filter(Boolean);
  return [...new Set(homes)].sort();
};

const getStatusOptions = () => {
  const statuses = individuals.map(ind => ind.status).filter(Boolean);
  return [...new Set(statuses)].sort();
};

// 4.  Replace the entire useEffect that calls fetchIndividuals with this:
useEffect(() => {
  if (isLoaded && user && !profileLoading && userProfile) {
    fetchIndividuals();
  }
}, [isLoaded, user, profileLoading, userProfile, homeFilter, statusFilter, dateFilter]);



  // Print functionality for each report
const printCommunityIntegrationReport = () => {
  const printWindow = window.open('', '', 'width=1200,height=800');
  const data = getCommunityIntegrationData();
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Community Integration Report</title>
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
          <h1>Community Integration Report</h1>
          <p><strong>Beyond Barriers, LLC - DD Division</strong></p>
          <p class="date">Report Period: ${dateRange.start} - ${dateRange.end}</p>
          <p class="date">Generated: ${new Date().toLocaleString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Individual</th>
              <th>Home</th>
              <th>Waiver</th>
              <th>Community Activities</th>
              <th>Avg Hrs/Week</th>
              <th>ISP-Linked</th>
              <th>Choice %</th>
              <th>Last Outing</th>
              <th>HCBS Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                <td>${row.name}</td>
                <td>${row.home || 'N/A'}</td>
                <td>${row.waiver}</td>
                <td>${row.communityActivities}</td>
                <td>${row.avgHoursPerWeek}</td>
                <td>${row.ispLinked}</td>
                <td>${row.choicePercent}%</td>
                <td>${row.lastOuting}</td>
                <td class="${row.hcbsStatus.includes('Fully Met') ? 'status-met' : row.hcbsStatus.includes('Partial') ? 'status-partial' : 'status-not-met'}">${row.hcbsStatus}</td>
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

const printChoiceAutonomyReport = () => {
  const printWindow = window.open('', '', 'width=1200,height=800');
  const data = getChoiceAutonomyData();
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Choice & Autonomy Documentation Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #059669; margin-bottom: 10px; }
          .header { margin-bottom: 30px; }
          .date { color: #666; font-size: 14px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #059669; color: white; padding: 12px; text-align: left; font-size: 12px; }
          td { border: 1px solid #ddd; padding: 10px; font-size: 11px; text-align: center; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .risk-green { color: #059669; font-size: 18px; }
          .risk-yellow { color: #f59e0b; font-size: 18px; }
          .risk-red { color: #dc2626; font-size: 18px; }
          @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Choice & Autonomy Documentation</h1>
          <p><strong>Beyond Barriers, LLC - DD Division</strong></p>
          <p class="date">Report Period: ${dateRange.start} - ${dateRange.end}</p>
          <p class="date">Generated: ${new Date().toLocaleString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Individual</th>
              <th>Total Encounters</th>
              <th>Choice Documented</th>
              <th>Choice %</th>
              <th>Lease Signed</th>
              <th>Complaints (12mo)</th>
              <th>Open Complaints</th>
              <th>Risk Flag</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                <td>${row.name}</td>
                <td>${row.totalEncounters}</td>
                <td>${row.choiceDocumented}</td>
                <td>${row.choicePercent}%</td>
                <td>${row.leaseSigned ? 'Yes' : 'No'}</td>
                <td>${row.complaints12Mo}</td>
                <td>${row.openComplaints}</td>
                <td class="${row.riskFlag === '🟢' ? 'risk-green' : row.riskFlag === '🟡' ? 'risk-yellow' : 'risk-red'}">${row.riskFlag}</td>
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

const printISPGoalReport = () => {
  const printWindow = window.open('', '', 'width=1200,height=800');
  const data = getISPGoalData();
  
  printWindow.document.write(`
    <html>
      <head>
        <title>ISP Goal Implementation Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #059669; margin-bottom: 10px; }
          .header { margin-bottom: 30px; }
          .date { color: #666; font-size: 14px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #059669; color: white; padding: 12px; text-align: left; font-size: 12px; }
          td { border: 1px solid #ddd; padding: 10px; font-size: 11px; }
          tr:nth-child(even) { background-color: #f9fafb; }
          @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ISP Goal Implementation Report</h1>
          <p><strong>Beyond Barriers, LLC - DD Division</strong></p>
          <p class="date">Report Period: ${dateRange.start} - ${dateRange.end}</p>
          <p class="date">Generated: ${new Date().toLocaleString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Individual</th>
              <th>ISP Goal</th>
              <th>Goal Status</th>
              <th>Linked Encounters</th>
              <th>Total Hours</th>
              <th>Avg/Month</th>
              <th>Last Session</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                <td>${row.individualName}</td>
                <td>${row.ispGoal}</td>
                <td>${row.goalStatus}</td>
                <td>${row.linkedEncounters}</td>
                <td>${row.totalHours}</td>
                <td>${row.avgPerMonth}</td>
                <td>${row.lastSession}</td>
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

const printIncidentReport = () => {
  const printWindow = window.open('', '', 'width=1200,height=800');
  const data = getIncidentData();
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Incident Log Report (IPMS)</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #059669; margin-bottom: 10px; }
          .header { margin-bottom: 30px; }
          .date { color: #666; font-size: 14px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #059669; color: white; padding: 12px; text-align: left; font-size: 12px; }
          td { border: 1px solid #ddd; padding: 10px; font-size: 11px; text-align: center; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .risk-green { color: #059669; font-size: 18px; }
          .risk-yellow { color: #f59e0b; font-size: 18px; }
          .risk-red { color: #dc2626; font-size: 18px; }
          @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Incident Log (IPMS)</h1>
          <p><strong>Beyond Barriers, LLC - DD Division</strong></p>
          <p class="date">Report Period: ${dateRange.start} - ${dateRange.end}</p>
          <p class="date">Generated: ${new Date().toLocaleString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Individual</th>
              <th>Home</th>
              <th>Total</th>
              <th>Open</th>
              <th>Closed</th>
              <th>Avg Days to Close</th>
              <th>Critical Open</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                <td>${row.name}</td>
                <td>${row.home || 'N/A'}</td>
                <td>${row.totalIncidents}</td>
                <td>${row.openIncidents}</td>
                <td>${row.closedIncidents}</td>
                <td>${row.avgDaysToClose}</td>
                <td>${row.criticalOpen}</td>
                <td class="${row.riskFlag === '🟢' ? 'risk-green' : row.riskFlag === '🟡' ? 'risk-yellow' : 'risk-red'}">${row.riskFlag}</td>
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

const printMedicationReport = () => {
  const printWindow = window.open('', '', 'width=1200,height=800');
  const data = getMedicationData();
  
  printWindow.document.write(`
    <html>
      <head>
        <title>MAR Administration Summary</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #059669; margin-bottom: 10px; }
          .header { margin-bottom: 30px; }
          .date { color: #666; font-size: 14px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #059669; color: white; padding: 12px; text-align: left; font-size: 12px; }
          td { border: 1px solid #ddd; padding: 10px; font-size: 11px; text-align: center; }
          tr:nth-child(even) { background-color: #f9fafb; }
          @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MAR Administration Summary</h1>
          <p><strong>Beyond Barriers, LLC - DD Division</strong></p>
          <p class="date">Report Period: ${dateRange.start} - ${dateRange.end}</p>
          <p class="date">Generated: ${new Date().toLocaleString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Individual</th>
              <th>Medication</th>
              <th>Scheduled</th>
              <th>Given</th>
              <th>Missed</th>
              <th>Late</th>
              <th>Adherence %</th>
              <th>Last Miss</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                <td>${row.individualName}</td>
                <td>${row.medicationname}</td>
                <td>${row.scheduled}</td>
                <td>${row.given}</td>
                <td>${row.missed}</td>
                <td>${row.late}</td>
                <td>${row.adherence}</td>
                <td>${row.lastMiss}</td>
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


// Add these print functions to your ReportsPage component

const printWellnessVitalsReport = () => {
  const printWindow = window.open('', '', 'width=1200,height=800');
  const data = getWellnessVitalsData();
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Wellness & Vital Signs Tracking Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #059669; margin-bottom: 10px; }
          .header { margin-bottom: 30px; }
          .date { color: #666; font-size: 14px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #059669; color: white; padding: 12px; text-align: left; font-size: 12px; }
          td { border: 1px solid #ddd; padding: 10px; font-size: 11px; text-align: center; }
          tr:nth-child(even) { background-color: #f9fafb; }
          @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Wellness & Vital Signs Tracking Report</h1>
          <p><strong>Beyond Barriers, LLC - DD Division</strong></p>
          <p class="date">Report Period: ${dateRange.start} - ${dateRange.end}</p>
          <p class="date">Generated: ${new Date().toLocaleString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Individual</th>
              <th>Home</th>
              <th>Last Vitals Date</th>
              <th>Blood Pressure</th>
              <th>Heart Rate</th>
              <th>Temperature (°F)</th>
              <th>O2 Sat %</th>
              <th>Weight</th>
              <th>Upcoming Appts</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                <td>${row.individualName}</td>
                <td>${row.home}</td>
                <td>${row.lastVitalsDate}</td>
                <td>${row.bloodPressure}</td>
                <td>${row.heartRate}</td>
                <td>${row.temperature}</td>
                <td>${row.oxygenSat}</td>
                <td>${row.weight}</td>
                <td>${row.upcomingAppts}</td>
                <td>${row.vitalsTrend}</td>
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

const printMedicalAlertsReport = () => {
  const printWindow = window.open('', '', 'width=1200,height=800');
  const data = getMedicalAlertsData();
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Medical Alerts & Risk Plans Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #059669; margin-bottom: 10px; }
          .header { margin-bottom: 30px; }
          .date { color: #666; font-size: 14px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #059669; color: white; padding: 12px; text-align: left; font-size: 12px; }
          td { border: 1px solid #ddd; padding: 10px; font-size: 11px; text-align: center; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .risk-green { color: #059669; font-size: 18px; }
          .risk-yellow { color: #f59e0b; font-size: 18px; }
          .risk-red { color: #dc2626; font-size: 18px; }
          @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Medical Alerts & Risk Plans Report</h1>
          <p><strong>Beyond Barriers, LLC - DD Division</strong></p>
          <p class="date">Report Period: ${dateRange.start} - ${dateRange.end}</p>
          <p class="date">Generated: ${new Date().toLocaleString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Individual</th>
              <th>Home</th>
              <th>Primary Diagnosis</th>
              <th>Medical Alerts</th>
              <th>Behavioral Alerts</th>
              <th>Active Risk Plans</th>
              <th>High Severity</th>
              <th>Last Review</th>
              <th>Next Review Due</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                <td>${row.individualName}</td>
                <td>${row.home}</td>
                <td>${row.primaryDiagnosis}</td>
                <td>${row.medicalAlerts}</td>
                <td>${row.behavioralAlerts}</td>
                <td>${row.activeRiskPlans}</td>
                <td>${row.highSeverityAlerts}</td>
                <td>${row.lastReviewDate}</td>
                <td>${row.nextReviewDue}</td>
                <td class="${row.riskFlag === '🟢' ? 'risk-green' : row.riskFlag === '🟡' ? 'risk-yellow' : 'risk-red'}">${row.riskFlag}</td>
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

const printAppointmentTrackingReport = () => {
  const printWindow = window.open('', '', 'width=1200,height=800');
  const data = getAppointmentTrackingData();
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Appointment Tracking Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #059669; margin-bottom: 10px; }
          .header { margin-bottom: 30px; }
          .date { color: #666; font-size: 14px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #059669; color: white; padding: 12px; text-align: left; font-size: 12px; }
          td { border: 1px solid #ddd; padding: 10px; font-size: 11px; text-align: center; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .risk-green { color: #059669; font-size: 18px; }
          .risk-yellow { color: #f59e0b; font-size: 18px; }
          .risk-red { color: #dc2626; font-size: 18px; }
          @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Appointment Tracking Report</h1>
          <p><strong>Beyond Barriers, LLC - DD Division</strong></p>
          <p class="date">Report Period: ${dateRange.start} - ${dateRange.end}</p>
          <p class="date">Generated: ${new Date().toLocaleString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Individual</th>
              <th>Home</th>
              <th>Scheduled</th>
              <th>Completed</th>
              <th>Upcoming</th>
              <th>Overdue</th>
              <th>Next Appt Date</th>
              <th>Provider</th>
              <th>Compliance %</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                <td>${row.individualName}</td>
                <td>${row.home}</td>
                <td>${row.scheduledAppts}</td>
                <td>${row.completedAppts}</td>
                <td>${row.upcomingAppts}</td>
                <td>${row.overdueAppts}</td>
                <td>${row.nextApptDate}</td>
                <td>${row.nextApptProvider}</td>
                <td>${row.complianceRate}%</td>
                <td class="${row.riskFlag === '🟢' ? 'risk-green' : row.riskFlag === '🟡' ? 'risk-yellow' : 'risk-red'}">${row.riskFlag}</td>
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

const printLeaseComplianceReport = () => {
  const printWindow = window.open('', '', 'width=1200,height=800');
  const data = getLeaseComplianceData();
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Lease & Residency Status Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #059669; margin-bottom: 10px; }
          .header { margin-bottom: 30px; }
          .date { color: #666; font-size: 14px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #059669; color: white; padding: 12px; text-align: left; font-size: 12px; }
          td { border: 1px solid #ddd; padding: 10px; font-size: 11px; text-align: center; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .compliance-green { color: #059669; font-size: 18px; }
          .compliance-yellow { color: #f59e0b; font-size: 18px; }
          .compliance-red { color: #dc2626; font-size: 18px; }
          @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Lease & Residency Status Report</h1>
          <p><strong>Beyond Barriers, LLC - DD Division</strong></p>
          <p class="date">Report Period: ${dateRange.start} - ${dateRange.end}</p>
          <p class="date">Generated: ${new Date().toLocaleString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Individual</th>
              <th>Home</th>
              <th>Lease Start</th>
              <th>Lease End</th>
              <th>Signed</th>
              <th>Status</th>
              <th>Active Restrictions</th>
              <th>Admission Date</th>
              <th>Days in Home</th>
              <th>Compliance</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                <td>${row.name}</td>
                <td>${row.home}</td>
                <td>${row.leaseStart}</td>
                <td>${row.leaseEnd}</td>
                <td>${row.leaseSigned ? 'Yes' : 'No'}</td>
                <td>${row.leaseStatus}</td>
                <td>${row.activeRestrictions}</td>
                <td>${row.admissionDate}</td>
                <td>${row.daysInHome}</td>
                <td class="${row.complianceFlag === '🟢' ? 'compliance-green' : row.complianceFlag === '🟡' ? 'compliance-yellow' : 'compliance-red'}">${row.complianceFlag}</td>
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

const printRightsRestrictionsReport = () => {
  const printWindow = window.open('', '', 'width=1200,height=800');
  const data = getRightsRestrictionsData();
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Rights Restrictions Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #059669; margin-bottom: 10px; }
          .header { margin-bottom: 30px; }
          .date { color: #666; font-size: 14px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #059669; color: white; padding: 12px; text-align: left; font-size: 12px; }
          td { border: 1px solid #ddd; padding: 10px; font-size: 11px; }
          tr:nth-child(even) { background-color: #f9fafb; }
          @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Rights Restrictions Report</h1>
          <p><strong>Beyond Barriers, LLC - DD Division</strong></p>
          <p class="date">Report Period: ${dateRange.start} - ${dateRange.end}</p>
          <p class="date">Generated: ${new Date().toLocaleString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Individual</th>
              <th>Home</th>
              <th>Restriction Type</th>
              <th>Status</th>
              <th>Approved By</th>
              <th>Review Date</th>
              <th>Justification</th>
              <th>Days Active</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                <td>${row.individualName}</td>
                <td>${row.home}</td>
                <td>${row.restrictionType}</td>
                <td>${row.status}</td>
                <td>${row.approvedBy}</td>
                <td>${row.reviewDate}</td>
                <td>${row.justification}</td>
                <td>${row.daysActive}</td>
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

const printQAPITrendReport = () => {
  const printWindow = window.open('', '', 'width=1200,height=800');
  const data = getQAPITrendData();
  
  printWindow.document.write(`
    <html>
      <head>
        <title>QAPI Trend Analysis Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #059669; margin-bottom: 10px; }
          .header { margin-bottom: 30px; }
          .date { color: #666; font-size: 14px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #059669; color: white; padding: 12px; text-align: left; font-size: 12px; }
          td { border: 1px solid #ddd; padding: 10px; font-size: 11px; text-align: center; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .trend-green { color: #059669; font-size: 18px; }
          .trend-yellow { color: #f59e0b; font-size: 18px; }
          .trend-red { color: #dc2626; font-size: 18px; }
          @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>QAPI Trend Analysis Report</h1>
          <p><strong>Beyond Barriers, LLC - DD Division</strong></p>
          <p class="date">Report Period: ${dateRange.start} - ${dateRange.end}</p>
          <p class="date">Generated: ${new Date().toLocaleString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Home</th>
              <th>Individuals</th>
              <th>Incidents</th>
              <th>Med Errors</th>
              <th>Behavior Events</th>
              <th>Missed Meds</th>
              <th>Community Outings</th>
              <th>Avg Outings/Person</th>
              <th>Choice Rate %</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                <td>${row.home}</td>
                <td>${row.individualsCount}</td>
                <td>${row.totalIncidents}</td>
                <td>${row.medErrors}</td>
                <td>${row.behaviorEvents}</td>
                <td>${row.missedMeds}</td>
                <td>${row.communityOutings}</td>
                <td>${row.avgOutingsPerPerson}</td>
                <td>${row.choiceRate}%</td>
                <td class="${row.trendFlag === '🟢' ? 'trend-green' : row.trendFlag === '🟡' ? 'trend-yellow' : 'trend-red'}">${row.trendFlag}</td>
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

const printComplianceScoreReport = () => {
  const printWindow = window.open('', '', 'width=1200,height=800');
  const data = getComplianceScoreData();
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Individual Compliance Score Summary Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #059669; margin-bottom: 10px; }
          .header { margin-bottom: 30px; }
          .date { color: #666; font-size: 14px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #059669; color: white; padding: 12px; text-align: left; font-size: 12px; }
          td { border: 1px solid #ddd; padding: 10px; font-size: 11px; text-align: center; }
          tr:nth-child(even) { background-color: #f9fafb; }
          @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Individual Compliance Score Summary Report</h1>
          <p><strong>Beyond Barriers, LLC - DD Division</strong></p>
          <p class="date">Report Period: ${dateRange.start} - ${dateRange.end}</p>
          <p class="date">Generated: ${new Date().toLocaleString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Individual</th>
              <th>Home</th>
              <th>Score</th>
              <th>Documentation</th>
              <th>Community</th>
              <th>Choice</th>
              <th>HCBS Lease</th>
              <th>ISP Goals</th>
              <th>Risk Level</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                <td>${row.name}</td>
                <td>${row.home}</td>
                <td style="font-weight: bold; color: ${row.complianceScore >= 80 ? '#059669' : row.complianceScore >= 60 ? '#f59e0b' : '#dc2626'}">${row.complianceScore}</td>
                <td>${row.documentation}</td>
                <td>${row.communityIntegration}</td>
                <td>${row.choiceAutonomy}</td>
                <td>${row.hcbsLease}</td>
                <td>${row.activeISPGoals}</td>
                <td>${row.riskLevel}</td>
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

const printBillingReadinessReport = () => {
  const printWindow = window.open('', '', 'width=1200,height=800');
  const data = getBillingReadinessData();
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Billing Readiness Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #059669; margin-bottom: 10px; }
          .header { margin-bottom: 30px; }
          .date { color: #666; font-size: 14px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #059669; color: white; padding: 12px; text-align: left; font-size: 12px; }
          td { border: 1px solid #ddd; padding: 10px; font-size: 11px; text-align: center; }
          tr:nth-child(even) { background-color: #f9fafb; }
          .status-ready { color: #059669; font-weight: bold; }
          .status-hold { color: #dc2626; font-weight: bold; }
          @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Billing Readiness Report</h1>
          <p><strong>Beyond Barriers, LLC - DD Division</strong></p>
          <p class="date">Report Period: ${dateRange.start} - ${dateRange.end}</p>
          <p class="date">Generated: ${new Date().toLocaleString()}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Encounter ID</th>
              <th>Date</th>
              <th>Individual</th>
              <th>Service</th>
              <th>Units</th>
              <th>Doc Status</th>
              <th>Billing Status</th>
              <th>Hold Reason</th>
              <th>Ready</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                <td>${row.encounterId}</td>
                <td>${row.date}</td>
                <td>${row.individualName}</td>
                <td>${row.service}</td>
                <td>${row.units}</td>
                <td>${row.docStatus}</td>
                <td class="${row.billingStatus === 'Ready' ? 'status-ready' : 'status-hold'}">${row.billingStatus}</td>
                <td>${row.holdReason}</td>
                <td>${row.ready}</td>
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
  // Calculate Community Integration Report Data
  const getCommunityIntegrationData = () => {
    return individuals.map(individual => {
      const dailyNotes = individual.dailynotes || [];
      const communityActivities = dailyNotes.filter(note => note.communityouting === true);
      const totalWeeks = 12; // Q1 = 12 weeks
      const avgHoursPerWeek = communityActivities.length > 0 
        ? (communityActivities.reduce((acc, note) => acc + parseFloat(note.outingduration || 0), 0) / totalWeeks).toFixed(1)
        : 0;
      
      const totalEncounters = dailyNotes.length;
      const choiceDocumented = dailyNotes.filter(note => note.choiceoffered && note.choicetaken).length;
      const choicePercent = totalEncounters > 0 ? Math.round((choiceDocumented / totalEncounters) * 100) : 0;
      
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
        ispLinked: dailyNotes.filter(note => note.goalsworked?.length > 0).length,
        choicePercent,
        lastOuting,
        hcbsStatus,
        individual
      };
    });
  };

  // Calculate Choice & Autonomy Data
  const getChoiceAutonomyData = () => {
    return individuals.map(individual => {
      const dailyNotes = individual.dailynotes || [];
      const totalEncounters = dailyNotes.length;
      const choiceDocumented = dailyNotes.filter(note => note.choiceoffered && note.choicetaken).length;
      const choicePercent = totalEncounters > 0 ? Math.round((choiceDocumented / totalEncounters) * 100) : 0;
      
      // Check for lease (assuming HCBS data contains lease info)
      const leaseSigned = individual.hcbs_data?.lease_signed || false;
      
      // Mock complaint data (you can replace with actual data)
      const complaints12Mo = 0;
      const openComplaints = 0;

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
        riskFlag,
        individual
      };
    });
  };

 // Calculate ISP Goal Implementation Data - Modified to show ALL individuals
const getISPGoalData = () => {
  const goalData = [];
  individuals.forEach(individual => {
    const goals = individual.goals || [];
    const dailyNotes = individual.dailynotes || [];
    
    if (goals.length === 0) {
      // If individual has no goals, still show them with "No Goals" entry
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
        
        const totalHours = linkedNotes.reduce((acc, note) => {
          return acc + 1;
        }, 0);
        
        const avgPerMonth = totalHours > 0 ? (totalHours / 3).toFixed(1) : 0;
        
        const lastSession = linkedNotes.length > 0 
          ? new Date(linkedNotes[linkedNotes.length - 1].date).toLocaleDateString()
          : 'Never';

        goalData.push({
          individualName: `${individual.firstname} ${individual.lastname}`,
          ispGoal: goal.description.substring(0, 50) + '...',
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

  // Calculate Incident Data
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

  // Calculate Medication Data - Modified to show ALL individuals
const getMedicationData = () => {
  const allMedicationData = [];
  
  individuals.forEach(individual => {
    const medications = individual.medications || [];
    const marHistory = individual.marhistory || [];
    
    const activeMeds = medications.filter(med => med.status === 'Active');
    
    if (activeMeds.length === 0) {
      // If individual has no active medications, still show them
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
        const missed = medHistory.filter(mar => mar.status === 'Missed').length;
        const late = medHistory.filter(mar => mar.lateminutes).length;
        
        const adherence = scheduled > 0 ? ((given / scheduled) * 100).toFixed(1) : 100;
        const lastMiss = missed > 0 ? 
          new Date(medHistory.filter(mar => mar.status === 'Missed')[missed - 1].date).toLocaleDateString() : 'None';

        allMedicationData.push({
          individualName: `${individual.firstname} ${individual.lastname}`,
          medicationname: med.medicationname,
          scheduled: scheduled,
          given: given,
          missed: missed,
          late: late,
          adherence: adherence,
          lastMiss: lastMiss
        });
      });
    }
  });
  
  return allMedicationData;
};

  // NavBar Component
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
          <span>Report Period: {dateRange.start} - {dateRange.end}</span>
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
    <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-900/10 border-r border-slate-800/50 transition-all duration-300 flex flex-col h-screen`}>
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-slate-300 font-semibold">System Online</span>
          </div>
          <div className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
            <span className="text-emerald-400 text-xs font-bold">v2.0</span>
          </div>
        </div>
        
        <button
          onClick={() => setAuditMode(!auditMode)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${
            auditMode 
              ? 'bg-yellow-900/30 border-yellow-500/50 text-yellow-400' 
              : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-emerald-500/50'
          }`}
        >
          <Lock size={18} />
          <div className="flex-1 text-left">
            <p className="text-sm font-bold">Audit Mode</p>
            <p className="text-xs opacity-75">{auditMode ? 'Enabled' : 'Disabled'}</p>
          </div>
        </button>
      </div>
      
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="mb-2 px-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Navigation</span>
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === 'report';
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id !== 'report') {
                  router.push(`/${item.id}`);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl mb-2 transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-semibold flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </ScrollArea>
      
      <div className="p-4 border-t border-slate-800/50">
        <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 rounded-xl p-4 border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="text-emerald-400" size={18} />
            <p className="text-sm font-bold text-white">IPMS Certified</p>
          </div>
          <p className="text-xs text-slate-400">Alabama DD Compliant</p>
        </div>
      </div>
    </div>
  );

  // ============================================
// NEW DATA CALCULATION FUNCTIONS
// ============================================

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
      primaryDiagnosis: individual.primarydiagnosis,
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
    const hcbsData = individual.hcbs_data || {};
    const hasLease = hcbsData.lease_signed || false;
    const leaseStart = hcbsData.lease_start_date || null;
    const leaseEnd = hcbsData.lease_end_date || null;
    
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
      restrictionTypes: activeRestrictions.map(r => r.type).join(', ') || 'None',
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
    const missedDoses = individual.misseddoses || [];
    const medErrors = individual.mederrors || [];
    
    trendData[home].totalIncidents += incidents.length;
    trendData[home].medErrors += medErrors.length;
    trendData[home].behaviorEvents += dailyNotes.filter(n => n.behaviors && n.behaviors.length > 0).length;
    trendData[home].missedMeds += missedDoses.length;
    trendData[home].communityOutings += dailyNotes.filter(n => n.communityouting === true).length;
    trendData[home].choiceDocumented += dailyNotes.filter(n => n.choiceoffered && n.choicetaken).length;
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
    const communityOutings = dailyNotes.filter(n => n.communityouting === true).length;
    const choiceDocumented = dailyNotes.filter(n => n.choiceoffered && n.choicetaken).length;
    const hcbsData = individual.hcbs_data || {};
    const hasLease = hcbsData.lease_signed || false;
    
    // Calculate compliance score
    let score = 0;
    if (totalEncounters > 0) score += 20; // Documentation
    if (communityOutings >= 6) score += 20; // Community Integration
    if (totalEncounters > 0 && (choiceDocumented / totalEncounters) >= 0.8) score += 20; // Choice
    if (hasLease) score += 20; // HCBS Lease
    if (activeGoals.length > 0) score += 20; // ISP Goals
    
    return {
      name: `${individual.firstname} ${individual.lastname}`,
      home: individual.homeassignment,
      complianceScore: score,
      documentation: totalEncounters > 0 ? '✔' : '❌',
      communityIntegration: communityOutings >= 6 ? '✔' : '❌',
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
      
      billingData.push({
        encounterId: note.id.substring(0, 8),
        date: new Date(note.date).toLocaleDateString(),
        individualName: `${individual.firstname} ${individual.lastname}`,
        service: note.shift === 'Day' ? 'Community Support' : 'Residential Support',
        units: note.shiftTimeOut && note.shiftTimeIn ? 
          calculateHours(note.shiftTimeIn, note.shiftTimeOut) : 0,
        docStatus: isApproved && hasNarrative ? 'Validated' : 'Incomplete',
        billingStatus: (isApproved && hasNarrative && !hasOpenIncident) ? 'Ready' : 'HOLD',
        holdReason: hasOpenIncident ? 'Open Incident' : !isApproved ? 'Not Approved' : !hasNarrative ? 'Missing Narrative' : '',
        ready: isApproved && hasNarrative && !hasOpenIncident ? '✔' : '❌',
        individual
      });
    });
  });
  return billingData;
};

// ============================================
// NEW REPORT COMPONENTS
// ============================================

// Wellness & Vital Signs Report
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
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all">
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

// Medical Alerts & Risk Plans Report
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
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all">
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
                <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Next Review Due</th>
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

// Appointment Tracking Report
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
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all">
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
                <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Next Appt Date</th>
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
  )}




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
className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all">
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
            <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Active Restrictions</th>
            <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Admission Date</th>
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
)}


// Rights Restrictions Report
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
className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all">
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
            <th className="text-left py-4 px-4 text-slate-300 text-sm font-bold">Restriction Type</th>
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
)}

// QAPI Trend Analysis Report
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
className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all">
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
            <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Community Outings</th>
            <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Avg Outings/Person</th>
            <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Choice Rate %</th>
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
)}


// Compliance Score Summary Report
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
className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all">
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
            <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">HCBS Lease</th>
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
<p className="text-slate-400 text-sm mb-1">High Risk </p>
<p className="text-2xl font-bold text-white">
{data.filter(d => d.complianceScore < 60).length}
</p>
</div>
</div>
</div>
);
};

  // HCBS Community Integration Report
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
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Community Activities</th>
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
                    <td className="py-4 px-4 text-center">
                      <button className="text-emerald-400 hover:text-emerald-300 font-bold underline">
                        {row.communityActivities}
                      </button>
                    </td>
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
                    <td className="py-4 px-4 text-center">
                      <span className="text-lg">{row.hcbsStatus}</span>
                    </td>
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


  // Choice & Autonomy Report
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

  // ISP Goal Implementation Report
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
                  <th className="text-center py-4 px-4 text-slate-300 text-sm font-bold">Goal Status</th>
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
                        row.goalStatus === 'In Progress' ? 'bg-blue-900/30 text-blue-400' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {row.goalStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button className="text-emerald-400 hover:text-emerald-300 font-bold underline">
                        {row.linkedEncounters}
                      </button>
                    </td>
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
// Incident Log Report
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
// Medication Administration Report
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
                    <button className="text-red-400 hover:text-red-300 font-bold underline">
                      {row.missed}
                    </button>
                  ) : (
                    <span className="text-slate-500">0</span>
                  )}
                </td>
                <td className="py-4 px-4 text-center text-white">{row.late}</td>
                <td className="py-4 px-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    parseFloat(row.adherence) >= 95 ? 'bg-green-900/30 text-green-400' :
                    parseFloat(row.adherence) >= 85 ? 'bg-yellow-900/30 text-yellow-400' :
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
          {data.filter(d => parseFloat(d.adherence) < 85).length}
        </p>
      </div>
    </div>
  </div>
);

};
// Main render
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
<ScrollArea className="h-full">
<main className="p-6 lg:p-8">
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

<div className="flex flex-col gap-4">

   
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
                  {individuals.reduce((acc, ind) => acc + (ind.goals?.length || 0), 0)}
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

            {/* Tabs */}
            <div className="border-b border-slate-700">
              <div className="flex gap-4 overflow-x-auto">
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

              
              {activeTab === 'Incidents' && <IncidentLogReport />}
              {activeTab === 'Medications' && <MedicationReport />}
              
              {activeTab === 'Clinical' && (
                <div className="text-center py-16">
                  <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-400 mb-2">Clinical Reports</h3>
                  <p className="text-slate-500">Clinical compliance reports coming soon</p>
                </div>
              )}
              
              {activeTab === 'QA' && (
                <div className="text-center py-16">
                  <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-400 mb-2">QA/QAPI Reports</h3>
                  <p className="text-slate-500">Quality assurance reports coming soon</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </ScrollArea>
    </div>
  </div>
</div>
)}

export default ReportsPage