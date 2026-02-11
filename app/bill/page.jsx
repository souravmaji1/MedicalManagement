'use client'

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, Plus, Trash2, Calendar, DollarSign,
  FileText, CheckCircle, XCircle, Clock, AlertCircle,
  Download, Upload, Filter, Search, Eye, Edit2,Home,Pill,NetworkIcon,CreditCard,
  Users, Target, Shield, Activity, TrendingUp,
  Loader2, ChevronDown, ChevronRight, X, Check,
  AlertTriangle, Award, BarChart3, FileCheck,Bell,
  ClipboardList, BookOpen, Briefcase, Building2,
  RefreshCw, Settings,
  User2Icon
} from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { ScrollArea } from "../../components/ui/scroll-area";
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '../../contexts/userProfileContext';

const supabase = createClient(
  'https://bbikcxalypttfgrlxstf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWtjeGFseXB0dGZncmx4c3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODcwOCwiZXhwIjoyMDY5Mjk0NzA4fQ.4BLQyvPA0eB745Sfdn2Tl4oCDRTzNhLXrJ8Os8wOXfs'
);

const BillingModulePage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { userProfile, loading: profileLoading } = useUserProfile();
const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('bill');

  // State Management
  const [loading, setLoading] = useState(true);
  const [individuals, setIndividuals] = useState([]);
  const [serviceEncounters, setServiceEncounters] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedIndividual, setSelectedIndividual] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Billing Configuration States
  const [serviceCodes, setServiceCodes] = useState([]);
  const [authorizations, setAuthorizations] = useState([]);
  const [claims, setClaims] = useState([]);
  const [batches, setBatches] = useState([]);
  const [denials, setDenials] = useState([]);

  // Modal States
  const [showEncounterModal, setShowEncounterModal] = useState(false);
  const [showBatchBuilder, setShowBatchBuilder] = useState(false);
  const [showValidationDetail, setShowValidationDetail] = useState(null);
  const [showServiceCodeModal, setShowServiceCodeModal] = useState(false);
  const [showAuthorizationModal, setShowAuthorizationModal] = useState(false);
  const [selectedEncounter, setSelectedEncounter] = useState(null);
  const [saving, setSaving] = useState(false);



  // State Management
// Modal States

const [showEditEncounterModal, setShowEditEncounterModal] = useState(false); // ADD THIS LINE

const [editingEncounter, setEditingEncounter] = useState(null); // ADD THIS LINE TOO

const [staffMembers, setStaffMembers] = useState([]); // ADD THIS LINE

  // Form States
  const [encounterForm, setEncounterForm] = useState({
    individual_id: '',
    service_date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: '',
    service_code: '',
    service_type: '',
    location_type: 'Home',
    staff_id: userProfile?.id || '',
    staff_name: userProfile?.fullname || '',
    linked_isp_goal_id: '',
    choice_documented: false,
    note_id: '',
    units_calculated: 0,
    billing_validation_status: 'Hold',
    billing_hold_reasons: []
  });

  const [batchForm, setBatchForm] = useState({
    payer: 'Medicaid',
    state: 'AL',
    waiver_type: 'DD',
    billing_period_start: dateRange.start,
    billing_period_end: dateRange.end,
    selected_encounters: [],
    export_format: '837P'
  });

  const [serviceCodeForm, setServiceCodeForm] = useState({
    service_code: '',
    description: '',
    state: 'AL',
    waiver_type: 'DD',
    program_type: 'DD',
    unit_type: 'MIN_15',
    unit_rounding_rule: 'floor',
    requires_isp_link: false,
    requires_choice_doc: false,
    requires_location_type: false,
    allowed_location_types: [],
    requires_staff_role: false,
    allowed_staff_roles: [],
    requires_auth: false,
    max_units_per_day: null,
    max_units_per_week: null,
    is_active: true
  });

  const [authorizationForm, setAuthorizationForm] = useState({
    individual_id: '',
    payer: 'Medicaid',
    state: 'AL',
    waiver_type: 'DD',
    program_type: 'DD',
    auth_number: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    authorized_codes: [],
    units_authorized_total: 0,
    status: 'Active'
  });

  const [editingServiceCode, setEditingServiceCode] = useState(null);
const [showEditServiceCodeModal, setShowEditServiceCodeModal] = useState(false);


const [editingAuthorization, setEditingAuthorization] = useState(null);
const [showEditAuthorizationModal, setShowEditAuthorizationModal] = useState(false);

const handleEditAuthorization = (auth) => {
  setEditingAuthorization(auth);
  setAuthorizationForm({
    individual_id: auth.individual_id,
    payer: auth.payer,
    state: auth.state,
    waiver_type: auth.waiver_type,
    program_type: auth.program_type,
    auth_number: auth.auth_number,
    start_date: auth.start_date,
    end_date: auth.end_date,
    authorized_codes: auth.authorized_codes || [],
    units_authorized_total: auth.units_authorized_total,
    status: auth.status
  });
  setShowEditAuthorizationModal(true);
};

