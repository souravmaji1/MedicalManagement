'use client';
import React, { useState } from 'react';
import { 
  Shield, Lock, Eye, EyeOff, CheckCircle, XCircle, AlertTriangle,
  FileText, Users, Heart, Pill, Activity, Target, Calendar,
  Database, Server, Key, UserCheck, AlertOctagon, Info,User2Icon,
  ChevronDown, ChevronRight, Search, Download, Bell, Menu, X,
  Home, CreditCard, NetworkIcon, Loader2, Brain, TrendingUp,
  BookOpen, Fingerprint, ShieldCheck, ShieldAlert, MessageSquare
} from 'lucide-react';
import { ScrollArea } from "../../../components/ui/scroll-area";
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '../../../contexts/userProfileContext';

const DataPrivacyPage = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { userProfile, loading: profileLoading } = useUserProfile();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('privacy');
  const [expandedSection, setExpandedSection] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

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

  // Data collection by page/module
  const dataCollectionByModule = [
    {
      id: 'individuals',
      title: 'Individual Profiles',
      icon: Users,
      color: 'from-blue-600 to-cyan-500',
      collected: [
        { field: 'First Name', type: 'identifier', required: true },
        { field: 'Last Name', type: 'identifier', required: true },
        { field: 'Individual ID', type: 'identifier', required: true },
        { field: 'Date of Birth', type: 'identifier', required: true },
        { field: 'Gender', type: 'demographic', required: false },
        { field: 'Phone', type: 'contact', required: false },
        { field: 'Email', type: 'contact', required: false },
        { field: 'Location/City', type: 'demographic', required: false },
        { field: 'Home Assignment', type: 'operational', required: true },
        { field: 'Primary Diagnosis', type: 'phi', required: false },
        { field: 'Guardian Information', type: 'contact', required: true },
        { field: 'Emergency Contact', type: 'contact', required: true },
        { field: 'Allergies', type: 'phi', required: false },
        { field: 'Admission Date', type: 'operational', required: true },
        { field: 'Status (Active/Review/Inactive)', type: 'operational', required: true }
      ],
      notCollected: [
        'Social Security Number',
        'Insurance Policy Numbers',
        'Bank Account Information',
        'Biometric Data'
      ],
      purpose: 'To maintain individual service records and facilitate care coordination',
      retention: '7 years after service termination per regulatory requirements',
      access: 'Limited to authorized care team members only'
    },
    {
      id: 'dailynotes',
      title: 'Daily Notes & Documentation',
      icon: FileText,
      color: 'from-green-600 to-emerald-500',
      collected: [
        { field: 'Date & Time', type: 'operational', required: true },
        { field: 'Shift (Day/Evening/Night)', type: 'operational', required: true },
        { field: 'Mood (Happy/Calm/Anxious/Sad)', type: 'wellness', required: true },
        { field: 'Sleep Quality', type: 'wellness', required: true },
        { field: 'Appetite (Good/Fair/Poor)', type: 'wellness', required: true },
        { field: 'ADL Assistance Levels', type: 'operational', required: true },
        { field: 'Activities Participated', type: 'wellness', required: false },
        { field: 'Behaviors Observed', type: 'wellness', required: false },
        { field: 'Staff Narrative', type: 'operational', required: true },
        { field: 'Goals Worked On', type: 'operational', required: false },
        { field: 'Community Outings', type: 'wellness', required: false },
        { field: 'Health Changes Noted', type: 'wellness', required: false }
      ],
      notCollected: [
        'Detailed Clinical Diagnoses in Notes',
        'Specific Treatment Protocols',
        'Therapy Session Content'
      ],
      purpose: 'To document daily wellness, engagement, and support provided',
      retention: '3 years from date of documentation',
      access: 'DSPs, House Managers, QIDPs, and approved supervisors'
    },
    {
      id: 'medications',
      title: 'Medication Tracking',
      icon: Pill,
      color: 'from-purple-600 to-pink-500',
      collected: [
        { field: 'Medication Name', type: 'phi', required: true },
        { field: 'Dosage', type: 'phi', required: true },
        { field: 'Route (PO, Topical, etc.)', type: 'phi', required: true },
        { field: 'Frequency', type: 'phi', required: true },
        { field: 'Times Scheduled', type: 'phi', required: true },
        { field: 'Start Date', type: 'phi', required: true },
        { field: 'End Date', type: 'phi', required: false },
        { field: 'Prescribing Physician', type: 'phi', required: true },
        { field: 'Pharmacy', type: 'operational', required: false },
        { field: 'Indication/Purpose', type: 'phi', required: false },
        { field: 'PRN Status', type: 'phi', required: true },
        { field: 'Special Instructions', type: 'phi', required: false }
      ],
      notCollected: [
        'Pharmacy Account Numbers',
        'Insurance Prescription Benefit Details'
      ],
      purpose: 'To ensure safe medication administration and tracking',
      retention: '7 years per Alabama regulations',
      access: 'MAS Nurses, DSPs (view only), approved medical staff'
    },
    {
      id: 'mar',
      title: 'Medication Administration Records (MAR)',
      icon: CheckCircle,
      color: 'from-orange-600 to-red-500',
      collected: [
        { field: 'Administration Date & Time', type: 'phi', required: true },
        { field: 'Medication ID Reference', type: 'phi', required: true },
        { field: 'Status (Given/Held/Refused)', type: 'phi', required: true },
        { field: 'Staff Who Administered', type: 'operational', required: true },
        { field: 'Notes/Observations', type: 'phi', required: false },
        { field: 'Held Reason', type: 'phi', required: false },
        { field: 'Refused Reason', type: 'phi', required: false },
        { field: 'Late Administration Minutes', type: 'phi', required: false },
        { field: 'Approval Status', type: 'operational', required: false },
        { field: 'Approved By', type: 'operational', required: false }
      ],
      notCollected: [
        'Exact Blood Levels/Lab Results',
        'Detailed Side Effect Reports (filed separately)'
      ],
      purpose: 'Legal medication administration documentation',
      retention: '7 years minimum',
      access: 'MAS Nurses, supervising RNs, compliance officers'
    },
    {
      id: 'incidents',
      title: 'Incident Reports',
      icon: AlertTriangle,
      color: 'from-red-600 to-orange-500',
      collected: [
        { field: 'Incident Type', type: 'operational', required: true },
        { field: 'Date & Time Occurred', type: 'operational', required: true },
        { field: 'Location', type: 'operational', required: true },
        { field: 'Severity Level', type: 'operational', required: true },
        { field: 'Description', type: 'operational', required: true },
        { field: 'Individuals Involved', type: 'operational', required: true },
        { field: 'Staff Involved', type: 'operational', required: true },
        { field: 'Witnesses', type: 'operational', required: false },
        { field: 'Immediate Action Taken', type: 'operational', required: true },
        { field: 'Injuries (if any)', type: 'phi', required: false },
        { field: 'Medical Attention Required', type: 'phi', required: false },
        { field: 'Follow-up Actions', type: 'operational', required: false },
        { field: 'IPMS Category & Subcategory', type: 'operational', required: true }
      ],
      notCollected: [
        'Detailed Medical Treatment Plans',
        'Insurance Claim Information'
      ],
      purpose: 'Safety monitoring, regulatory compliance, and quality improvement',
      retention: '7 years minimum',
      access: 'All staff (reporting), Supervisors and compliance (review)'
    },
    {
      id: 'goals',
      title: 'Goals & Outcomes',
      icon: Target,
      color: 'from-cyan-600 to-blue-500',
      collected: [
        { field: 'Goal Description', type: 'operational', required: true },
        { field: 'HCBS Domain', type: 'operational', required: false },
        { field: 'Target Date', type: 'operational', required: false },
        { field: 'Frequency', type: 'operational', required: false },
        { field: 'Progress Percentage', type: 'operational', required: false },
        { field: 'Status (Active/Completed/Discontinued)', type: 'operational', required: true },
        { field: 'Created By', type: 'operational', required: true },
        { field: 'Created Date', type: 'operational', required: true },
        { field: 'Related Outcome ID', type: 'operational', required: false }
      ],
      notCollected: [
        'Clinical Treatment Goals',
        'Therapy-Specific Objectives'
      ],
      purpose: 'Track skill development and person-centered planning',
      retention: '3 years after goal completion',
      access: 'QIDPs, DSPs, House Managers'
    },
    {
      id: 'wellness',
      title: 'Wellness & Health Tracking',
      icon: Heart,
      color: 'from-pink-600 to-rose-500',
      collected: [
        { field: 'Vital Signs (BP, HR, Temp, O2)', type: 'phi', required: false },
        { field: 'Height & Weight', type: 'phi', required: false },
        { field: 'Appointment Date & Time', type: 'phi', required: false },
        { field: 'Provider Name', type: 'phi', required: false },
        { field: 'Location/Clinic', type: 'phi', required: false },
        { field: 'Appointment Status', type: 'operational', required: false },
        { field: 'General Notes', type: 'phi', required: false },
        { field: 'Medical History Updates', type: 'phi', required: false }
      ],
      notCollected: [
        'Complete Medical Records',
        'Lab Test Results',
        'Imaging Reports',
        'Detailed Diagnoses from Appointments'
      ],
      purpose: 'Monitor general wellness and coordinate healthcare appointments',
      retention: '3 years',
      access: 'MAS Nurses, QIDPs, House Managers'
    },
    {
      id: 'staff',
      title: 'Staff/User Profiles',
      icon: UserCheck,
      color: 'from-emerald-600 to-teal-500',
      collected: [
        { field: 'Full Name', type: 'identifier', required: true },
        { field: 'Email', type: 'contact', required: true },
        { field: 'Phone', type: 'contact', required: false },
        { field: 'Facility/Location', type: 'operational', required: false },
        { field: 'Division (DD/MI/SUD/PEER)', type: 'operational', required: true },
        { field: 'Role ID & Name', type: 'operational', required: true },
        { field: 'Permissions Array', type: 'operational', required: true },
        { field: 'Certification/License', type: 'operational', required: false },
        { field: 'Clerk User ID', type: 'technical', required: true },
        { field: 'Created & Updated Timestamps', type: 'technical', required: true }
      ],
      notCollected: [
        'Social Security Numbers',
        'Background Check Details',
        'Salary Information',
        'Personal Health Information'
      ],
      purpose: 'User authentication, role-based access control, and system audit trails',
      retention: 'Duration of employment + 3 years',
      access: 'System administrators and HR (limited fields)'
    },
    {
      id: 'foresight',
      title: 'Foresight Engine Analytics',
      icon: Brain,
      color: 'from-purple-600 to-indigo-500',
      collected: [
        { field: 'Aggregated Compliance Scores', type: 'aggregated', required: false },
        { field: 'Medication Compliance Rates', type: 'aggregated', required: false },
        { field: 'Incident Trends (Non-Identifiable)', type: 'aggregated', required: false },
        { field: 'Goal Progress Averages', type: 'aggregated', required: false },
        { field: 'Engagement Metrics', type: 'aggregated', required: false },
        { field: 'Staff Documentation Patterns', type: 'aggregated', required: false },
        { field: 'Regional Risk Levels', type: 'aggregated', required: false },
        { field: 'Forecast Market Predictions', type: 'aggregated', required: false }
      ],
      notCollected: [
        'Individual-Level Predictions',
        'Personal Health Trajectories',
        'Client-Specific Risk Scores'
      ],
      purpose: 'Organizational-level decision support and strategic planning (NO PHI)',
      retention: '12 months rolling',
      access: 'Executive leadership, QIDPs, analysts'
    }
  ];

  const securityMeasures = [
    {
      category: 'Encryption',
      icon: Lock,
      measures: [
        { name: 'Data at Rest', description: 'AES-256 encryption for all database storage', status: 'active' },
        { name: 'Data in Transit', description: 'TLS 1.3 encryption for all network communications', status: 'active' },
        { name: 'Backup Encryption', description: 'Encrypted automated daily backups', status: 'active' }
      ]
    },
    {
      category: 'Access Control',
      icon: Key,
      measures: [
        { name: 'Role-Based Access Control (RBAC)', description: 'Permissions based on job function', status: 'active' },
        { name: 'Multi-Factor Authentication', description: 'Optional MFA for all users', status: 'recommended' },
        { name: 'Session Management', description: 'Auto-logout after 30 minutes of inactivity', status: 'active' },
        { name: 'IP Whitelisting', description: 'Optional facility-based IP restrictions', status: 'optional' }
      ]
    },
    {
      category: 'Audit & Monitoring',
      icon: Eye,
      measures: [
        { name: 'Access Logs', description: 'All data access logged with user, time, and action', status: 'active' },
        { name: 'Change Tracking', description: 'Full audit trail of all data modifications', status: 'active' },
        { name: 'Export Monitoring', description: 'Logged and reviewed quarterly', status: 'active' },
        { name: 'Anomaly Detection', description: 'Alerts for unusual access patterns', status: 'planned' }
      ]
    },
    {
      category: 'Data Protection',
      icon: Shield,
      measures: [
        { name: 'Automated Backups', description: 'Daily encrypted backups with 30-day retention', status: 'active' },
        { name: 'Disaster Recovery', description: 'Recovery Time Objective (RTO): 4 hours', status: 'active' },
        { name: 'Data Minimization', description: 'Only essential data collected and retained', status: 'active' },
        { name: 'Secure Deletion', description: 'Cryptographic erasure for deleted records', status: 'active' }
      ]
    }
  ];

  const dataRetentionPolicies = [
    { dataType: 'Individual Profiles', retention: '7 years after service termination', reason: 'Regulatory requirement (Alabama DD)' },
    { dataType: 'Daily Notes', retention: '3 years', reason: 'Operational and compliance purposes' },
    { dataType: 'Medication Records', retention: '7 years', reason: 'State pharmacy regulations' },
    { dataType: 'MAR Logs', retention: '7 years minimum', reason: 'Legal and regulatory compliance' },
    { dataType: 'Incident Reports', retention: '7 years minimum', reason: 'Liability and compliance' },
    { dataType: 'Goals & Outcomes', retention: '3 years after completion', reason: 'Program evaluation' },
    { dataType: 'Wellness Data', retention: '3 years', reason: 'Care coordination' },
    { dataType: 'Staff Records', retention: 'Employment + 3 years', reason: 'HR and audit requirements' },
    { dataType: 'Audit Logs', retention: '12-24 months', reason: 'Security monitoring' },
    { dataType: 'Foresight Analytics', retention: '12 months rolling', reason: 'Trend analysis' }
  ];

  const allowedVsProhibited = [
    {
      category: 'Daily Notes Documentation',
      allowed: [
        '"Participated in group cooking activity today"',
        '"Mood was calm and cooperative during shift"',
        '"Ate lunch and drank water normally"',
        '"Walked in the community for 30 minutes"',
        '"Attended scheduled appointment today"'
      ],
      prohibited: [
        '"Had an autistic shutdown today"',
        '"Given 20mg medication dose late"',
        '"Had seizure and required emergency medication"',
        '"Missed therapy due to transportation issue"',
        '"Needs medication adjustment per doctor"'
      ]
    },
    {
      category: 'Incident Reporting',
      allowed: [
        '"Individual slipped in bathroom, no injuries"',
        '"Verbal disagreement between two individuals"',
        '"Property damage to bedroom door"',
        '"Individual left designated area briefly"'
      ],
      prohibited: [
        '"Individual had psychotic episode requiring restraint"',
        '"Bipolar individual in manic state refused medication"',
        '"Seizure disorder individual fell during episode"'
      ]
    },
    {
      category: 'Goal Documentation',
      allowed: [
        '"Practice money handling skills at store"',
        '"Improve communication in group settings"',
        '"Increase independence in meal preparation"'
      ],
      prohibited: [
        '"Reduce autistic behaviors in public"',
        '"Control schizophrenic symptoms"',
        '"Medication compliance for bipolar disorder"'
      ]
    }
  ];

  const userRights = [
    {
      right: 'Access',
      description: 'Individuals and guardians can request copies of records',
      icon: FileText
    },
    {
      right: 'Correction',
      description: 'Request amendments to inaccurate information',
      icon: CheckCircle
    },
    {
      right: 'Transparency',
      description: 'Know what data is collected and why',
      icon: Eye
    },
    {
      right: 'Limited Use',
      description: 'Data used only for stated purposes',
      icon: ShieldCheck
    },
    {
      right: 'Security',
      description: 'Data protected with industry-standard encryption',
      icon: Lock
    },
    {
      right: 'Breach Notification',
      description: 'Immediate notification if data is compromised',
      icon: AlertOctagon
    }
  ];

 
  

  if (!isLoaded || profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-4" />
<p className="text-slate-400 text-lg">Loading privacy information...</p>
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
            <div className="bg-gradient-to-r from-green-900/20 via-emerald-900/20 to-teal-900/20 border border-green-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/50">
                    <Shield className="text-white" size={28} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600">
                      DATA PRIVACY & GOVERNANCE
                    </h1>
                    <p className="text-slate-300 text-sm">Transparency Report • Wellness-Based Application • Non-PHI Focus</p>
                  </div>
                </div>
                <button 
                  onClick={() => alert('Privacy policy download - would generate PDF')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all"
                >
                  <Download size={16} />
                  Download Policy
                </button>
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-400" size={16} />
                  <span className="text-green-400 font-semibold">AES-256 Encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-400" size={16} />
                  <span className="text-green-400 font-semibold">RBAC Enforced</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-400" size={16} />
                  <span className="text-green-400 font-semibold">Full Audit Trail</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-400" size={16} />
                  <span className="text-green-400 font-semibold">Compliant Storage</span>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-slate-700">
              {['overview', 'collection', 'security', 'retention', 'rights'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-semibold transition-all ${
                    activeTab === tab
                      ? 'text-emerald-400 border-b-2 border-emerald-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <BookOpen className="text-emerald-400" size={24} />
                    Purpose & Scope
                  </h2>
                  <div className="space-y-4 text-slate-300 leading-relaxed">
                    <p>
                      This Data Governance & Privacy framework defines how CareBridge Pro collects, stores, processes, 
                      and protects data while ensuring <span className="font-bold text-emerald-400">no Protected Health Information (PHI)</span> is captured 
                      or stored unnecessarily.
                    </p>
                    <p>
                      This system is designed for <span className="font-bold text-white">wellness and engagement tracking, operational documentation, 
                      and care coordination</span> - not as a complete electronic health record (EHR).
                    </p>
                    <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 mt-4">
                      <div className="flex items-start gap-3">
                        <Info className="text-amber-400 flex-shrink-0 mt-1" size={20} />
                        <div>
                          <p className="text-amber-300 font-semibold mb-2">Important Notice</p>
                          <p className="text-amber-100 text-sm">
                            While some modules (medications, incidents, wellness data) may contain PHI, we implement strict access controls, 
                            encryption, and audit trails to ensure HIPAA-level protection even though we are not required to be HIPAA-compliant 
                            as a non-clinical wellness application.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <ShieldCheck className="text-green-400" size={20} />
                      Our Commitments
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={16} />
                        <span className="text-slate-300 text-sm">Minimal data collection - only what's necessary for service delivery</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={16} />
                        <span className="text-slate-300 text-sm">Full transparency about what data we collect and why</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={16} />
                        <span className="text-slate-300 text-sm">User protection above all - privacy by design</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={16} />
                        <span className="text-slate-300 text-sm">Industry-standard encryption and security measures</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={16} />
                        <span className="text-slate-300 text-sm">Regular audits and compliance reviews</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <ShieldAlert className="text-red-400" size={20} />
                      Data We DO NOT Collect
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <XCircle className="text-red-400 flex-shrink-0 mt-1" size={16} />
                        <span className="text-slate-300 text-sm">Social Security Numbers</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <XCircle className="text-red-400 flex-shrink-0 mt-1" size={16} />
                        <span className="text-slate-300 text-sm">Financial account information (bank accounts, credit cards)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <XCircle className="text-red-400 flex-shrink-0 mt-1" size={16} />
                        <span className="text-slate-300 text-sm">Biometric data (fingerprints, facial recognition)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <XCircle className="text-red-400 flex-shrink-0 mt-1" size={16} />
                        <span className="text-slate-300 text-sm">Complete medical records or lab results</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <XCircle className="text-red-400 flex-shrink-0 mt-1" size={16} />
                        <span className="text-slate-300 text-sm">Unnecessary personal identifiers</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Data Collection Tab */}
            {activeTab === 'collection' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Data Collection by Module</h2>
                  <p className="text-slate-400 mb-6">
                    Below is a comprehensive breakdown of what data we collect in each module of CareBridge Pro, 
                    the purpose for collection, retention period, and who has access.
                  </p>
                </div>

                <div className="space-y-4">
                  {dataCollectionByModule.map((module) => {
                    const Icon = module.icon;
                    const isExpanded = expandedSection === module.id;
                    
                    return (
                      <div
                        key={module.id}
                        className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedSection(isExpanded ? null : module.id)}
                          className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center`}>
                              <Icon className="text-white" size={24} />
                            </div>
                            <div className="text-left">
                              <h3 className="text-xl font-bold text-white">{module.title}</h3>
                              <p className="text-slate-400 text-sm">{module.collected.length} data fields collected</p>
                            </div>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="text-slate-400" size={24} />
                          ) : (
                            <ChevronRight className="text-slate-400" size={24} />
                          )}
                        </button>
                        
                        {isExpanded && (
                          <div className="px-6 pb-6 space-y-6 border-t border-slate-700/50 pt-6">
                            {/* Data Collected */}
                            <div>
                              <h4 className="text-lg font-bold text-white mb-3">Data Collected</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {module.collected.map((field, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Database size={14} className="text-slate-500" />
                                      <span className="text-slate-200 text-sm">{field.field}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {field.required && (
                                        <span className="px-2 py-0.5 bg-orange-900/30 text-orange-400 text-xs rounded">Required</span>
                                      )}
                                      <span className={`px-2 py-0.5 text-xs rounded ${
                                        field.type === 'phi' ? 'bg-red-900/30 text-red-400' :
                                        field.type === 'identifier' ? 'bg-blue-900/30 text-blue-400' :
                                        field.type === 'operational' ? 'bg-green-900/30 text-green-400' :
                                        field.type === 'wellness' ? 'bg-purple-900/30 text-purple-400' :
                                        field.type === 'aggregated' ? 'bg-cyan-900/30 text-cyan-400' :
                                        'bg-slate-700 text-slate-400'
                                      }`}>
                                        {field.type}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Data NOT Collected */}
                            <div>
                              <h4 className="text-lg font-bold text-white mb-3">Data NOT Collected</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {module.notCollected.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-2 bg-red-900/10 border border-red-500/20 rounded-lg p-3">
                                    <XCircle size={14} className="text-red-400 flex-shrink-0" />
                                    <span className="text-slate-300 text-sm">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Purpose, Retention, Access */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-slate-900/50 rounded-lg p-4">
                                <p className="text-slate-400 text-xs mb-2">Purpose</p>
                                <p className="text-white text-sm">{module.purpose}</p>
                              </div>
                              <div className="bg-slate-900/50 rounded-lg p-4">
                                <p className="text-slate-400 text-xs mb-2">Retention Period</p>
                                <p className="text-white text-sm">{module.retention}</p>
                              </div>
                              <div className="bg-slate-900/50 rounded-lg p-4">
                                <p className="text-slate-400 text-xs mb-2">Who Has Access</p>
                                <p className="text-white text-sm">{module.access}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-4">Security Measures & Data Protection</h2>
                  <p className="text-slate-400">
                    We implement industry-leading security practices to protect all data stored in CareBridge Pro.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {securityMeasures.map((category) => {
                    const Icon = category.icon;
                    return (
                      <div
                        key={category.category}
                        className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-lg flex items-center justify-center">
                            <Icon className="text-white" size={20} />
                          </div>
                          <h3 className="text-xl font-bold text-white">{category.category}</h3>
                        </div>
                        
                        <div className="space-y-3">
                          {category.measures.map((measure, idx) => (
                            <div key={idx} className="bg-slate-900/50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-white font-semibold text-sm">{measure.name}</p>
                                <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                                  measure.status === 'active' ? 'bg-green-900/30 text-green-400' :
                                  measure.status === 'recommended' ? 'bg-blue-900/30 text-blue-400' :
                                  measure.status === 'planned' ? 'bg-yellow-900/30 text-yellow-400' :
                                  'bg-slate-700 text-slate-400'
                                }`}>
                                  {measure.status}
                                </span>
                              </div>
                              <p className="text-slate-400 text-sm">{measure.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Allowed vs Prohibited Examples */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <MessageSquare className="text-cyan-400" size={24} />
                    Allowed vs. Prohibited Documentation Examples
                  </h2>
                  
                  <div className="space-y-6">
                    {allowedVsProhibited.map((category) => (
                      <div key={category.category} className="space-y-4">
                        <h3 className="text-lg font-bold text-white">{category.category}</h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="bg-green-900/10 border border-green-500/30 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <CheckCircle className="text-green-400" size={18} />
                              <h4 className="text-green-400 font-bold">Allowed ✓</h4>
                            </div>
                            <ul className="space-y-2">
                              {category.allowed.map((item, idx) => (
                                <li key={idx} className="text-green-100 text-sm flex items-start gap-2">
                                  <span className="text-green-400 mt-1">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="bg-red-900/10 border border-red-500/30 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <XCircle className="text-red-400" size={18} />
                              <h4 className="text-red-400 font-bold">Prohibited ✗</h4>
                            </div>
                            <ul className="space-y-2">
                              {category.prohibited.map((item, idx) => (
                                <li key={idx} className="text-red-100 text-sm flex items-start gap-2">
                                  <span className="text-red-400 mt-1">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Retention Tab */}
            {activeTab === 'retention' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <Calendar className="text-purple-400" size={24} />
                    Data Retention & Deletion Policies
                  </h2>
                  <p className="text-slate-400">
                    We retain data only as long as necessary for operational, legal, and regulatory purposes.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Data Type</th>
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Retention Period</th>
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataRetentionPolicies.map((policy, idx) => (
                          <tr key={idx} className="border-b border-slate-800 hover:bg-white/5 transition-all">
                            <td className="py-3 px-4 text-white font-medium">{policy.dataType}</td>
                            <td className="py-3 px-4 text-emerald-400 font-semibold">{policy.retention}</td>
                            <td className="py-3 px-4 text-slate-400 text-sm">{policy.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">User-Controlled Deletion</h3>
                  <div className="space-y-4 text-slate-300">
                    <p>
                      Individuals and guardians have the right to request deletion of:
                    </p>
                    <ul className="space-y-2 ml-6">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={16} />
                        <span>Personal profile information (subject to regulatory retention requirements)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={16} />
                        <span>Non-critical operational logs and preferences</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={16} />
                        <span>Wellness data not required for legal/regulatory compliance</span>
                      </li>
                    </ul>
                    <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 mt-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="text-amber-400 flex-shrink-0 mt-1" size={20} />
                        <div>
                          <p className="text-amber-300 font-semibold mb-1">Important Note</p>
                          <p className="text-amber-100 text-sm">
                            Some data (medication records, incident reports, etc.) must be retained for 7 years per 
                            Alabama state regulations and cannot be deleted upon request until the retention period expires.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rights Tab */}
            {activeTab === 'rights' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <Fingerprint className="text-blue-400" size={24} />
                    Your Privacy Rights
                  </h2>
                  <p className="text-slate-400 mb-6">
                    As a user of CareBridge Pro, you have the following rights regarding your data:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userRights.map((right) => {
                      const Icon = right.icon;
                      return (
                        <div
                          key={right.right}
                          className="bg-slate-900/50 border border-slate-700 rounded-xl p-5 hover:border-emerald-500/50 transition-all"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-lg flex items-center justify-center">
                              <Icon className="text-white" size={20} />
                            </div>
                            <h3 className="text-white font-bold">{right.right}</h3>
                          </div>
                          <p className="text-slate-400 text-sm">{right.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Data Breach Protocol */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <AlertOctagon className="text-red-400" size={24} />
                    Data Breach Protocol
                  </h2>
                  <p className="text-slate-400 mb-6">
                    In the unlikely event of a data breach, we follow a strict protocol:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white">Immediate Actions</h3>
                      <div className="space-y-3">
                        {[
                          { step: '1', action: 'Identify affected data and scope of breach' },
                          { step: '2', action: 'Stop further unauthorized access immediately' },
                          { step: '3', action: 'Notify admin and security team within 24 hours' },
                          { step: '4', action: 'Begin forensic investigation' }
                        ].map((item) => (
                          <div key={item.step} className="flex items-start gap-3 bg-slate-900/50 rounded-lg p-3">
                            <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {item.step}
                            </div>
                            <span className="text-slate-300 text-sm">{item.action}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white">Follow-Up Actions</h3>
                      <div className="space-y-3">
                        {[
                          { step: '5', action: 'Notify affected individuals within 72 hours' },
{ step: '6', action: 'Provide breach summary and mitigation steps' },
{ step: '7', action: 'Patch vulnerability and implement preventions' },
{ step: '8', action: 'Review and update security measures' }
].map((item) => (
<div key={item.step} className="flex items-start gap-3 bg-slate-900/50 rounded-lg p-3">
<div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
{item.step}
</div>
<span className="text-slate-300 text-sm">{item.action}</span>
</div>
))}
</div>
</div>
</div>
</div>
{/* Contact Information */}
                <div className="bg-gradient-to-r from-emerald-900/20 via-teal-900/20 to-emerald-900/20 border border-emerald-500/30 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Questions About Your Privacy?</h3>
                  <p className="text-slate-300 mb-4">
                    If you have questions about how we collect, use, or protect your data, please contact:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <p className="text-slate-400 text-xs mb-1">Privacy Officer</p>
                      <p className="text-white font-semibold">privacy@carebridge.com</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <p className="text-slate-400 text-xs mb-1">Data Protection</p>
                      <p className="text-white font-semibold">dataprotection@carebridge.com</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <p className="text-slate-400 text-xs mb-1">Support</p>
                      <p className="text-white font-semibold">support@carebridge.com</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Notice */}
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <Info className="text-blue-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-slate-300 text-sm">
                    <span className="font-semibold text-white">Last Updated:</span> January 15, 2026 •{' '}
                    <span className="font-semibold text-white">Version:</span> 2.0 •{' '}
                    <span className="font-semibold text-white">Next Review:</span> July 15, 2026
                  </p>
                  <p className="text-slate-400 text-xs mt-2">
                    This policy is reviewed every 6 months or whenever features are added. All changes are documented 
                    and users are notified of significant updates.
                  </p>
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

export default DataPrivacyPage