const handleUpdateAuthorization = async (e) => {
  e.preventDefault();
  
  try {
    setSaving(true);

    const { error } = await supabase
      .from('billing_authorizations')
      .update({
        individual_id: authorizationForm.individual_id,
        payer: authorizationForm.payer,
        state: authorizationForm.state,
        waiver_type: authorizationForm.waiver_type,
        program_type: authorizationForm.program_type,
        auth_number: authorizationForm.auth_number,
        start_date: authorizationForm.start_date,
        end_date: authorizationForm.end_date,
        authorized_codes: authorizationForm.authorized_codes,
        units_authorized_total: authorizationForm.units_authorized_total,
        status: authorizationForm.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', editingAuthorization.id);

    if (error) throw error;

    await loadBillingData();
    setShowEditAuthorizationModal(false);
    setEditingAuthorization(null);
    alert('Authorization updated successfully!');
  } catch (error) {
    console.error('Error updating authorization:', error);
    alert('Error updating authorization: ' + error.message);
  } finally {
    setSaving(false);
  }
};

const handleDeleteAuthorization = async (authId) => {
  if (!confirm('Are you sure you want to delete this authorization?')) return;
  
  try {
    const { error } = await supabase
      .from('billing_authorizations')
      .delete()
      .eq('id', authId);

    if (error) throw error;

    await loadBillingData();
    alert('Authorization deleted successfully!');
  } catch (error) {
    console.error('Error deleting authorization:', error);
    alert('Error deleting authorization: ' + error.message);
  }
};

const handleEditServiceCode = (code) => {
  setEditingServiceCode(code);
  setServiceCodeForm({
    service_code: code.service_code,
    description: code.description,
    state: code.state,
    waiver_type: code.waiver_type,
    program_type: code.program_type,
    unit_type: code.unit_type,
    unit_rounding_rule: code.unit_rounding_rule,
    requires_isp_link: code.requires_isp_link,
    requires_choice_doc: code.requires_choice_doc,
    requires_location_type: code.requires_location_type,
    allowed_location_types: code.allowed_location_types || [],
    requires_staff_role: code.requires_staff_role,
    allowed_staff_roles: code.allowed_staff_roles || [],
    requires_auth: code.requires_auth,
    max_units_per_day: code.max_units_per_day,
    max_units_per_week: code.max_units_per_week,
    is_active: code.is_active
  });
  setShowEditServiceCodeModal(true);
};

const handleUpdateServiceCode = async (e) => {
  e.preventDefault();
  
  try {
    setSaving(true);

    const { error } = await supabase
      .from('billing_service_codes')
      .update({
        description: serviceCodeForm.description,
        state: serviceCodeForm.state,
        waiver_type: serviceCodeForm.waiver_type,
        program_type: serviceCodeForm.program_type,
        unit_type: serviceCodeForm.unit_type,
        unit_rounding_rule: serviceCodeForm.unit_rounding_rule,
        requires_isp_link: serviceCodeForm.requires_isp_link,
        requires_choice_doc: serviceCodeForm.requires_choice_doc,
        requires_location_type: serviceCodeForm.requires_location_type,
        allowed_location_types: serviceCodeForm.allowed_location_types,
        requires_staff_role: serviceCodeForm.requires_staff_role,
        allowed_staff_roles: serviceCodeForm.allowed_staff_roles,
        requires_auth: serviceCodeForm.requires_auth,
        max_units_per_day: serviceCodeForm.max_units_per_day,
        max_units_per_week: serviceCodeForm.max_units_per_week,
        is_active: serviceCodeForm.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', editingServiceCode.id);

    if (error) throw error;

    await loadBillingData();
    setShowEditServiceCodeModal(false);
    setEditingServiceCode(null);
    alert('Service code updated successfully!');
  } catch (error) {
    console.error('Error updating service code:', error);
    alert('Error updating service code: ' + error.message);
  } finally {
    setSaving(false);
  }
};

const handleDeleteServiceCode = async (codeId) => {
  if (!confirm('Are you sure you want to delete this service code?')) return;
  
  try {
    const { error } = await supabase
      .from('billing_service_codes')
      .delete()
      .eq('id', codeId);

    if (error) throw error;

    await loadBillingData();
    alert('Service code deleted successfully!');
  } catch (error) {
    console.error('Error deleting service code:', error);
    alert('Error deleting service code: ' + error.message);
  }
};

  // Load data on mount
  useEffect(() => {
    if (isLoaded && user && !profileLoading && userProfile) {
      loadBillingData();
    }
  }, [isLoaded, user, profileLoading, userProfile]);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      
      // Load individuals
      const { data: individualsData, error: individualsError } = await supabase
        .from('individuals')
        .select('*')
        .order('firstname', { ascending: true });

      if (individualsError) throw individualsError;
      setIndividuals(individualsData || []);

      // Add this inside loadBillingData function after loading individuals
const { data: staffData, error: staffError } = await supabase
  .from('staff')
  .select('*')
  .eq('employment_status', 'Active')
  .order('staff_name', { ascending: true });

if (staffError) {
  console.log('Staff table not found:', staffError);
  setStaffMembers([]);
} else {
  setStaffMembers(staffData || []);
}

      // Load service encounters
      const { data: encountersData, error: encountersError } = await supabase
        .from('billing_service_encounters')
        .select('*')
        .order('service_date', { ascending: false });

      if (encountersError) {
        // Table might not exist yet, that's okay
        console.log('Service encounters table not found or empty:', encountersError);
        setServiceEncounters([]);
      } else {
        setServiceEncounters(encountersData || []);
      }

      // Load service codes
      const { data: codesData, error: codesError } = await supabase
        .from('billing_service_codes')
        .select('*')
        .eq('is_active', true)
        .order('service_code', { ascending: true });

      if (codesError) {
        console.log('Service codes table not found or empty:', codesError);
        setServiceCodes([]);
      } else {
        setServiceCodes(codesData || []);
      }

      // Load authorizations
      const { data: authData, error: authError } = await supabase
        .from('billing_authorizations')
        .select('*')
        .order('start_date', { ascending: false });

      if (authError) {
        console.log('Authorizations table not found or empty:', authError);
        setAuthorizations([]);
      } else {
        setAuthorizations(authData || []);
      }

      // Load batches
      const { data: batchesData, error: batchesError } = await supabase
        .from('billing_batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (batchesError) {
        console.log('Batches table not found or empty:', batchesError);
        setBatches([]);
      } else {
        setBatches(batchesData || []);
      }

      // Load claims
const { data: claimsData, error: claimsError } = await supabase
  .from('billing_claims')
  .select('*')
  .order('created_at', { ascending: false });

if (claimsError) {
  console.log('Claims table not found or empty:', claimsError);
  setClaims([]);
} else {
  setClaims(claimsData || []);
}

      // Load denials
      const { data: denialsData, error: denialsError } = await supabase
        .from('billing_denials')
        .select('*')
        .order('received_date', { ascending: false });

      if (denialsError) {
        console.log('Denials table not found or empty:', denialsError);
        setDenials([]);
      } else {
        setDenials(denialsData || []);
      }

    } catch (error) {
      console.error('Error loading billing data:', error);
      alert('Error loading billing data. Please ensure all billing tables are created in Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClaim = async (claimId) => {
  try {
    const { error } = await supabase
      .from('billing_claims')
      .update({
        status: 'Submitted',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('claim_id', claimId);

    if (error) throw error;

    await loadBillingData();
    alert('Claim submitted successfully!');
  } catch (error) {
    console.error('Error submitting claim:', error);
    alert('Error submitting claim: ' + error.message);
  }
};

const handleMarkClaimPaid = async (claimId) => {
  try {
    const { error } = await supabase
      .from('billing_claims')
      .update({
        status: 'Paid',
        updated_at: new Date().toISOString()
      })
      .eq('claim_id', claimId);

    if (error) throw error;

    await loadBillingData();
    alert('Claim marked as paid!');
  } catch (error) {
    console.error('Error updating claim:', error);
    alert('Error updating claim: ' + error.message);
  }
};

const handleCreateDenial = async (claim) => {
  const denialCode = prompt('Enter denial code (e.g., CO-97, PR-1):');
  if (!denialCode) return;

  const denialReason = prompt('Enter denial reason:');
  if (!denialReason) return;

  try {
    const denialToSave = {
      denial_id: `DEN-${Date.now()}`,
      claim_id: claim.claim_id,
      denial_code: denialCode,
      denial_reason_text: denialReason,
      received_date: new Date().toISOString().split('T')[0],
      status: 'Open'
    };

    const { error: denialError } = await supabase
      .from('billing_denials')
      .insert([denialToSave]);

    if (denialError) throw denialError;

    // Update claim status
    await supabase
      .from('billing_claims')
      .update({ status: 'Denied', updated_at: new Date().toISOString() })
      .eq('claim_id', claim.claim_id);

    await loadBillingData();
    alert('Denial created successfully!');
  } catch (error) {
    console.error('Error creating denial:', error);
    alert('Error creating denial: ' + error.message);
  }
};

const handleResolveDenial = async (denialId) => {
  try {
    const { error } = await supabase
      .from('billing_denials')
      .update({
        status: 'Resolved',
        updated_at: new Date().toISOString()
      })
      .eq('denial_id', denialId);

    if (error) throw error;

    await loadBillingData();
    alert('Denial marked as resolved!');
  } catch (error) {
    console.error('Error resolving denial:', error);
    alert('Error resolving denial: ' + error.message);
  }
};

  const handleViewBatchDetails = async (batch) => {
  try {
    // Get encounters in this batch
    const { data: batchEncounters, error } = await supabase
      .from('billing_batch_encounters')
      .select('encounter_id')
      .eq('batch_id', batch.batch_id);

    if (error) throw error;

    const encounterIds = batchEncounters.map(be => be.encounter_id);
    const batchEncounterDetails = serviceEncounters.filter(e => 
      encounterIds.includes(e.encounter_id)
    );

    // Create detail message
    let detailsMessage = `BATCH DETAILS\n\n`;
    detailsMessage += `Batch ID: ${batch.batch_id}\n`;
    detailsMessage += `Status: ${batch.status}\n`;
    detailsMessage += `Payer: ${batch.payer}\n`;
    detailsMessage += `State: ${batch.state}\n`;
    detailsMessage += `Period: ${new Date(batch.billing_period_start).toLocaleDateString()} - ${new Date(batch.billing_period_end).toLocaleDateString()}\n`;
    detailsMessage += `\nEncounters: ${batch.encounter_count}\n`;
    detailsMessage += `Total Units: ${batch.total_units}\n`;
    detailsMessage += `Total Amount: $${parseFloat(batch.total_amount).toLocaleString()}\n`;
    detailsMessage += `\nCreated By: ${batch.created_by}\n`;
    detailsMessage += `Created At: ${new Date(batch.created_at).toLocaleString()}\n`;
    
    if (batchEncounterDetails.length > 0) {
      detailsMessage += `\n--- ENCOUNTERS IN BATCH ---\n`;
      batchEncounterDetails.forEach((enc, idx) => {
        const ind = individuals.find(i => i.id === enc.individual_id);
        detailsMessage += `\n${idx + 1}. ${enc.encounter_id}\n`;
        detailsMessage += `   Individual: ${ind?.firstname} ${ind?.lastname}\n`;
        detailsMessage += `   Date: ${new Date(enc.service_date).toLocaleDateString()}\n`;
        detailsMessage += `   Service: ${enc.service_code} (${enc.units_calculated} units)\n`;
        detailsMessage += `   Amount: $${((parseFloat(enc.units_calculated) || 0) * 12).toFixed(2)}\n`;
      });
    }

    alert(detailsMessage);
  } catch (error) {
    console.error('Error viewing batch details:', error);
    alert('Error loading batch details: ' + error.message);
  }
};


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

// FIXED Validation Engine with proper time calculation
const validateEncounter = (encounter) => {
  const validationResults = {
    status: 'Ready',
    reasons: [],
    passed: {},
    failed: {}
  };

  // Basic Completeness
  if (!encounter.service_date) {
    validationResults.failed.service_date = 'Service date is required';
    validationResults.reasons.push('Missing service date');
  } else {
    validationResults.passed.service_date = true;
  }

  if (!encounter.start_time || !encounter.end_time) {
    validationResults.failed.time_valid = 'Start and end times required';
    validationResults.reasons.push('Missing time information');
  } else {
    // FIXED: Proper time calculation handling AM/PM
    const [startHour, startMin] = encounter.start_time.split(':').map(Number);
    const [endHour, endMin] = encounter.end_time.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    const totalMinutes = endMinutes > startMinutes 
      ? endMinutes - startMinutes 
      : (24 * 60 - startMinutes) + endMinutes; // Handle overnight shifts
    
    if (totalMinutes <= 0) {
      validationResults.failed.time_valid = 'End time must be after start time';
      validationResults.reasons.push('Invalid time range');
    } else {
      validationResults.passed.time_valid = true;
      encounter.units_calculated = Math.ceil(totalMinutes / 15);
      
      if (encounter.units_calculated < 1) {
        validationResults.failed.units_calculated = 'Service duration too short';
        validationResults.reasons.push('Service duration less than 15 minutes');
      } else {
        validationResults.passed.units_calculated = true;
      }
    }
  }

  if (!encounter.staff_id || !encounter.staff_name) {
    validationResults.failed.staff_id = 'Staff information is required';
    validationResults.reasons.push('Missing staff information');
  } else {
    validationResults.passed.staff_id = true;
  }

  if (!encounter.service_code) {
    validationResults.failed.service_code = 'Service code is required';
    validationResults.reasons.push('Missing service code');
  } else {
    validationResults.passed.service_code = true;
    
    const codeConfig = serviceCodes.find(sc => sc.service_code === encounter.service_code);
    if (!codeConfig) {
      validationResults.failed.code_exists = 'Service code not configured';
      validationResults.reasons.push('Service code not found in configuration');
    } else {
      validationResults.passed.code_exists = true;
      
      if (codeConfig.requires_isp_link && !encounter.linked_isp_goal_id) {
        validationResults.failed.isp_link = 'ISP goal link required';
        validationResults.reasons.push('Not linked to ISP goal');
      } else if (codeConfig.requires_isp_link) {
        validationResults.passed.isp_link = true;
      }
      
      if (codeConfig.requires_choice_doc && !encounter.choice_documented) {
        validationResults.failed.choice_documented = 'Choice documentation required';
        validationResults.reasons.push('Choice not documented');
      } else if (codeConfig.requires_choice_doc) {
        validationResults.passed.choice_documented = true;
      }
    }
  }

  // Final status determination
  if (validationResults.reasons.length === 0) {
    validationResults.status = 'Ready';
    encounter.billing_validation_status = 'Ready';
  } else {
    const criticalReasons = [
      'Missing service date', 'Missing time information', 
      'Missing staff information', 'Missing service code',
      'Service code not found in configuration'
    ];
    
    const hasCritical = validationResults.reasons.some(r => criticalReasons.includes(r));
    validationResults.status = hasCritical ? 'Not_Billable' : 'Hold';
    encounter.billing_validation_status = validationResults.status;
  }

  encounter.billing_hold_reasons = validationResults.reasons;
  return validationResults;
};

const handleEditEncounter = (encounter) => {
  setEditingEncounter(encounter);
  setEncounterForm({
    individual_id: encounter.individual_id,
    service_date: encounter.service_date,
    start_time: encounter.start_time,
    end_time: encounter.end_time,
    service_code: encounter.service_code,
    service_type: encounter.service_type || '',
    location_type: encounter.location_type,
    staff_id: encounter.staff_id,
    staff_name: encounter.staff_name,
    linked_isp_goal_id: encounter.linked_isp_goal_id || '',
    choice_documented: encounter.choice_documented,
    note_id: encounter.note_id || '',
    units_calculated: encounter.units_calculated,
    billing_validation_status: encounter.billing_validation_status,
    billing_hold_reasons: encounter.billing_hold_reasons || []
  });
  setShowEditEncounterModal(true);
};

const handleUpdateEncounter = async (e) => {
  e.preventDefault();
  
  try {
    setSaving(true);
    
    const validationResults = validateEncounter({...encounterForm});
    
    const { error } = await supabase
      .from('billing_service_encounters')
      .update({
        individual_id: encounterForm.individual_id,
        service_date: encounterForm.service_date,
        start_time: encounterForm.start_time,
        end_time: encounterForm.end_time,
        service_code: encounterForm.service_code,
        service_type: encounterForm.service_type,
        location_type: encounterForm.location_type,
        staff_id: encounterForm.staff_id,
        staff_name: encounterForm.staff_name,
        linked_isp_goal_id: encounterForm.linked_isp_goal_id || null,
        choice_documented: encounterForm.choice_documented,
        note_id: encounterForm.note_id || null,
        billing_validation_status: encounterForm.billing_validation_status,
        billing_hold_reasons: encounterForm.billing_hold_reasons,
        units_calculated: encounterForm.units_calculated,
        validated_at: new Date().toISOString(),
        validated_by: userProfile.fullname,
        updated_at: new Date().toISOString()
      })
      .eq('id', editingEncounter.id);

    if (error) throw error;

    await loadBillingData();
    setShowEditEncounterModal(false);
    setEditingEncounter(null);
    alert('Encounter updated successfully!');
  } catch (error) {
    console.error('Error updating encounter:', error);
    alert('Error updating encounter: ' + error.message);
  } finally {
    setSaving(false);
  }
};


  // Handle encounter form changes
 const handleEncounterChange = (e) => {
  const { name, value, type, checked } = e.target;
  
  setEncounterForm(prev => {
    const updated = {
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    };
    
    // Auto-calculate units when times change
    if (name === 'start_time' || name === 'end_time') {
      if (updated.start_time && updated.end_time) {
        const [startHour, startMin] = updated.start_time.split(':').map(Number);
        const [endHour, endMin] = updated.end_time.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        const totalMinutes = endMinutes > startMinutes 
          ? endMinutes - startMinutes 
          : (24 * 60 - startMinutes) + endMinutes;
        
        updated.units_calculated = Math.ceil(totalMinutes / 15);
      }
    }
    
    return updated;
  });
};

  const handleExportBatch = (batch) => {
  const csvContent = [
    ['Batch ID', 'Encounter ID', 'Service Date', 'Individual', 'Service Code', 'Units', 'Amount'],
    ...serviceEncounters
      .filter(e => e.billing_validation_status === 'Ready')
      .map(e => {
        const ind = individuals.find(i => i.id === e.individual_id);
        return [
          batch.batch_id,
          e.encounter_id,
          e.service_date,
          `${ind?.firstname || ''} ${ind?.lastname || ''}`,
          e.service_code,
          e.units_calculated,
          (parseFloat(e.units_calculated) * 12).toFixed(2)
        ];
      })
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${batch.batch_id}_export.csv`;
  a.click();
};

  // Save service encounter to Supabase
  const handleSaveEncounter = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Validate the encounter
      const validationResults = validateEncounter({...encounterForm});
      
      const encounterToSave = {
        encounter_id: `ENC-${Date.now()}`,
        individual_id: encounterForm.individual_id,
        home_id: individuals.find(i => i.id === encounterForm.individual_id)?.homeassignment || null,
        service_date: encounterForm.service_date,
        start_time: encounterForm.start_time,
        end_time: encounterForm.end_time,
        service_code: encounterForm.service_code,
        service_type: encounterForm.service_type,
        location_type: encounterForm.location_type,
        staff_id: encounterForm.staff_id,
        staff_name: encounterForm.staff_name,
        documentation_status: 'Signed',
        linked_isp_goal_id: encounterForm.linked_isp_goal_id || null,
        choice_documented: encounterForm.choice_documented,
        note_id: encounterForm.note_id || null,
        billing_validation_status: encounterForm.billing_validation_status,
        billing_hold_reasons: encounterForm.billing_hold_reasons,
        units_calculated: encounterForm.units_calculated,
        validation_version: 1,
        validated_at: new Date().toISOString(),
        validated_by: userProfile.fullname,
        created_by: userProfile.fullname
      };

      const { data, error } = await supabase
        .from('billing_service_encounters')
        .insert([encounterToSave])
        .select()
        .single();

      if (error) throw error;

      // Reload encounters
      await loadBillingData();
      
      setShowEncounterModal(false);
      
      // Reset form
      setEncounterForm({
        individual_id: '',
        service_date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        service_code: '',
        service_type: '',
        location_type: 'Home',
        staff_id: userProfile?.id || '',
        staff_name: userProfile?.fullname || '',
        linked_isp_goal_id: '',
        choice_documented: false,
        note_id: '',
        units_calculated: 0,
        billing_validation_status: 'Hold',
        billing_hold_reasons: []
      });

      alert('Service encounter created successfully!');
    } catch (error) {
      console.error('Error saving encounter:', error);
      alert('Error saving encounter: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

 const handleGenerateBatch = async () => {
  try {
    setSaving(true);
    
    const selectedEncounterRecords = serviceEncounters.filter(e => 
      batchForm.selected_encounters.includes(e.id) && 
      e.billing_validation_status === 'Ready'
    );

    if (selectedEncounterRecords.length === 0) {
      alert('No ready encounters selected for batch.');
      return;
    }

    const totalUnits = selectedEncounterRecords.reduce((sum, e) => sum + (parseFloat(e.units_calculated) || 0), 0);
    const estimatedAmount = totalUnits * 12;

    const batchToSave = {
      batch_id: `BATCH-${Date.now()}`,
      payer: batchForm.payer,
      state: batchForm.state,
      waiver_type: batchForm.waiver_type,
      billing_period_start: batchForm.billing_period_start,
      billing_period_end: batchForm.billing_period_end,
      encounter_count: selectedEncounterRecords.length,
      total_units: totalUnits,
      total_amount: estimatedAmount,
      export_format: batchForm.export_format,
      status: 'Generated',
      created_by: userProfile.fullname
    };

    // Save batch
    const { data: batchData, error: batchError } = await supabase
      .from('billing_batches')
      .insert([batchToSave])
      .select()
      .single();

    if (batchError) throw batchError;

    // Save batch-encounter relationships
    const batchEncounterLinks = selectedEncounterRecords.map(enc => ({
      batch_id: batchData.batch_id,
      encounter_id: enc.encounter_id
    }));

    const { error: linksError } = await supabase
      .from('billing_batch_encounters')
      .insert(batchEncounterLinks);

    if (linksError) throw linksError;

    // Reload data
    await loadBillingData();
    
    setShowBatchBuilder(false);
    setBatchForm({
      payer: 'Medicaid',
      state: 'AL',
      waiver_type: 'DD',
      billing_period_start: dateRange.start,
      billing_period_end: dateRange.end,
      selected_encounters: [],
      export_format: '837P'
    });

    alert(`Batch created successfully!\n\nBatch ID: ${batchData.batch_id}\nEncounters: ${selectedEncounterRecords.length}\n\nYou can now create a claim from this batch.`);
  } catch (error) {
    console.error('Error creating batch:', error);
    alert('Error creating batch: ' + error.message);
  } finally {
    setSaving(false);
  }
};

const handleCreateClaimFromBatch = async (batch) => {
  try {
    setSaving(true);

    // Get encounters in this batch
    const { data: batchEncounters, error: beError } = await supabase
      .from('billing_batch_encounters')
      .select('encounter_id')
      .eq('batch_id', batch.batch_id);

    if (beError) throw beError;

    const encounterIds = batchEncounters.map(be => be.encounter_id);
    const batchEncounterDetails = serviceEncounters.filter(e => 
      encounterIds.includes(e.encounter_id)
    );

    // Create claim
    const claimToSave = {
      claim_id: `CLM-${Date.now()}`,
      payer: batch.payer,
      state: batch.state,
      waiver_type: batch.waiver_type,
      billing_period_start: batch.billing_period_start,
      billing_period_end: batch.billing_period_end,
      batch_id: batch.batch_id,
      status: 'Draft',
      total_units: batch.total_units,
      total_amount: batch.total_amount,
      export_format: batch.export_format,
      submission_method: 'Manual Upload',
      created_by: userProfile.fullname
    };

    const { data: claimData, error: claimError } = await supabase
      .from('billing_claims')
      .insert([claimToSave])
      .select()
      .single();

    if (claimError) throw claimError;

    // Create claim lines
  const claimLines = batchEncounterDetails.map((enc, index) => ({
  claim_line_id: `CL-${claimData.claim_id}-${Date.now()}-${index}`,
  claim_id: claimData.claim_id,
  encounter_id: enc.encounter_id,
  service_code: enc.service_code,
  units: enc.units_calculated,
  amount: (parseFloat(enc.units_calculated) || 0) * 12,
  modifiers: [],
  place_of_service: enc.location_type,
  rendering_provider_npi: enc.staff_id,
  billing_provider_npi: 'PROVIDER_NPI',
  status: 'Included'
}));

    const { error: claimLinesError } = await supabase
      .from('billing_claim_lines')
      .insert(claimLines);

    if (claimLinesError) throw claimLinesError;

    // Update batch status
    await supabase
      .from('billing_batches')
      .update({ status: 'Claimed', updated_at: new Date().toISOString() })
      .eq('batch_id', batch.batch_id);

    await loadBillingData();
    alert(`Claim created successfully!\n\nClaim ID: ${claimData.claim_id}\nBatch: ${batch.batch_id}\nAmount: $${parseFloat(batch.total_amount).toLocaleString()}`);
  } catch (error) {
    console.error('Error creating claim:', error);
    alert('Error creating claim: ' + error.message);
  } finally {
    setSaving(false);
  }
};

  // Save service code configuration
  const handleSaveServiceCode = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);

      const codeToSave = {
        service_code_id: `SC-${Date.now()}`,
        ...serviceCodeForm,
        allowed_location_types: serviceCodeForm.allowed_location_types || [],
        allowed_staff_roles: serviceCodeForm.allowed_staff_roles || [],
        requires_credentials: serviceCodeForm.requires_credentials || []
      };

      const { data, error } = await supabase
        .from('billing_service_codes')
        .insert([codeToSave])
        .select()
        .single();

      if (error) throw error;

      await loadBillingData();
      setShowServiceCodeModal(false);
      
      // Reset form
      setServiceCodeForm({
        service_code: '',
        description: '',
        state: 'AL',
        waiver_type: 'DD',
        program_type: 'DD',
        unit_type: 'MIN_15',
        unit_rounding_rule: 'floor',
        requires_isp_link: false,
        requires_choice_doc: false,
        requires_location_type: false,
        allowed_location_types: [],
        requires_staff_role: false,
        allowed_staff_roles: [],
        requires_auth: false,
        max_units_per_day: null,
        max_units_per_week: null,
        is_active: true
      });

      alert('Service code configuration saved successfully!');
    } catch (error) {
      console.error('Error saving service code:', error);
      alert('Error saving service code: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Save authorization
  const handleSaveAuthorization = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);

      const authToSave = {
        authorization_id: `AUTH-${Date.now()}`,
        ...authorizationForm,
        units_used_total: 0,
        authorized_codes: authorizationForm.authorized_codes || []
      };

      const { data, error } = await supabase
        .from('billing_authorizations')
        .insert([authToSave])
        .select()
        .single();

      if (error) throw error;

      await loadBillingData();
      setShowAuthorizationModal(false);
      
      // Reset form
      setAuthorizationForm({
        individual_id: '',
        payer: 'Medicaid',
        state: 'AL',
        waiver_type: 'DD',
        program_type: 'DD',
        auth_number: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        authorized_codes: [],
        units_authorized_total: 0,
        status: 'Active'
      });

      alert('Authorization saved successfully!');
    } catch (error) {
      console.error('Error saving authorization:', error);
      alert('Error saving authorization: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Calculate statistics
  const stats = {
    ready: serviceEncounters.filter(e => e.billing_validation_status === 'Ready').length,
    hold: serviceEncounters.filter(e => e.billing_validation_status === 'Hold').length,
    not_billable: serviceEncounters.filter(e => e.billing_validation_status === 'Not_Billable').length,
    estimated_revenue: serviceEncounters
      .filter(e => e.billing_validation_status === 'Ready')
      .reduce((sum, e) => sum + ((parseFloat(e.units_calculated) || 0) * 12), 0),
    revenue_at_risk: serviceEncounters
      .filter(e => e.billing_validation_status === 'Hold')
      .reduce((sum, e) => sum + ((parseFloat(e.units_calculated) || 0) * 12), 0)
  };

  // Filter encounters
  const filteredEncounters = serviceEncounters.filter(encounter => {
    const matchesStatus = filterStatus === 'all' || encounter.billing_validation_status === filterStatus;
    const matchesSearch = !searchTerm || 
      encounter.service_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      encounter.staff_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      encounter.encounter_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      individuals.find(i => i.id === encounter.individual_id)?.firstname?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = (!dateRange.start || encounter.service_date >= dateRange.start) &&
                       (!dateRange.end || encounter.service_date <= dateRange.end);
    
    return matchesStatus && matchesSearch && matchesDate;
  });

  if (!isLoaded || loading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Loading billing module...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'encounters', label: 'Service Encounters', icon: ClipboardList },
    { id: 'batches', label: 'Claim Batches', icon: FileCheck },
    { id: 'claims', label: 'Claims Register', icon: FileText },
    { id: 'denials', label: 'Denials & Corrections', icon: AlertTriangle },
    { id: 'authorizations', label: 'Authorizations', icon: Shield },
    { id: 'config', label: 'Configuration', icon: Settings }
  ];

  return (
      <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
      <NavBar />
      
       <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        {/* Header */}

     <div className="flex-1 overflow-hidden">
                 <ScrollArea className="h-full">
                   <main className="p-6 lg:p-8">
                     <div className="max-w-5xl mx-auto space-y-6">
                   
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/individual')}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500">
                CareBridge Billing Module
              </h1>
              <p className="text-slate-400 mt-1">Documentation-Driven Claims Pipeline</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadBillingData}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
            <button
              onClick={() => setShowEncounterModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all"
            >
              <Plus size={18} />
              New Encounter
            </button>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-emerald-600/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-emerald-400" size={24} />
              <span className="text-2xl font-bold text-white">{stats.ready}</span>
            </div>
            <p className="text-slate-300 text-sm font-semibold">Ready to Bill</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-600/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="text-yellow-400" size={24} />
              <span className="text-2xl font-bold text-white">{stats.hold}</span>
            </div>
            <p className="text-slate-300 text-sm font-semibold">On Hold</p>
          </div>
          <div className="bg-gradient-to-br from-red-600/20 to-pink-500/20 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="text-red-400" size={24} />
              <span className="text-2xl font-bold text-white">{stats.not_billable}</span>
            </div>
            <p className="text-slate-300 text-sm font-semibold">Not Billable</p>
          </div>
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="text-blue-400" size={24} />
              <span className="text-2xl font-bold text-white">${stats.estimated_revenue.toLocaleString()}</span>
            </div>
            <p className="text-slate-300 text-sm font-semibold">Est. Billable</p>
          </div>
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="text-purple-400" size={24} />
              <span className="text-2xl font-bold text-white">${stats.revenue_at_risk.toLocaleString()}</span>
            </div>
            <p className="text-slate-300 text-sm font-semibold">Revenue at Risk</p>
          </div>
        </div>

        {/* Navigation Tabs - Now responsive */}
<div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-1 md:p-2 flex flex-wrap md:flex-nowrap gap-1 md:gap-2 overflow-x-auto">
  
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
       {/* Content Area */}
<div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
  <div>
              
              {/* DASHBOARD TAB */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">Billing Dashboard</h3>
                    <p className="text-slate-400 mb-6">
                      Overview of billing status, queues, and key metrics
                    </p>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setShowEncounterModal(true)}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-6 transition-all text-left group"
                    >
                      <Plus className="text-emerald-400 mb-3 group-hover:scale-110 transition-transform" size={32} />
                      <h4 className="text-white font-bold text-lg mb-2">Create Service Encounter</h4>
                      <p className="text-slate-400 text-sm">Document a new billable service</p>
                    </button>

                    <button
                      onClick={() => setShowBatchBuilder(true)}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-6 transition-all text-left group"
                    >
                      <FileCheck className="text-blue-400 mb-3 group-hover:scale-110 transition-transform" size={32} />
                      <h4 className="text-white font-bold text-lg mb-2">Generate Batch</h4>
                      <p className="text-slate-400 text-sm">Create claim batch from ready encounters</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('encounters')}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-6 transition-all text-left group"
                    >
                      <ClipboardList className="text-purple-400 mb-3 group-hover:scale-110 transition-transform" size={32} />
                      <h4 className="text-white font-bold text-lg mb-2">Review Encounters</h4>
                      <p className="text-slate-400 text-sm">View and manage service encounters</p>
                    </button>
                  </div>

                  {/* Holds by Reason */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <AlertCircle className="text-yellow-400" size={24} />
                      Top Hold Reasons
                    </h4>
                    {stats.hold === 0 ? (
                      <p className="text-slate-400">No encounters on hold</p>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(
                          serviceEncounters
                            .filter(e => e.billing_validation_status === 'Hold')
                            .reduce((acc, e) => {
                              const reasons = Array.isArray(e.billing_hold_reasons) ? e.billing_hold_reasons : [];
                              reasons.forEach(reason => {
                                acc[reason] = (acc[reason] || 0) + 1;
                              });
                              return acc;
                            }, {})
                        )
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([reason, count]) => (
                            <div key={reason} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                              <span className="text-slate-300">{reason}</span>
                              <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-sm font-bold">
                                {count}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Batches */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <FileCheck className="text-blue-400" size={24} />
                      Recent Claim Batches
                    </h4>
                    {batches.length === 0 ? (
                      <p className="text-slate-400">No batches created yet</p>
                    ) : (
                      <div className="space-y-3">
                        {batches.slice(0, 5).map(batch => (
                          <div key={batch.id} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-4">
                            <div>
                              <p className="text-white font-semibold">{batch.batch_id}</p>
                              <p className="text-slate-400 text-sm">
                                {batch.encounter_count} encounters • {batch.payer} • {batch.state}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-emerald-400 font-bold">${parseFloat(batch.total_amount).toLocaleString()}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                batch.status === 'Draft' ? 'bg-slate-700 text-slate-300' :
                                batch.status === 'Submitted' ? 'bg-blue-600/20 text-blue-400' :
                                batch.status === 'Accepted' ? 'bg-green-600/20 text-green-400' :
                                'bg-red-600/20 text-red-400'
                              }`}>
                                {batch.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SERVICE ENCOUNTERS TAB */}
              {activeTab === 'encounters' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Service Encounters</h3>
                      <p className="text-slate-400">
                        Manage and validate billable service encounters
                      </p>
                    </div>
                    <button
                      onClick={() => setShowEncounterModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all"
                    >
                      <Plus size={16} />
                      New Encounter
                    </button>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 flex items-center gap-3 bg-slate-900/50 rounded-xl px-5 py-3 border border-slate-700/50">
                      <Search size={20} className="text-slate-400" />
                      <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search encounters..." 
                        className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-500"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="all">All Status</option>
                      <option value="Ready">Ready</option>
                      <option value="Hold">Hold</option>
                      <option value="Not_Billable">Not Billable</option>
                    </select>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Encounters Table */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-900/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Encounter ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Individual</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Service Code</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Units</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Staff</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                          {filteredEncounters.length === 0 ? (
                            <tr>
                              <td colSpan="9" className="px-4 py-8 text-center text-slate-400">
                                No service encounters found
                              </td>
                            </tr>
                          ) : (
                            filteredEncounters.map(encounter => {
                              const individual = individuals.find(i => i.id === encounter.individual_id);
                              const amount = (parseFloat(encounter.units_calculated) || 0) * 12;
                              
                              return (
                                <tr key={encounter.id} className="hover:bg-slate-700/30 transition-colors">
                                  <td className="px-4 py-3 text-sm text-white font-mono">
                                    {encounter.encounter_id}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-white">
                                    {new Date(encounter.service_date).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-white">
                                    {individual ? `${individual.firstname} ${individual.lastname}` : 'Unknown'}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-white font-mono">
                                    {encounter.service_code || 'N/A'}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-white">
                                    {encounter.units_calculated || 0}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-white">
                                    {encounter.staff_name}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                                      encounter.billing_validation_status === 'Ready' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' :
                                      encounter.billing_validation_status === 'Hold' ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30' :
                                      'bg-red-600/20 text-red-400 border border-red-500/30'
                                    }`}>
                                      {encounter.billing_validation_status === 'Ready' && <CheckCircle size={12} />}
                                      {encounter.billing_validation_status === 'Hold' && <Clock size={12} />}
                                      {encounter.billing_validation_status === 'Not_Billable' && <XCircle size={12} />}
                                      {encounter.billing_validation_status.replace('_', ' ')}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm font-bold text-emerald-400">
                                    ${amount.toFixed(2)}
                                  </td>
                                
                        
<td className="px-4 py-3">
  <div className="flex items-center gap-2">
    <button
      onClick={() => setShowValidationDetail(encounter)}
      className="p-2 hover:bg-slate-600/50 rounded-lg transition-all"
      title="View Details"
    >
      <Eye size={16} className="text-blue-400" />
    </button>
    <button
      onClick={() => handleEditEncounter(encounter)}
      className="p-2 hover:bg-slate-600/50 rounded-lg transition-all"
      title="Edit Encounter"
    >
      <Edit2 size={16} className="text-emerald-400" />
    </button>
    <button
      onClick={async () => {
        if (confirm('Delete this encounter?')) {
          await supabase.from('billing_service_encounters').delete().eq('id', encounter.id);
          loadBillingData();
        }
      }}
      className="p-2 hover:bg-slate-600/50 rounded-lg transition-all"
      title="Delete"
    >
      <Trash2 size={16} className="text-red-400" />
    </button>
  </div>
</td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}



              {/* CLAIM BATCHES TAB */}
              {activeTab === 'batches' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Claim Batches</h3>
                      <p className="text-slate-400">
                        Create and manage claim batches for submission
                      </p>
                    </div>
                    <button
                      onClick={() => setShowBatchBuilder(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
                    >
                      <Plus size={16} />
                      New Batch
                    </button>
                  </div>

                  {batches.length === 0 ? (
                    <div className="text-center py-16 bg-slate-800/50 border border-slate-700 rounded-xl">
                      <FileCheck className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-slate-400 mb-2">No Batches Created</h4>
                      <p className="text-slate-500 mb-6">Create your first claim batch to begin submissions</p>
                      <button
                        onClick={() => setShowBatchBuilder(true)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all"
                      >
                        Create First Batch
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {batches.map(batch => (
                        <div key={batch.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-xl font-bold text-white mb-2">{batch.batch_id}</h4>
                              <div className="flex items-center gap-4 text-sm text-slate-400">
                                <span>Payer: {batch.payer}</span>
                                <span>State: {batch.state}</span>
                                <span>Waiver: {batch.waiver_type}</span>
                                <span>Period: {new Date(batch.billing_period_start).toLocaleDateString()} - {new Date(batch.billing_period_end).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                              batch.status === 'Draft' ? 'bg-slate-700 text-slate-300' :
                              batch.status === 'Generated' ? 'bg-purple-600/20 text-purple-400' :
                              batch.status === 'Submitted' ? 'bg-blue-600/20 text-blue-400' :
                              batch.status === 'Accepted' ? 'bg-green-600/20 text-green-400' :
                              batch.status === 'Denied' ? 'bg-red-600/20 text-red-400' :
                              'bg-emerald-600/20 text-emerald-400'
                            }`}>
                              {batch.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-4 gap-4 mb-4">
                            <div className="bg-slate-900/50 rounded-lg p-3">
                              <p className="text-xs text-slate-400 mb-1">Services</p>
                              <p className="text-xl font-bold text-white">{batch.encounter_count}</p>
                            </div>
                            <div className="bg-slate-900/50 rounded-lg p-3">
                              <p className="text-xs text-slate-400 mb-1">Total Units</p>
                              <p className="text-xl font-bold text-white">{batch.total_units}</p>
                            </div>
                            <div className="bg-slate-900/50 rounded-lg p-3">
                              <p className="text-xs text-slate-400 mb-1">Total Amount</p>
                              <p className="text-xl font-bold text-emerald-400">${parseFloat(batch.total_amount).toLocaleString()}</p>
                            </div>
                            <div className="bg-slate-900/50 rounded-lg p-3">
                              <p className="text-xs text-slate-400 mb-1">Created By</p>
                              <p className="text-sm font-semibold text-white">{batch.created_by}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                           <button 
  onClick={() => handleExportBatch(batch)}
  className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg font-semibold transition-all flex items-center gap-2"
>
  <Download size={16} />
  Export CSV
</button>

<button 
    onClick={() => handleViewBatchDetails(batch)}
    className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg font-semibold transition-all flex items-center gap-2"
  >
    <Eye size={16} />
    View Details
  </button>


  {(batch.status === 'Generated' || batch.status === 'Draft') && (
    <button 
      onClick={() => handleCreateClaimFromBatch(batch)}
      disabled={saving}
      className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
    >
      <FileCheck size={16} />
      Create Claim
    </button>
  )}
  {batch.status === 'Claimed' && (
    <span className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg font-semibold flex items-center gap-2">
      <CheckCircle size={16} />
      Claim Created
    </span>
  )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* AUTHORIZATIONS TAB */}
              {activeTab === 'authorizations' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Authorizations</h3>
                      <p className="text-slate-400">
                        Manage service authorizations and track unit usage
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAuthorizationModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all"
                    >
                      <Plus size={16} />
                      New Authorization
                    </button>
                  </div>

                  {authorizations.length === 0 ? (
                    <div className="text-center py-16 bg-slate-800/50 border border-slate-700 rounded-xl">
                      <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-slate-400 mb-2">No Authorizations</h4>
                      <p className="text-slate-500 mb-6">Add service authorizations for individuals</p>
                      <button
                        onClick={() => setShowAuthorizationModal(true)}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all"
                      >
                        Add First Authorization
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {authorizations.map(auth => {
                        const individual = individuals.find(i => i.id === auth.individual_id);
                        const unitsRemaining = (auth.units_authorized_total || 0) - (auth.units_used_total || 0);
                        const percentUsed = auth.units_authorized_total > 0 
                          ? ((auth.units_used_total || 0) / auth.units_authorized_total * 100).toFixed(0)
                          : 0;

                        return (
                          <div key={auth.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="text-xl font-bold text-white mb-2">
                                  {individual ? `${individual.firstname} ${individual.lastname}` : 'Unknown Individual'}
                                </h4>
                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                  <span>Auth #: {auth.auth_number}</span>
                                  <span>Payer: {auth.payer}</span>
                                  <span>State: {auth.state}</span>
                                </div>
                              </div>
                              <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                                auth.status === 'Active' ? 'bg-green-600/20 text-green-400' :
                                auth.status === 'Expired' ? 'bg-red-600/20 text-red-400' :
                                auth.status === 'Exhausted' ? 'bg-orange-600/20 text-orange-400' :
                                'bg-slate-700 text-slate-300'
                              }`}>
                                {auth.status}
                              </span>
                            </div>



                            <div className="grid grid-cols-4 gap-4 mb-4">
                              <div className="bg-slate-900/50 rounded-lg p-3">
                                <p className="text-xs text-slate-400 mb-1">Start Date</p>
                                <p className="text-sm font-semibold text-white">
                                  {new Date(auth.start_date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="bg-slate-900/50 rounded-lg p-3">
                                <p className="text-xs text-slate-400 mb-1">End Date</p>
                                <p className="text-sm font-semibold text-white">
                                  {new Date(auth.end_date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="bg-slate-900/50 rounded-lg p-3">
                                <p className="text-xs text-slate-400 mb-1">Units Authorized</p>
                                <p className="text-xl font-bold text-white">{auth.units_authorized_total}</p>
                              </div>
                              <div className="bg-slate-900/50 rounded-lg p-3">
                                <p className="text-xs text-slate-400 mb-1">Units Remaining</p>
                                <p className={`text-xl font-bold ${
                                  unitsRemaining > 50 ? 'text-green-400' :
                                  unitsRemaining > 20 ? 'text-yellow-400' :
                                  'text-red-400'
                                }`}>
                                  {unitsRemaining}
                                </p>
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">Usage</span>
                                <span className="text-sm font-bold text-white">{percentUsed}%</span>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-2">
                                <div 
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    percentUsed < 70 ? 'bg-gradient-to-r from-green-600 to-emerald-500' :
                                    percentUsed < 90 ? 'bg-gradient-to-r from-yellow-600 to-orange-500' :
                                    'bg-gradient-to-r from-red-600 to-pink-500'
                                  }`}
                                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 mt-4">
  <button
    onClick={() => handleEditAuthorization(auth)}
    className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg font-semibold transition-all"
  >
    <Edit2 size={16} />
    Edit
  </button>
  <button
    onClick={() => handleDeleteAuthorization(auth.id)}
    className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-semibold transition-all"
  >
    <Trash2 size={16} />
    Delete
  </button>
</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* CONFIGURATION TAB */}
              {activeTab === 'config' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Billing Configuration</h3>
                    <p className="text-slate-400">
                      Manage billing codes, rules, and state configurations
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                      <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <BookOpen className="text-emerald-400" size={20} />
                        Service Codes ({serviceCodes.length})
                      </h4>
                      <p className="text-slate-400 mb-4">
                        Manage billable service codes and requirements
                      </p>
                      <button 
                        onClick={() => setShowServiceCodeModal(true)}
                        className="w-full px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg font-semibold transition-all"
                      >
                        Add Service Code
                      </button>

                      {serviceCodes.length > 0 && (
                        <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                         {serviceCodes.map(code => (
  <div key={code.id} className="bg-slate-900/50 rounded-lg p-3">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-white font-semibold font-mono">{code.service_code}</p>
        <p className="text-xs text-slate-400">{code.description}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
          {code.unit_type}
        </span>
        <button
          onClick={() => handleEditServiceCode(code)}
          className="p-1.5 hover:bg-slate-700 rounded transition-all"
          title="Edit"
        >
          <Edit2 size={14} className="text-emerald-400" />
        </button>
        <button
          onClick={() => handleDeleteServiceCode(code.id)}
          className="p-1.5 hover:bg-slate-700 rounded transition-all"
          title="Delete"
        >
          <Trash2 size={14} className="text-red-400" />
        </button>
      </div>
    </div>
  </div>
))}
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                      <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Building2 className="text-blue-400" size={20} />
                        Database Tables Status
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                          <span className="text-slate-300">Service Encounters</span>
                          <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-bold">
                            {serviceEncounters.length} records
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                          <span className="text-slate-300">Service Codes</span>
                          <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-bold">
                            {serviceCodes.length} records
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                          <span className="text-slate-300">Authorizations</span>
                          <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-bold">
                            {authorizations.length} records
                          </span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                          <span className="text-slate-300">Batches</span>
                          <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-bold">
                            {batches.length} records
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

     {activeTab === 'claims' && (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Claims Register</h3>
        <p className="text-slate-400">Track submitted claims and their status</p>
      </div>
    </div>

    {claims.length === 0 ? (
      <div className="text-center py-16 bg-slate-800/50 border border-slate-700 rounded-xl">
        <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h4 className="text-xl font-bold text-slate-400 mb-2">No Claims Submitted</h4>
        <p className="text-slate-500">Claims will appear here once batches are submitted</p>
      </div>
    ) : (
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Claim ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Payer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Period</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Units</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Submitted</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {claims.map(claim => (
              <tr key={claim.id} className="hover:bg-slate-700/30">
                <td className="px-4 py-3 text-sm text-white font-mono">{claim.claim_id}</td>
                <td className="px-4 py-3 text-sm text-white">{claim.payer}</td>
                <td className="px-4 py-3 text-sm text-white">
                  {new Date(claim.billing_period_start).toLocaleDateString()} - {new Date(claim.billing_period_end).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-white">{claim.total_units}</td>
                <td className="px-4 py-3 text-sm font-bold text-emerald-400">${parseFloat(claim.total_amount).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    claim.status === 'Paid' ? 'bg-green-600/20 text-green-400' :
                    claim.status === 'Submitted' ? 'bg-blue-600/20 text-blue-400' :
                    claim.status === 'Denied' ? 'bg-red-600/20 text-red-400' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {claim.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-400">
                  {claim.submitted_at ? new Date(claim.submitted_at).toLocaleDateString() : 'Not submitted'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {claim.status === 'Draft' && (
                      <button
                        onClick={() => handleSubmitClaim(claim.claim_id)}
                        className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-xs font-semibold transition-all"
                      >
                        Submit
                      </button>
                    )}
                    {claim.status === 'Submitted' && (
                      <>
                        <button
                          onClick={() => handleMarkClaimPaid(claim.claim_id)}
                          className="px-3 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded text-xs font-semibold transition-all"
                        >
                          Mark Paid
                        </button>
                        <button
                          onClick={() => handleCreateDenial(claim)}
                          className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-xs font-semibold transition-all"
                        >
                          Create Denial
                        </button>
                      </>
                    )}
                    {claim.status === 'Paid' && (
                      <span className="px-3 py-1 bg-green-600/10 text-green-400 rounded text-xs font-semibold">
                        Completed
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}


{activeTab === 'denials' && (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Denials & Corrections</h3>
        <p className="text-slate-400">Manage denied claims and submit corrections</p>
      </div>
    </div>

    {denials.length === 0 ? (
      <div className="text-center py-16 bg-slate-800/50 border border-slate-700 rounded-xl">
        <AlertTriangle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h4 className="text-xl font-bold text-slate-400 mb-2">No Denials</h4>
        <p className="text-slate-500">Denied claims will appear here for correction</p>
      </div>
    ) : (
      <div className="space-y-4">
        {denials.map(denial => (
          <div key={denial.id} className="bg-slate-800/50 border border-red-500/30 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold text-white mb-2">{denial.denial_id}</h4>
                <p className="text-sm text-slate-400">Claim: {denial.claim_id}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                denial.status === 'Open' ? 'bg-red-600/20 text-red-400' :
                denial.status === 'Resolved' ? 'bg-green-600/20 text-green-400' :
                'bg-yellow-600/20 text-yellow-400'
              }`}>
                {denial.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Denial Code</p>
                <p className="text-lg font-bold text-red-400">{denial.denial_code}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Received Date</p>
                <p className="text-sm font-semibold text-white">{new Date(denial.received_date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
              <p className="text-xs text-slate-400 mb-2">Denial Reason</p>
              <p className="text-white">{denial.denial_reason_text}</p>
            </div>

           <div className="flex gap-3">
  {denial.status === 'Open' && (
    <button 
      onClick={() => handleResolveDenial(denial.denial_id)}
      className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg font-semibold transition-all"
    >
      Mark Resolved
    </button>
  )}
  {denial.status === 'Resolved' && (
    <span className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg font-semibold">
      ✓ Resolved
    </span>
  )}
  <button 
    onClick={() => {
      const claim = claims.find(c => c.claim_id === denial.claim_id);
      if (claim) {
        alert(`Claim Details:\n\nClaim ID: ${claim.claim_id}\nPayer: ${claim.payer}\nAmount: $${claim.total_amount}\nStatus: ${claim.status}\n\nDenial Code: ${denial.denial_code}\nReason: ${denial.denial_reason_text}`);
      } else {
        alert('Claim not found');
      }
    }}
    className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg font-semibold transition-all"
  >
    View Details
  </button>
</div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
            </div>
      
        </div>
      

      
{/* EDIT ENCOUNTER MODAL */}
{showEditEncounterModal && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-slate-700">
        <div>
          <h3 className="text-2xl font-bold text-white">Edit Service Encounter</h3>
          <p className="text-slate-400 text-sm">Update encounter details</p>
        </div>
        <button
          onClick={() => {
            setShowEditEncounterModal(false);
            setEditingEncounter(null);
          }}
          className="p-2 hover:bg-slate-700 rounded-lg transition-all"
        >
          <X className="text-slate-400" size={24} />
        </button>
      </div>

      <ScrollArea className="h-[calc(90vh-160px)]">
       <form onSubmit={showEditEncounterModal ? handleUpdateEncounter : handleSaveEncounter} className="p-6 space-y-6">
  {/* Section 1: Basic Information */}
  <div>
    <h4 className="text-lg font-bold text-emerald-400 mb-4">Basic Information</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Individual *</label>
        <select
          name="individual_id"
          value={encounterForm.individual_id}
          onChange={handleEncounterChange}
          required
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">Select Individual</option>
          {individuals.map(ind => (
            <option key={ind.id} value={ind.id}>
              {ind.firstname} {ind.lastname} ({ind.individualid})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Service Date *</label>
        <input
          type="date"
          name="service_date"
          value={encounterForm.service_date}
          onChange={handleEncounterChange}
          required
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Start Time *</label>
        <input
          type="time"
          name="start_time"
          value={encounterForm.start_time}
          onChange={handleEncounterChange}
          required
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">End Time *</label>
        <input
          type="time"
          name="end_time"
          value={encounterForm.end_time}
          onChange={handleEncounterChange}
          required
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Calculated Units
          <span className="text-xs text-slate-500 ml-2">(Auto-calculated from time)</span>
        </label>
        <input
          type="number"
          name="units_calculated"
          value={encounterForm.units_calculated}
          onChange={handleEncounterChange}
          step="0.25"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
          placeholder="Will auto-calculate"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Validation Status
          <span className="text-xs text-slate-500 ml-2">(Auto-determined)</span>
        </label>
        <select
          name="billing_validation_status"
          value={encounterForm.billing_validation_status}
          onChange={handleEncounterChange}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="Ready">Ready</option>
          <option value="Hold">Hold</option>
          <option value="Not_Billable">Not Billable</option>
        </select>
      </div>
    </div>
  </div>

  {/* Section 2: Service Details */}
  <div>
    <h4 className="text-lg font-bold text-emerald-400 mb-4">Service Details</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Service Code *</label>
        {serviceCodes.length > 0 ? (
          <select
            name="service_code"
            value={encounterForm.service_code}
            onChange={handleEncounterChange}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-mono"
          >
            <option value="">Select Service Code</option>
            {serviceCodes.map(code => (
              <option key={code.id} value={code.service_code}>
                {code.service_code} - {code.description}
              </option>
            ))}
            {encounterForm.service_code && !serviceCodes.find(sc => sc.service_code === encounterForm.service_code) && (
              <option value={encounterForm.service_code}>
                {encounterForm.service_code} (Current - Not in config)
              </option>
            )}
          </select>
        ) : (
          <div>
            <input
              type="text"
              name="service_code"
              value={encounterForm.service_code}
              onChange={handleEncounterChange}
              placeholder="e.g., T200B, H0038"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
            <p className="text-xs text-yellow-400 mt-1">
              No service codes configured. Add codes in Configuration tab.
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Service Type</label>
        <input
          type="text"
          name="service_type"
          value={encounterForm.service_type}
          onChange={handleEncounterChange}
          placeholder="e.g., Residential Support"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Location Type *</label>
        <select
          name="location_type"
          value={encounterForm.location_type}
          onChange={handleEncounterChange}
          required
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="Home">Home</option>
          <option value="Community">Community</option>
          <option value="Telehealth">Telehealth</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Staff Member *</label>
        <select
          value={encounterForm.staff_id}
          onChange={(e) => {
            const selectedStaff = staffMembers.find(s => s.id === e.target.value);
            setEncounterForm(prev => ({
              ...prev,
              staff_id: e.target.value,
              staff_name: selectedStaff?.staff_name || ''
            }));
          }}
          required
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">Select Staff Member</option>
          {staffMembers.map(staff => (
            <option key={staff.id} value={staff.id}>
              {staff.staff_name} ({staff.employee_number})
            </option>
          ))}
          {encounterForm.staff_id && !staffMembers.find(s => s.id === encounterForm.staff_id) && (
            <option value={encounterForm.staff_id}>
              {encounterForm.staff_name} (Current)
            </option>
          )}
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-slate-300 mb-2">Note ID (Optional)</label>
        <input
          type="text"
          name="note_id"
          value={encounterForm.note_id}
          onChange={handleEncounterChange}
          placeholder="Link to daily note ID"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-mono"
        />
      </div>
    </div>
  </div>

  {/* Section 3: HCBS Compliance */}
  <div>
    <h4 className="text-lg font-bold text-emerald-400 mb-4">HCBS Compliance</h4>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Linked ISP Goal</label>
        <select
          name="linked_isp_goal_id"
          value={encounterForm.linked_isp_goal_id || ''}
          onChange={handleEncounterChange}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">Select ISP Goal (if required)</option>
          {encounterForm.individual_id && 
            individuals
              .find(i => i.id === encounterForm.individual_id)
              ?.goals?.map(goal => (
                <option key={goal.id} value={goal.id}>
                  {goal.description || goal.goal_description || 'Goal ' + goal.id}
                </option>
              ))
          }
          {encounterForm.linked_isp_goal_id && (
            <option value={encounterForm.linked_isp_goal_id}>
              {encounterForm.linked_isp_goal_id} (Currently Selected)
            </option>
          )}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="choice_documented"
          checked={encounterForm.choice_documented}
          onChange={handleEncounterChange}
          className="w-5 h-5 bg-slate-800 border-slate-700 rounded focus:ring-emerald-500"
        />
        <label className="text-white font-semibold">
          Individual choice documented (HCBS requirement)
        </label>
      </div>
    </div>
  </div>

  {/* Section 4: Billing Hold Reasons (Manual Override) */}
  <div>
    <h4 className="text-lg font-bold text-yellow-400 mb-4">Billing Hold Reasons (Optional Override)</h4>
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Hold Reasons (Comma-separated)
        <span className="text-xs text-slate-500 ml-2">(Auto-generated during validation)</span>
      </label>
      <textarea
        value={Array.isArray(encounterForm.billing_hold_reasons) ? encounterForm.billing_hold_reasons.join(', ') : ''}
        onChange={(e) => {
          const reasons = e.target.value.split(',').map(r => r.trim()).filter(r => r);
          setEncounterForm(prev => ({
            ...prev,
            billing_hold_reasons: reasons
          }));
        }}
        rows="3"
        placeholder="e.g., Missing service code, Not linked to ISP goal"
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 resize-none"
      />
      <p className="text-xs text-slate-400 mt-1">
        Leave blank to auto-generate based on validation rules
      </p>
    </div>
  </div>

  <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-700">
    <button
      type="button"
      onClick={() => {
        if (showEditEncounterModal) {
          setShowEditEncounterModal(false);
          setEditingEncounter(null);
        } else {
          setShowEncounterModal(false);
        }
      }}
      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={saving}
      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all disabled:opacity-50"
    >
      {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
      {saving ? (showEditEncounterModal ? 'Updating...' : 'Saving...') : (showEditEncounterModal ? 'Update Encounter' : 'Save & Validate')}
    </button>
  </div>
</form>
      </ScrollArea>
    </div>
  </div>
)}


      {/* NEW ENCOUNTER MODAL */}
      {showEncounterModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div>
                <h3 className="text-2xl font-bold text-white">New Service Encounter</h3>
                <p className="text-slate-400 text-sm">Document a billable service event</p>
              </div>
              <button
                onClick={() => setShowEncounterModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="text-slate-400" size={24} />
              </button>
            </div>

            <ScrollArea className="h-[calc(90vh-160px)]">
              <form onSubmit={showEditEncounterModal ? handleUpdateEncounter : handleSaveEncounter} className="p-6 space-y-6">
  {/* Section 1: Basic Information */}
  <div>
    <h4 className="text-lg font-bold text-emerald-400 mb-4">Basic Information</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Individual *</label>
        <select
          name="individual_id"
          value={encounterForm.individual_id}
          onChange={handleEncounterChange}
          required
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">Select Individual</option>
          {individuals.map(ind => (
            <option key={ind.id} value={ind.id}>
              {ind.firstname} {ind.lastname} ({ind.individualid})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Service Date *</label>
        <input
          type="date"
          name="service_date"
          value={encounterForm.service_date}
          onChange={handleEncounterChange}
          required
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Start Time *</label>
        <input
          type="time"
          name="start_time"
          value={encounterForm.start_time}
          onChange={handleEncounterChange}
          required
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">End Time *</label>
        <input
          type="time"
          name="end_time"
          value={encounterForm.end_time}
          onChange={handleEncounterChange}
          required
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Calculated Units
          <span className="text-xs text-slate-500 ml-2">(Auto-calculated from time)</span>
        </label>
        <input
          type="number"
          name="units_calculated"
          value={encounterForm.units_calculated}
          onChange={handleEncounterChange}
          step="0.25"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
          placeholder="Will auto-calculate"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Validation Status
          <span className="text-xs text-slate-500 ml-2">(Auto-determined)</span>
        </label>
        <select
          name="billing_validation_status"
          value={encounterForm.billing_validation_status}
          onChange={handleEncounterChange}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="Ready">Ready</option>
          <option value="Hold">Hold</option>
          <option value="Not_Billable">Not Billable</option>
        </select>
      </div>
    </div>
  </div>

  {/* Section 2: Service Details */}
  <div>
    <h4 className="text-lg font-bold text-emerald-400 mb-4">Service Details</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Service Code *</label>
        {serviceCodes.length > 0 ? (
          <select
            name="service_code"
            value={encounterForm.service_code}
            onChange={handleEncounterChange}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-mono"
          >
            <option value="">Select Service Code</option>
            {serviceCodes.map(code => (
              <option key={code.id} value={code.service_code}>
                {code.service_code} - {code.description}
              </option>
            ))}
            {encounterForm.service_code && !serviceCodes.find(sc => sc.service_code === encounterForm.service_code) && (
              <option value={encounterForm.service_code}>
                {encounterForm.service_code} (Current - Not in config)
              </option>
            )}
          </select>
        ) : (
          <div>
            <input
              type="text"
              name="service_code"
              value={encounterForm.service_code}
              onChange={handleEncounterChange}
              placeholder="e.g., T200B, H0038"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
            <p className="text-xs text-yellow-400 mt-1">
              No service codes configured. Add codes in Configuration tab.
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Service Type</label>
        <input
          type="text"
          name="service_type"
          value={encounterForm.service_type}
          onChange={handleEncounterChange}
          placeholder="e.g., Residential Support"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Location Type *</label>
        <select
          name="location_type"
          value={encounterForm.location_type}
          onChange={handleEncounterChange}
          required
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="Home">Home</option>
          <option value="Community">Community</option>
          <option value="Telehealth">Telehealth</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Staff Member *</label>
        <select
          value={encounterForm.staff_id}
          onChange={(e) => {
            const selectedStaff = staffMembers.find(s => s.id === e.target.value);
            setEncounterForm(prev => ({
              ...prev,
              staff_id: e.target.value,
              staff_name: selectedStaff?.staff_name || ''
            }));
          }}
          required
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">Select Staff Member</option>
          {staffMembers.map(staff => (
            <option key={staff.id} value={staff.id}>
              {staff.staff_name} ({staff.employee_number})
            </option>
          ))}
          {encounterForm.staff_id && !staffMembers.find(s => s.id === encounterForm.staff_id) && (
            <option value={encounterForm.staff_id}>
              {encounterForm.staff_name} (Current)
            </option>
          )}
        </select>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-slate-300 mb-2">Note ID (Optional)</label>
        <input
          type="text"
          name="note_id"
          value={encounterForm.note_id}
          onChange={handleEncounterChange}
          placeholder="Link to daily note ID"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-mono"
        />
      </div>
    </div>
  </div>

  {/* Section 3: HCBS Compliance */}
  <div>
    <h4 className="text-lg font-bold text-emerald-400 mb-4">HCBS Compliance</h4>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Linked ISP Goal</label>
        <select
          name="linked_isp_goal_id"
          value={encounterForm.linked_isp_goal_id || ''}
          onChange={handleEncounterChange}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">Select ISP Goal (if required)</option>
          {encounterForm.individual_id && 
            individuals
              .find(i => i.id === encounterForm.individual_id)
              ?.goals?.map(goal => (
                <option key={goal.id} value={goal.id}>
                  {goal.description || goal.goal_description || 'Goal ' + goal.id}
                </option>
              ))
          }
          {encounterForm.linked_isp_goal_id && (
            <option value={encounterForm.linked_isp_goal_id}>
              {encounterForm.linked_isp_goal_id} (Currently Selected)
            </option>
          )}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="choice_documented"
          checked={encounterForm.choice_documented}
          onChange={handleEncounterChange}
          className="w-5 h-5 bg-slate-800 border-slate-700 rounded focus:ring-emerald-500"
        />
        <label className="text-white font-semibold">
          Individual choice documented (HCBS requirement)
        </label>
      </div>
    </div>
  </div>

  {/* Section 4: Billing Hold Reasons (Manual Override) */}
  <div>
    <h4 className="text-lg font-bold text-yellow-400 mb-4">Billing Hold Reasons (Optional Override)</h4>
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Hold Reasons (Comma-separated)
        <span className="text-xs text-slate-500 ml-2">(Auto-generated during validation)</span>
      </label>
      <textarea
        value={Array.isArray(encounterForm.billing_hold_reasons) ? encounterForm.billing_hold_reasons.join(', ') : ''}
        onChange={(e) => {
          const reasons = e.target.value.split(',').map(r => r.trim()).filter(r => r);
          setEncounterForm(prev => ({
            ...prev,
            billing_hold_reasons: reasons
          }));
        }}
        rows="3"
        placeholder="e.g., Missing service code, Not linked to ISP goal"
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 resize-none"
      />
      <p className="text-xs text-slate-400 mt-1">
        Leave blank to auto-generate based on validation rules
      </p>
    </div>
  </div>

  <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-700">
    <button
      type="button"
      onClick={() => {
        if (showEditEncounterModal) {
          setShowEditEncounterModal(false);
          setEditingEncounter(null);
        } else {
          setShowEncounterModal(false);
        }
      }}
      className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={saving}
      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all disabled:opacity-50"
    >
      {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
      {saving ? (showEditEncounterModal ? 'Updating...' : 'Saving...') : (showEditEncounterModal ? 'Update Encounter' : 'Save & Validate')}
    </button>
  </div>
</form>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* BATCH BUILDER MODAL */}
      {showBatchBuilder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div>
                <h3 className="text-2xl font-bold text-white">Claim Batch Builder</h3>
                <p className="text-slate-400 text-sm">Group ready encounters into a claim batch</p>
              </div>
              <button
                onClick={() => setShowBatchBuilder(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="text-slate-400" size={24} />
              </button>
            </div>

            <ScrollArea className="h-[calc(90vh-160px)]">
              <div className="p-6 space-y-6">
                {/* Batch Configuration */}
                <div>
                  <h4 className="text-lg font-bold text-white mb-4">Batch Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Payer</label>
                      <select
                        value={batchForm.payer}
                        onChange={(e) => setBatchForm(prev => ({ ...prev, payer: e.target.value }))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="Medicaid">Medicaid</option>
                        <option value="MCO">Managed Care Organization</option>
                        <option value="Private">Private Insurance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">State</label>
                      <select
                        value={batchForm.state}
                        onChange={(e) => setBatchForm(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="AL">Alabama</option>
                        <option value="NC">North Carolina</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Waiver Type</label>
                      <select
                        value={batchForm.waiver_type}
                        onChange={(e) => setBatchForm(prev => ({ ...prev, waiver_type: e.target.value }))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="DD">DD (Developmental Disabilities)</option>
                        <option value="ID/DD">ID/DD (Intellectual/Developmental Disabilities)</option>
                        <option value="MH">MH (Mental Health)</option>
                        <option value="SUD">SUD (Substance Use Disorder)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Export Format</label>
                      <select
                        value={batchForm.export_format}
                        onChange={(e) => setBatchForm(prev => ({ ...prev, export_format: e.target.value }))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="837P">837P (Professional)</option>
                        <option value="CSV">CSV (State Portal)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Available Encounters */}
                <div>
                  <h4 className="text-lg font-bold text-white mb-4">
                    Available Ready Encounters ({serviceEncounters.filter(e => e.billing_validation_status === 'Ready').length})
                  </h4>
                  
                  {serviceEncounters.filter(e => e.billing_validation_status === 'Ready').length === 0 ? (
                    <div className="text-center py-12 bg-slate-800/50 border border-slate-700 rounded-xl">
                      <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">No ready encounters available for batching</p>
                      <p className="text-sm text-slate-500 mt-2">Create service encounters and ensure they pass validation</p>
                    </div>
                  ) : (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                      <div className="max-h-96 overflow-y-auto">
                        <table className="w-full">
                          <thead className="bg-slate-900/50 sticky top-0">
                            <tr>
                              <th className="px-4 py-3 text-left">
                                <input
                                  type="checkbox"
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setBatchForm(prev => ({
                                        ...prev,
                                        selected_encounters: serviceEncounters
                                          .filter(enc => enc.billing_validation_status === 'Ready')
                                          .map(enc => enc.id)
                                      }));
                                    } else {
                                      setBatchForm(prev => ({ ...prev, selected_encounters: [] }));
                                    }
                                  }}
                                  className="w-4 h-4 bg-slate-800 border-slate-700 rounded"
                                />
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Date</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Individual</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Code</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Units</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700">
                            {serviceEncounters
                              .filter(e => e.billing_validation_status === 'Ready')
                              .map(encounter => {
                                const individual = individuals.find(i => i.id === encounter.individual_id);
                                const amount = (parseFloat(encounter.units_calculated) || 0) * 12;
                                const isSelected = batchForm.selected_encounters.includes(encounter.id);

                                return (
                                  <tr key={encounter.id} className={isSelected ? 'bg-blue-900/20' : 'hover:bg-slate-700/30'}>
                                    <td className="px-4 py-3">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setBatchForm(prev => ({
                                              ...prev,
                                              selected_encounters: [...prev.selected_encounters, encounter.id]
                                            }));
                                          } else {
                                            setBatchForm(prev => ({
                                              ...prev,
                                              selected_encounters: prev.selected_encounters.filter(id => id !== encounter.id)
                                            }));
                                          }
                                        }}
                                        className="w-4 h-4 bg-slate-800 border-slate-700 rounded"
                                      />
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white">
                                      {new Date(encounter.service_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white">
                                      {individual ? `${individual.firstname} ${individual.lastname}` : 'Unknown'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white font-mono">
                                      {encounter.service_code}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white">
                                      {encounter.units_calculated}
                                    </td>
                                    <td className="px-4 py-3 text-sm font-bold text-emerald-400">
                                      ${amount.toFixed(2)}
                                    </td>
                                  </tr>
                                  );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Batch Summary */}
            {batchForm.selected_encounters.length > 0 && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white mb-4">Batch Summary</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Services Selected</p>
                    <p className="text-2xl font-bold text-white">{batchForm.selected_encounters.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Total Units</p>
                    <p className="text-2xl font-bold text-white">
                      {serviceEncounters
                        .filter(e => batchForm.selected_encounters.includes(e.id))
                        .reduce((sum, e) => sum + (parseFloat(e.units_calculated) || 0), 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      ${serviceEncounters
                        .filter(e => batchForm.selected_encounters.includes(e.id))
                        .reduce((sum, e) => sum + ((parseFloat(e.units_calculated) || 0) * 12), 0)
                        .toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
          <button
            onClick={() => setShowBatchBuilder(false)}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerateBatch}
            disabled={batchForm.selected_encounters.length === 0 || saving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <FileCheck size={18} />}
            {saving ? 'Creating...' : `Generate Batch (${batchForm.selected_encounters.length})`}
          </button>
        </div>
      </div>
    </div>
  )}

  {/* EDIT SERVICE CODE MODAL */}
{showEditServiceCodeModal && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-slate-700">
        <div>
          <h3 className="text-2xl font-bold text-white">Edit Service Code</h3>
          <p className="text-slate-400 text-sm">Update service code configuration</p>
        </div>
        <button
          onClick={() => {
            setShowEditServiceCodeModal(false);
            setEditingServiceCode(null);
          }}
          className="p-2 hover:bg-slate-700 rounded-lg transition-all"
        >
          <X className="text-slate-400" size={24} />
        </button>
      </div>

      <ScrollArea className="h-[calc(90vh-160px)]">
        <form onSubmit={handleUpdateServiceCode} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Service Code *</label>
              <input
                type="text"
                value={serviceCodeForm.service_code}
                disabled
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-slate-400 cursor-not-allowed font-mono"
              />
              <p className="text-xs text-slate-500 mt-1">Service code cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Unit Type *</label>
              <select
                value={serviceCodeForm.unit_type}
                onChange={(e) => setServiceCodeForm(prev => ({ ...prev, unit_type: e.target.value }))}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="MIN_15">15-Minute Units</option>
                <option value="HOUR">Hourly</option>
                <option value="PER_DIEM">Per Diem</option>
                <option value="PER_VISIT">Per Visit</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
              <input
                type="text"
                value={serviceCodeForm.description}
                onChange={(e) => setServiceCodeForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Peer Support Services"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">State</label>
              <select
                value={serviceCodeForm.state}
                onChange={(e) => setServiceCodeForm(prev => ({ ...prev, state: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="AL">Alabama</option>
                <option value="NC">North Carolina</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Waiver Type</label>
              <select
                value={serviceCodeForm.waiver_type}
                onChange={(e) => setServiceCodeForm(prev => ({ ...prev, waiver_type: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="DD">DD</option>
                <option value="ID/DD">ID/DD</option>
                <option value="MH">MH</option>
                <option value="SUD">SUD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Max Units Per Day</label>
              <input
                type="number"
                value={serviceCodeForm.max_units_per_day || ''}
                onChange={(e) => setServiceCodeForm(prev => ({ ...prev, max_units_per_day: e.target.value ? parseInt(e.target.value) : null }))}
                placeholder="Optional"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Max Units Per Week</label>
              <input
                type="number"
                value={serviceCodeForm.max_units_per_week || ''}
                onChange={(e) => setServiceCodeForm(prev => ({ ...prev, max_units_per_week: e.target.value ? parseInt(e.target.value) : null }))}
                placeholder="Optional"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={serviceCodeForm.requires_isp_link}
                onChange={(e) => setServiceCodeForm(prev => ({ ...prev, requires_isp_link: e.target.checked }))}
                className="w-5 h-5 bg-slate-800 border-slate-700 rounded"
              />
              <label className="text-white font-semibold">Requires ISP Goal Link</label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={serviceCodeForm.requires_choice_doc}
                onChange={(e) => setServiceCodeForm(prev => ({ ...prev, requires_choice_doc: e.target.checked }))}
                className="w-5 h-5 bg-slate-800 border-slate-700 rounded"
              />
              <label className="text-white font-semibold">Requires Choice Documentation</label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={serviceCodeForm.requires_auth}
                onChange={(e) => setServiceCodeForm(prev => ({ ...prev, requires_auth: e.target.checked }))}
                className="w-5 h-5 bg-slate-800 border-slate-700 rounded"
              />
              <label className="text-white font-semibold">Requires Authorization</label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={serviceCodeForm.is_active}
                onChange={(e) => setServiceCodeForm(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-5 h-5 bg-slate-800 border-slate-700 rounded"
              />
              <label className="text-white font-semibold">Active</label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={() => {
                setShowEditServiceCodeModal(false);
                setEditingServiceCode(null);
              }}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Updating...' : 'Update Service Code'}
            </button>
          </div>
        </form>
      </ScrollArea>
    </div>
  </div>
)}

{/* EDIT AUTHORIZATION MODAL */}
{showEditAuthorizationModal && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-slate-700">
        <div>
          <h3 className="text-2xl font-bold text-white">Edit Authorization</h3>
          <p className="text-slate-400 text-sm">Update service authorization details</p>
        </div>
        <button
          onClick={() => {
            setShowEditAuthorizationModal(false);
            setEditingAuthorization(null);
          }}
          className="p-2 hover:bg-slate-700 rounded-lg transition-all"
        >
          <X className="text-slate-400" size={24} />
        </button>
      </div>

      <ScrollArea className="h-[calc(90vh-160px)]">
        <form onSubmit={handleUpdateAuthorization} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Individual *</label>
              <select
                value={authorizationForm.individual_id}
                onChange={(e) => setAuthorizationForm(prev => ({ ...prev, individual_id: e.target.value }))}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Select Individual</option>
                {individuals.map(ind => (
                  <option key={ind.id} value={ind.id}>
                    {ind.firstname} {ind.lastname} ({ind.individualid})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Authorization Number *</label>
              <input
                type="text"
                value={authorizationForm.auth_number}
                onChange={(e) => setAuthorizationForm(prev => ({ ...prev, auth_number: e.target.value }))}
                placeholder="e.g., AUTH-2024-001"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Start Date *</label>
              <input
                type="date"
                value={authorizationForm.start_date}
                onChange={(e) => setAuthorizationForm(prev => ({ ...prev, start_date: e.target.value }))}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">End Date *</label>
              <input
                type="date"
                value={authorizationForm.end_date}
                onChange={(e) => setAuthorizationForm(prev => ({ ...prev, end_date: e.target.value }))}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Total Units Authorized *</label>
              <input
                type="number"
                value={authorizationForm.units_authorized_total}
                onChange={(e) => setAuthorizationForm(prev => ({ ...prev, units_authorized_total: parseInt(e.target.value) || 0 }))}
                required
                min="0"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select
                value={authorizationForm.status}
                onChange={(e) => setAuthorizationForm(prev => ({ ...prev, status: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Exhausted">Exhausted</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Payer</label>
              <select
                value={authorizationForm.payer}
                onChange={(e) => setAuthorizationForm(prev => ({ ...prev, payer: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Medicaid">Medicaid</option>
                <option value="MCO">MCO</option>
                <option value="Private">Private Insurance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">State</label>
              <select
                value={authorizationForm.state}
                onChange={(e) => setAuthorizationForm(prev => ({ ...prev, state: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="AL">Alabama</option>
                <option value="NC">North Carolina</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Waiver Type</label>
              <select
                value={authorizationForm.waiver_type}
                onChange={(e) => setAuthorizationForm(prev => ({ ...prev, waiver_type: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="DD">DD</option>
                <option value="ID/DD">ID/DD</option>
                <option value="MH">MH</option>
                <option value="SUD">SUD</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={() => {
                setShowEditAuthorizationModal(false);
                setEditingAuthorization(null);
              }}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Updating...' : 'Update Authorization'}
            </button>
          </div>
        </form>
      </ScrollArea>
    </div>
  </div>
)}


  {/* SERVICE CODE MODAL */}
  {showServiceCodeModal && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h3 className="text-2xl font-bold text-white">Add Service Code</h3>
            <p className="text-slate-400 text-sm">Configure a new billable service code</p>
          </div>
          <button
            onClick={() => setShowServiceCodeModal(false)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-all"
          >
            <X className="text-slate-400" size={24} />
          </button>
        </div>

        <ScrollArea className="h-[calc(90vh-160px)]">
          <form onSubmit={showEditServiceCodeModal ? handleUpdateServiceCode : handleSaveServiceCode} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <h3 className="text-2xl font-bold text-white">
  {showEditServiceCodeModal ? 'Edit Service Code' : 'Add Service Code'}
</h3>
<p className="text-slate-400 text-sm">
  {showEditServiceCodeModal ? 'Update service code configuration' : 'Configure a new billable service code'}
</p>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Service Code *</label>
                <input
                  type="text"
                  value={serviceCodeForm.service_code}
                  onChange={(e) => setServiceCodeForm(prev => ({ ...prev, service_code: e.target.value }))}
                  placeholder="e.g., H0038"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Unit Type *</label>
                <select
                  value={serviceCodeForm.unit_type}
                  onChange={(e) => setServiceCodeForm(prev => ({ ...prev, unit_type: e.target.value }))}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="MIN_15">15-Minute Units</option>
                  <option value="HOUR">Hourly</option>
                  <option value="PER_DIEM">Per Diem</option>
                  <option value="PER_VISIT">Per Visit</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
                <input
                  type="text"
                  value={serviceCodeForm.description}
                  onChange={(e) => setServiceCodeForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., Peer Support Services"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">State</label>
                <select
                  value={serviceCodeForm.state}
                  onChange={(e) => setServiceCodeForm(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="AL">Alabama</option>
                  <option value="NC">North Carolina</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Waiver Type</label>
                <select
                  value={serviceCodeForm.waiver_type}
                  onChange={(e) => setServiceCodeForm(prev => ({ ...prev, waiver_type: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="DD">DD</option>
                  <option value="ID/DD">ID/DD</option>
                  <option value="MH">MH</option>
                  <option value="SUD">SUD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Max Units Per Day</label>
                <input
                  type="number"
                  value={serviceCodeForm.max_units_per_day || ''}
                  onChange={(e) => setServiceCodeForm(prev => ({ ...prev, max_units_per_day: e.target.value ? parseInt(e.target.value) : null }))}
                  placeholder="Optional"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Max Units Per Week</label>
                <input
                  type="number"
                  value={serviceCodeForm.max_units_per_week || ''}
                  onChange={(e) => setServiceCodeForm(prev => ({ ...prev, max_units_per_week: e.target.value ? parseInt(e.target.value) : null }))}
                  placeholder="Optional"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={serviceCodeForm.requires_isp_link}
                  onChange={(e) => setServiceCodeForm(prev => ({ ...prev, requires_isp_link: e.target.checked }))}
                  className="w-5 h-5 bg-slate-800 border-slate-700 rounded"
                />
                <label className="text-white font-semibold">Requires ISP Goal Link</label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={serviceCodeForm.requires_choice_doc}
                  onChange={(e) => setServiceCodeForm(prev => ({ ...prev, requires_choice_doc: e.target.checked }))}
                  className="w-5 h-5 bg-slate-800 border-slate-700 rounded"
                />
                <label className="text-white font-semibold">Requires Choice Documentation</label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={serviceCodeForm.requires_auth}
                  onChange={(e) => setServiceCodeForm(prev => ({ ...prev, requires_auth: e.target.checked }))}
                  className="w-5 h-5 bg-slate-800 border-slate-700 rounded"
                />
                <label className="text-white font-semibold">Requires Authorization</label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setShowServiceCodeModal(false)}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? 'Saving...' : 'Save Service Code'}
              </button>
            </div>
          </form>
        </ScrollArea>
      </div>
    </div>
  )}

  {/* AUTHORIZATION MODAL */}
  {showAuthorizationModal && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h3 className="text-2xl font-bold text-white">Add Authorization</h3>
            <p className="text-slate-400 text-sm">Create a new service authorization</p>
          </div>
          <button
            onClick={() => setShowAuthorizationModal(false)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-all"
          >
            <X className="text-slate-400" size={24} />
          </button>
        </div>

        <ScrollArea className="h-[calc(90vh-160px)]">
          <form onSubmit={showEditAuthorizationModal ? handleUpdateAuthorization : handleSaveAuthorization} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Individual *</label>
                <select
                  value={authorizationForm.individual_id}
                  onChange={(e) => setAuthorizationForm(prev => ({ ...prev, individual_id: e.target.value }))}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select Individual</option>
                  {individuals.map(ind => (
                    <option key={ind.id} value={ind.id}>
                      {ind.firstname} {ind.lastname} ({ind.individualid})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Authorization Number *</label>
                <input
                  type="text"
                  value={authorizationForm.auth_number}
                  onChange={(e) => setAuthorizationForm(prev => ({ ...prev, auth_number: e.target.value }))}
                  placeholder="e.g., AUTH-2024-001"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Start Date *</label>
                <input
                  type="date"
                  value={authorizationForm.start_date}
                  onChange={(e) => setAuthorizationForm(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">End Date *</label>
                <input
                  type="date"
                  value={authorizationForm.end_date}
                  onChange={(e) => setAuthorizationForm(prev => ({ ...prev, end_date: e.target.value }))}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Total Units Authorized *</label>
                <input
                  type="number"
                  value={authorizationForm.units_authorized_total}
                  onChange={(e) => setAuthorizationForm(prev => ({ ...prev, units_authorized_total: parseInt(e.target.value) || 0 }))}
                  required
                  min="0"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Payer</label>
                <select
                  value={authorizationForm.payer}
                  onChange={(e) => setAuthorizationForm(prev => ({ ...prev, payer: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Medicaid">Medicaid</option>
                  <option value="MCO">MCO</option>
                  <option value="Private">Private Insurance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">State</label>
                <select
                  value={authorizationForm.state}
                  onChange={(e) => setAuthorizationForm(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="AL">Alabama</option>
                  <option value="NC">North Carolina</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Waiver Type</label>
                <select
                  value={authorizationForm.waiver_type}
                  onChange={(e) => setAuthorizationForm(prev => ({ ...prev, waiver_type: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="DD">DD</option>
                  <option value="ID/DD">ID/DD</option>
                  <option value="MH">MH</option>
                  <option value="SUD">SUD</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setShowAuthorizationModal(false)}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? 'Saving...' : 'Save Authorization'}
              </button>
            </div>
          </form>
        </ScrollArea>
      </div>
    </div>
  )}

  {/* VALIDATION DETAIL MODAL */}
  {showValidationDetail && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h3 className="text-2xl font-bold text-white">Validation Details</h3>
            <p className="text-slate-400 text-sm">{showValidationDetail.encounter_id}</p>
          </div>
          <button
            onClick={() => setShowValidationDetail(null)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-all"
          >
            <X className="text-slate-400" size={24} />
          </button>
        </div>

        <ScrollArea className="h-[calc(90vh-160px)]">
          <div className="p-6 space-y-6">
            {/* Status Banner */}
            <div className={`rounded-xl p-6 border-2 ${
              showValidationDetail.billing_validation_status === 'Ready' ? 'bg-emerald-900/20 border-emerald-500' :
              showValidationDetail.billing_validation_status === 'Hold' ? 'bg-yellow-900/20 border-yellow-500' :
              'bg-red-900/20 border-red-500'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                {showValidationDetail.billing_validation_status === 'Ready' && <CheckCircle className="text-emerald-400" size={32} />}
                {showValidationDetail.billing_validation_status === 'Hold' && <Clock className="text-yellow-400" size={32} />}
                {showValidationDetail.billing_validation_status === 'Not_Billable' && <XCircle className="text-red-400" size={32} />}
                <div>
                  <h4 className={`text-2xl font-bold ${
                    showValidationDetail.billing_validation_status === 'Ready' ? 'text-emerald-400' :
                    showValidationDetail.billing_validation_status === 'Hold' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {showValidationDetail.billing_validation_status.replace('_', ' ')}
                  </h4>
                  <p className="text-white text-sm">
                    {showValidationDetail.billing_validation_status === 'Ready' && 'This encounter is ready for billing'}
                    {showValidationDetail.billing_validation_status === 'Hold' && 'This encounter has validation holds'}
                    {showValidationDetail.billing_validation_status === 'Not_Billable' && 'This encounter cannot be billed'}
                  </p>
                </div>
              </div>
              
              {showValidationDetail.billing_hold_reasons?.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-semibold text-white mb-2">Issues:</p>
                  {showValidationDetail.billing_hold_reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <AlertCircle size={16} className="text-yellow-400" />
                      <span className="text-white">{reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Encounter Details */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-4">Encounter Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Individual</p>
                  <p className="text-white font-semibold">
                    {individuals.find(i => i.id === showValidationDetail.individual_id)?.firstname || 'Unknown'} {individuals.find(i => i.id === showValidationDetail.individual_id)?.lastname || ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Service Date</p>
                  <p className="text-white font-semibold">
                    {new Date(showValidationDetail.service_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Time</p>
                  <p className="text-white font-semibold">
                    {showValidationDetail.start_time} - {showValidationDetail.end_time}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Service Code</p>
                  <p className="text-white font-semibold font-mono">{showValidationDetail.service_code}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Units Calculated</p>
                  <p className="text-white font-semibold">{showValidationDetail.units_calculated}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Location</p>
                  <p className="text-white font-semibold">{showValidationDetail.location_type}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Staff</p>
                  <p className="text-white font-semibold">{showValidationDetail.staff_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Amount</p>
                  <p className="text-emerald-400 font-bold text-lg">
                    ${((parseFloat(showValidationDetail.units_calculated) || 0) * 12).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* HCBS Compliance */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-4">HCBS Compliance</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {showValidationDetail.linked_isp_goal_id ? (
                    <CheckCircle size={20} className="text-emerald-400" />
                  ) : (
                    <XCircle size={20} className="text-red-400" />
                  )}
                  <span className="text-slate-300">ISP Goal Linked</span>
                </div>
                <div className="flex items-center gap-3">
                  {showValidationDetail.choice_documented ? (
                    <CheckCircle size={20} className="text-emerald-400" />
                  ) : (
                    <XCircle size={20} className="text-red-400" />
                  )}
                  <span className="text-slate-300">Choice Documented</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-slate-700 flex justify-end">
          <button
            onClick={() => setShowValidationDetail(null)}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
          >
            Close
          </button>
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
  )}

  export default BillingModulePage

  