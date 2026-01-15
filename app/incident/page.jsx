
'use client'

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Plus, Search, Filter, Edit2, Trash2, Save, X, CheckCircle, XCircle, 
  Clock, AlertCircle, Calendar, User, Activity, TrendingUp, Download, 
  ChevronRight, ChevronDown, Loader2, FileText, Upload, Bell, ArrowLeft,CreditCard,
  Shield, Eye, MessageSquare, Paperclip, History, BarChart3,NetworkIcon,
  TrendingDown, AlertOctagon, Info, CheckSquare, RotateCcw,
  Users, FileText as FileTextIcon, Pill, Home, Settings, Menu,
  MapPin, Brain, Zap, Sparkles, Award, ChevronLeft
} from 'lucide-react';
import { ScrollArea } from "../../components/ui/scroll-area";
import { useUser, UserButton } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '../../contexts/userProfileContext';
import { PERMISSIONS } from '../../utils/permissions';

// Initialize Supabase client
const supabase = createClient(
  'https://bbikcxalypttfgrlxstf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWtjeGFseXB0dGZncmx4c3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODcwOCwiZXhwIjoyMDY5Mjk0NzA4fQ.4BLQyvPA0eB745Sfdn2Tl4oCDRTzNhLXrJ8Os8wOXfs'
);

const IncidentsPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { userProfile, loading: profileLoading, hasPermission, hasAnyPermission } = useUserProfile();
  
  const [individuals, setIndividuals] = useState([]);
  const [selectedIndividual, setSelectedIndividual] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [allIncidents, setAllIncidents] = useState([]); // Store all incidents for stats
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('incident');
  const [activeFilter, setActiveFilter] = useState(null); // Track active card filter
  const [cardStats, setCardStats] = useState({
    openIncidents: 0,
    highSeverity: 0,
    closureRate: 0,
    totalIncidents: 0
  });

  // Permission checks
  const canViewIncidents = hasAnyPermission([
    PERMISSIONS.INCIDENTS_CREATE,
    PERMISSIONS.INCIDENTS_APPROVE,
    PERMISSIONS.INCIDENTS_REVIEW,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canCreateIncidents = hasAnyPermission([
    PERMISSIONS.INCIDENTS_CREATE,
    PERMISSIONS.INCIDENTS_APPROVE,
    PERMISSIONS.INCIDENTS_REVIEW,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canReviewIncidents = hasAnyPermission([
    PERMISSIONS.INCIDENTS_APPROVE,
    PERMISSIONS.INCIDENTS_REVIEW,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canEditIncidents = hasAnyPermission([
    PERMISSIONS.INCIDENTS_APPROVE,
    PERMISSIONS.INCIDENTS_REVIEW,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canDeleteIncidents = hasAnyPermission([
    PERMISSIONS.INCIDENTS_APPROVE,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canExportIncidents = hasAnyPermission([
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.INCIDENTS_APPROVE,
    PERMISSIONS.FULL_ACCESS
  ]);

  // Incident form state
  const [incidentForm, setIncidentForm] = useState({
    incidenttype: '',
    severity: '',
    dateoccurred: '',
    timeoccurred: '',
    location: '',
    individualsinvolved: [],
    staffinvolved: [],
    description: '',
    immediateaction: '',
    injuries: '',
    medicalattention: false,
    notifiedparties: [],
    witnessnames: [],
    witnessstatements: '',
    followuprequired: false,
    followupactions: '',
    qidpreviewnotes: '',
    adminreviewnotes: '',
    status: 'Open',
    attachments: [],
    ipmsfields: {
      incidentcategory: '',
      subcategory: '',
      locationcode: '',
      contributingfactors: [],
      preventionmeasures: []
    },
    created_by: '',
    created_by_role: '',
    division: '',
    facility: ''
  });

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    incidentid: '',
    reviewtype: '',
    notes: '',
    recommendations: '',
    statuschange: '',
    reviewedby: '',
    reviewdate: new Date().toISOString().split('T')[0],
    reviewed_by: '',
    reviewed_by_role: ''
  });

  // IPMS incident types and categories
  const ipmsIncidentTypes = [
    'Consumer Injury/Death',
    'Medication Error',
    'Consumer Missing',
    'Law Enforcement',
    'Alleged Abuse/Neglect',
    'Environmental Emergency',
    'Staff Injury',
    'Vehicle Incident',
    'Property Damage',
    'Behavioral Emergency',
    'Medical Emergency',
    'Other'
  ];

  const severityLevels = [
    'Critical - Life Threatening',
    'Major - Serious Injury/Illness',
    'Moderate - Minor Injury/Illness',
    'Minor - No Injury/Illness',
    'Near Miss'
  ];

  const incidentStatuses = [
    'Open',
    'Under Review',
    'Pending Investigation',
    'Resolved',
    'Closed',
    'Referred to External Agency'
  ];

  const locationCodes = [
    'Community',
    'Residential Facility',
    'Day Program',
    'Vocational Site',
    'Vehicle/Transportation',
    'Medical Facility',
    'Other'
  ];


   const menuItems = [
      { id: 'dashboard', icon: Home, label: 'Dashboard', badge: null },
      { id: 'individual', icon: Users, label: 'Individuals', badge: null },
      { id: 'medicine', icon: Pill, label: 'Medications', badge: null },
      { id: 'incident', icon: AlertTriangle, label: 'Incidents', badge: '3' },
      { id: 'privacy', icon: Shield, label: 'Data Privacy', badge: 'NEW' },
      { id: 'report', icon: FileText, label: 'Report', badge: 'NEW' },
      { id: 'engine', icon: Pill, label: 'Foresight Engine', badge: 'NEW' },
      { id: 'intelligence', icon: NetworkIcon, label: 'User Foresight', badge: 'NEW' },
      { id: 'billing', icon: CreditCard, label: 'Billing', badge: null },
      { id: 'analytics', icon: TrendingUp, label: 'Analytics', badge: null }
    ];


  useEffect(() => {
    if (isLoaded && user && !profileLoading && userProfile) {
      if (canViewIncidents) {
        fetchIndividuals();
        fetchAllIncidents(); // Fetch all incidents for stats
      } else {
        setLoading(false);
      }
    }
  }, [isLoaded, user, profileLoading, userProfile]);

  // Fetch all incidents for statistics
  const fetchAllIncidents = async () => {
    try {
      let query = supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });

      // Role-based filtering for incidents
      if (userProfile.role_id === 'DSP_DD' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        query = query.or(`created_by.eq.${userProfile.fullname},facility.eq.${userProfile.facility}`);
      } else if (userProfile.division === 'MI' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        query = query.eq('division', 'MI');
      } else if (userProfile.division === 'SUD' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        query = query.eq('division', 'SUD');
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Incidents table not found for stats, will calculate from individuals');
        // We'll calculate from individuals in fetchIndividuals
        return;
      }

      setAllIncidents(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching all incidents:', error);
      setAllIncidents([]);
    }
  };

  // Calculate statistics from incidents data
  const calculateStats = (incidentsData) => {
    const openIncidents = incidentsData.filter(inc => inc.status === 'Open').length;
    const highSeverity = incidentsData.filter(inc => 
      inc.severity?.includes('Critical') || inc.severity?.includes('Major')
    ).length;
    const closedIncidents = incidentsData.filter(inc => inc.status === 'Closed').length;
    const totalIncidents = incidentsData.length;
    const closureRate = totalIncidents > 0 ? Math.round((closedIncidents / totalIncidents) * 100) : 0;

    setCardStats({
      openIncidents,
      highSeverity,
      closureRate,
      totalIncidents
    });
  };

  const fetchIndividuals = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('individuals')
        .select('*')
        .order('created_at', { ascending: false });

      // Role-based filtering
      if (userProfile.role_id === 'HouseManager_DD') {
        // House managers only see individuals in their facility
        query = query.eq('homeassignment', userProfile.facility);
      } else if (userProfile.role_id === 'DSP_DD') {
        // DSPs only see individuals in their assigned home
        query = query.eq('homeassignment', userProfile.facility);
      } else if (userProfile.division === 'MI' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        // MI staff see only their division's individuals
        query = query.eq('division', 'MI');
      } else if (userProfile.division === 'SUD' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        // SUD staff see only their division's individuals
        query = query.eq('division', 'SUD');
      }

      const { data, error } = await query;

      if (error) throw error;
      setIndividuals(data || []);
      
      // If allIncidents is empty, calculate from individuals data
      if (allIncidents.length === 0 && data) {
        const incidentsFromIndividuals = extractIncidentsFromIndividuals(data);
        setAllIncidents(incidentsFromIndividuals);
        calculateStats(incidentsFromIndividuals);
      }
    } catch (error) {
      console.error('Error fetching individuals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extract incidents from individuals data
  const extractIncidentsFromIndividuals = (individualsData) => {
    let allIncidentsFromIndividuals = [];
    
    individualsData.forEach(individual => {
      if (individual.incidents && Array.isArray(individual.incidents)) {
        // Apply role-based filtering to individual incidents
        let filteredIncidents = individual.incidents;
        
        if (userProfile.role_id === 'DSP_DD' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
          filteredIncidents = individual.incidents.filter(incident => 
            incident.created_by === userProfile.fullname || 
            incident.facility === userProfile.facility
          );
        } else if (userProfile.division === 'MI' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
          filteredIncidents = individual.incidents.filter(incident => incident.division === 'MI');
        } else if (userProfile.division === 'SUD' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
          filteredIncidents = individual.incidents.filter(incident => incident.division === 'SUD');
        }
        
        filteredIncidents.forEach(incident => {
          allIncidentsFromIndividuals.push({
            ...incident,
            individual_id: individual.id,
            individual_name: `${individual.firstname} ${individual.lastname}`,
            individual_identifier: individual.individualid
          });
        });
      }
    });

    return allIncidentsFromIndividuals;
  };

  // Fetch incidents from incidents table
  const fetchIncidents = async (individualId) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('incidents')
        .select('*')
        .eq('individual_id', individualId)
        .order('created_at', { ascending: false });

      // Role-based incident filtering
      if (userProfile.role_id === 'DSP_DD' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        // DSPs can only see incidents they reported or incidents in their facility
        query = query.or(`created_by.eq.${userProfile.fullname},facility.eq.${userProfile.facility}`);
      } else if (userProfile.division === 'MI' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        // MI staff see only MI division incidents
        query = query.eq('division', 'MI');
      } else if (userProfile.division === 'SUD' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        // SUD staff see only SUD division incidents
        query = query.eq('division', 'SUD');
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Incidents table not found, falling back to individuals table');
        // Fallback to individuals table if incidents table doesn't exist
        await fetchIncidentsFromIndividualsTable(individualId);
      } else {
        setIncidents(data || []);
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  // Fallback function to fetch incidents from individuals table
  const fetchIncidentsFromIndividualsTable = async (individualId) => {
    try {
      const { data, error } = await supabase
        .from('individuals')
        .select('incidents')
        .eq('id', individualId)
        .single();

      if (error) throw error;
      
      if (data && data.incidents) {
        // Filter incidents based on user permissions
        let filteredIncidents = data.incidents;
        
        if (userProfile.role_id === 'DSP_DD' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
          filteredIncidents = data.incidents.filter(incident => 
            incident.created_by === userProfile.fullname || 
            incident.facility === userProfile.facility
          );
        } else if (userProfile.division === 'MI' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
          filteredIncidents = data.incidents.filter(incident => incident.division === 'MI');
        } else if (userProfile.division === 'SUD' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
          filteredIncidents = data.incidents.filter(incident => incident.division === 'SUD');
        }
        
        setIncidents(filteredIncidents);
      } else {
        setIncidents([]);
      }
    } catch (error) {
      console.error('Error fetching incidents from individuals table:', error);
      setIncidents([]);
    }
  };

  // Handle card click to filter individuals
  const handleCardClick = (cardType) => {
    setActiveFilter(cardType);
  };

  // Save incident to incidents table
  const handleAddIncident = async (e) => {
    e.preventDefault();
    
    if (!canCreateIncidents) {
      alert('You do not have permission to create incidents.');
      return;
    }

    if (!selectedIndividual) {
      alert('Please select an individual first.');
      return;
    }

    try {
      const newIncident = {
        incidenttype: incidentForm.incidenttype,
        severity: incidentForm.severity,
        dateoccurred: incidentForm.dateoccurred,
        timeoccurred: incidentForm.timeoccurred,
        location: incidentForm.location,
        individualsinvolved: incidentForm.individualsinvolved,
        staffinvolved: incidentForm.staffinvolved,
        description: incidentForm.description,
        immediateaction: incidentForm.immediateaction,
        injuries: incidentForm.injuries,
        medicalattention: incidentForm.medicalattention,
        notifiedparties: incidentForm.notifiedparties,
        witnessnames: incidentForm.witnessnames,
        witnessstatements: incidentForm.witnessstatements,
        followuprequired: incidentForm.followuprequired,
        followupactions: incidentForm.followupactions,
        qidpreviewnotes: incidentForm.qidpreviewnotes,
        adminreviewnotes: incidentForm.adminreviewnotes,
        status: 'Open',
        attachments: incidentForm.attachments,
        ipmsfields: incidentForm.ipmsfields,
        individual_id: selectedIndividual.id,
        individual_name: `${selectedIndividual.firstname} ${selectedIndividual.lastname}`,
        individual_identifier: selectedIndividual.individualid,
        reportedby: user.id,
        reportedby_name: userProfile.fullname,
        reporteddate: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        qidpreviewdate: null,
        adminreviewdate: null,
        created_by: userProfile.fullname,
        created_by_role: userProfile.role_name,
        division: userProfile.division,
        facility: userProfile.facility,
        home_assignment: selectedIndividual.homeassignment,
        program: selectedIndividual.program
      };

      // Save to incidents table
      const { data, error } = await supabase
        .from('incidents')
        .insert([newIncident])
        .select()
        .single();

      if (error) {
        // If incidents table doesn't exist, fallback to individuals table
        console.log('Incidents table not found, saving to individuals table');
        await saveIncidentToIndividualsTable(newIncident);
      } else {
        // Successfully saved to incidents table
        setIncidents([data, ...incidents]);
        // Update all incidents for stats
        setAllIncidents(prev => [data, ...prev]);
        // Update stats
        setCardStats(prev => ({
          ...prev,
          openIncidents: prev.openIncidents + 1,
          totalIncidents: prev.totalIncidents + 1,
          highSeverity: newIncident.severity?.includes('Critical') || newIncident.severity?.includes('Major') 
            ? prev.highSeverity + 1 
            : prev.highSeverity
        }));
        
        setShowAddModal(false);
        resetIncidentForm();
        alert('Incident reported successfully!');
      }

      // Auto-link incident if needed
      await autoLinkIncident(newIncident.id || newIncident);
      
    } catch (error) {
      console.error('Error adding incident:', error);
      alert('Error reporting incident. Please try again.');
    }
  };

  // Fallback function to save incident to individuals table
  const saveIncidentToIndividualsTable = async (incident) => {
    try {
      // Generate a unique ID for the incident
      const incidentWithId = {
        ...incident,
        id: Date.now().toString()
      };

      // Get current incidents array from individual
      const { data: individualData, error: fetchError } = await supabase
        .from('individuals')
        .select('incidents')
        .eq('id', selectedIndividual.id)
        .single();

      if (fetchError) throw fetchError;

      const currentIncidents = individualData.incidents || [];
      const updatedIncidents = [...currentIncidents, incidentWithId];

      const { error } = await supabase
        .from('individuals')
        .update({ 
          incidents: updatedIncidents,
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedIndividual.id);

      if (error) throw error;

      setIncidents(updatedIncidents);
      
      // Update all incidents and stats
      const newIncidentForStats = {
        ...incidentWithId,
        individual_id: selectedIndividual.id,
        individual_name: `${selectedIndividual.firstname} ${selectedIndividual.lastname}`,
        individual_identifier: selectedIndividual.individualid
      };
      
      setAllIncidents(prev => [newIncidentForStats, ...prev]);
      setCardStats(prev => ({
        ...prev,
        openIncidents: prev.openIncidents + 1,
        totalIncidents: prev.totalIncidents + 1,
        highSeverity: incident.severity?.includes('Critical') || incident.severity?.includes('Major') 
          ? prev.highSeverity + 1 
          : prev.highSeverity
      }));
      
      setShowAddModal(false);
      resetIncidentForm();
      alert('Incident reported successfully!');
    } catch (error) {
      console.error('Error saving incident to individuals table:', error);
      throw error;
    }
  };

  // Handle incident review
  const handleReviewIncident = async (e) => {
    e.preventDefault();
    
    if (!canReviewIncidents) {
      alert('You do not have permission to review incidents.');
      return;
    }

    try {
      const incidentId = reviewForm.incidentid;
      const incidentToUpdate = incidents.find(inc => inc.id === incidentId);
      
      if (!incidentToUpdate) {
        alert('Incident not found.');
        return;
      }

      const updateData = {
        status: reviewForm.statuschange || incidentToUpdate.status,
        lastupdated: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reviewed_by: userProfile.fullname,
        reviewed_by_role: userProfile.role_name,
        reviewdate: reviewForm.reviewdate
      };

      // Add review notes based on review type
      if (reviewForm.reviewtype === 'QIDP') {
        updateData.qidpreviewnotes = reviewForm.notes;
        updateData.qidpreviewdate = new Date().toISOString();
      } else if (reviewForm.reviewtype === 'Admin') {
        updateData.adminreviewnotes = reviewForm.notes;
        updateData.adminreviewdate = new Date().toISOString();
      }

      // Try to update in incidents table
      const { data, error } = await supabase
        .from('incidents')
        .update(updateData)
        .eq('id', incidentId)
        .select()
        .single();

      if (error) {
        console.log('Incidents table not found, updating in individuals table');
        // Fallback to individuals table
        await updateIncidentInIndividualsTable(incidentId, updateData);
      } else {
        // Update local state
        const updatedIncidents = incidents.map(inc => 
          inc.id === incidentId ? { ...inc, ...updateData } : inc
        );
        setIncidents(updatedIncidents);
        
        // Update all incidents
        const updatedAllIncidents = allIncidents.map(inc => 
          inc.id === incidentId ? { ...inc, ...updateData } : inc
        );
        setAllIncidents(updatedAllIncidents);
        
        // Recalculate stats
        calculateStats(updatedAllIncidents);
        
        setShowReviewModal(false);
        resetReviewForm();
        alert('Incident review completed successfully!');
      }
      
    } catch (error) {
      console.error('Error reviewing incident:', error);
      alert('Error reviewing incident. Please try again.');
    }
  };

  // Fallback function to update incident in individuals table
  const updateIncidentInIndividualsTable = async (incidentId, updateData) => {
    try {
      const { data: individualData, error: fetchError } = await supabase
        .from('individuals')
        .select('incidents')
        .eq('id', selectedIndividual.id)
        .single();

      if (fetchError) throw fetchError;

      const updatedIncidents = individualData.incidents.map(incident => 
        incident.id === incidentId 
          ? { ...incident, ...updateData }
          : incident
      );

      const { error } = await supabase
        .from('individuals')
        .update({ 
          incidents: updatedIncidents,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedIndividual.id);

      if (error) throw error;

      // Update local state
      const localUpdatedIncidents = incidents.map(inc => 
        inc.id === incidentId ? { ...inc, ...updateData } : inc
      );
      setIncidents(localUpdatedIncidents);
      
      // Update all incidents
      const updatedAllIncidents = allIncidents.map(inc => 
        inc.id === incidentId ? { ...inc, ...updateData } : inc
      );
      setAllIncidents(updatedAllIncidents);
      
      // Recalculate stats
      calculateStats(updatedAllIncidents);
      
      setShowReviewModal(false);
      resetReviewForm();
      alert('Incident review completed successfully!');
    } catch (error) {
      console.error('Error updating incident in individuals table:', error);
      throw error;
    }
  };

  const autoLinkIncident = async (incident) => {
    try {
      const links = {
        medications: [],
        behaviors: [],
        notes: []
      };

      // Determine links based on incident type and description
      if (selectedIndividual.medications && selectedIndividual.medications.length > 0) {
        if (incident.incidenttype === 'Medication Error' || 
            incident.description?.toLowerCase().includes('medication') ||
            incident.description?.toLowerCase().includes('pill') ||
            incident.description?.toLowerCase().includes('dose')) {
          links.medications = selectedIndividual.medications.map(med => med.id || med.medication_id);
        }
      }

      if (incident.incidenttype === 'Behavioral Emergency' ||
          incident.description?.toLowerCase().includes('behavior') ||
          incident.description?.toLowerCase().includes('aggressive') ||
          incident.description?.toLowerCase().includes('meltdown')) {
        links.behaviors = ['behavior-tracking'];
      }

      // Update incident with linked records
      const updateData = { 
        linkedrecords: links, 
        updated_at: new Date().toISOString() 
      };
      
      // Try to update in incidents table
      const { error } = await supabase
        .from('incidents')
        .update(updateData)
        .eq('id', incident.id || incident);

      if (error) {
        console.log('Could not update linked records in incidents table');
      }
        
    } catch (error) {
      console.error('Error auto-linking incident:', error);
    }
  };

  // Handle incident deletion
  const handleDeleteIncident = async (incidentId) => {
    if (!canDeleteIncidents) {
      alert('You do not have permission to delete incidents.');
      return;
    }

    if (!confirm('Are you sure you want to delete this incident? This action cannot be undone.')) {
      return;
    }

    try {
      // Try to delete from incidents table
      const { error } = await supabase
        .from('incidents')
        .delete()
        .eq('id', incidentId);

      if (error) {
        console.log('Incidents table not found, deleting from individuals table');
        // Fallback to removing from individuals table
        await deleteIncidentFromIndividualsTable(incidentId);
      } else {
        // Update local state
        const updatedIncidents = incidents.filter(inc => inc.id !== incidentId);
        setIncidents(updatedIncidents);
        
        // Update all incidents and stats
        const updatedAllIncidents = allIncidents.filter(inc => inc.id !== incidentId);
        setAllIncidents(updatedAllIncidents);
        calculateStats(updatedAllIncidents);
        
        alert('Incident deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting incident:', error);
      alert('Error deleting incident. Please try again.');
    }
  };

  // Fallback function to delete incident from individuals table
  const deleteIncidentFromIndividualsTable = async (incidentId) => {
    try {
      const { data: individualData, error: fetchError } = await supabase
        .from('individuals')
        .select('incidents')
        .eq('id', selectedIndividual.id)
        .single();

      if (fetchError) throw fetchError;

      const updatedIncidents = individualData.incidents.filter(inc => inc.id !== incidentId);

      const { error } = await supabase
        .from('individuals')
        .update({ 
          incidents: updatedIncidents,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedIndividual.id);

      if (error) throw error;

      // Update local state
      const localUpdatedIncidents = incidents.filter(inc => inc.id !== incidentId);
      setIncidents(localUpdatedIncidents);
      
      // Update all incidents and stats
      const updatedAllIncidents = allIncidents.filter(inc => inc.id !== incidentId);
      setAllIncidents(updatedAllIncidents);
      calculateStats(updatedAllIncidents);
      
      alert('Incident deleted successfully!');
    } catch (error) {
      console.error('Error deleting incident from individuals table:', error);
      throw error;
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileData = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      uploaded_by: userProfile.fullname,
      url: URL.createObjectURL(file)
    }));
    
    setIncidentForm({
      ...incidentForm,
      attachments: [...incidentForm.attachments, ...fileData]
    });
  };

  const removeAttachment = (index) => {
    setIncidentForm({
      ...incidentForm,
      attachments: incidentForm.attachments.filter((_, i) => i !== index)
    });
  };

  const resetIncidentForm = () => {
    setIncidentForm({
      incidenttype: '',
      severity: '',
      dateoccurred: '',
      timeoccurred: '',
      location: '',
      individualsinvolved: [],
      staffinvolved: [],
      description: '',
      immediateaction: '',
      injuries: '',
      medicalattention: false,
      notifiedparties: [],
      witnessnames: [],
      witnessstatements: '',
      followuprequired: false,
      followupactions: '',
      qidpreviewnotes: '',
      adminreviewnotes: '',
      status: 'Open',
      attachments: [],
      ipmsfields: {
        incidentcategory: '',
        subcategory: '',
        locationcode: '',
        contributingfactors: [],
        preventionmeasures: []
      },
      created_by: '',
      created_by_role: '',
      division: '',
      facility: ''
    });
  };

  const resetReviewForm = () => {
    setReviewForm({
      incidentid: '',
      reviewtype: '',
      notes: '',
      recommendations: '',
      statuschange: '',
      reviewedby: '',
      reviewdate: new Date().toISOString().split('T')[0],
      reviewed_by: '',
      reviewed_by_role: ''
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical - Life Threatening': return 'text-red-400 bg-red-900/30 border-red-500/50';
      case 'Major - Serious Injury/Illness': return 'text-orange-400 bg-orange-900/30 border-orange-500/50';
      case 'Moderate - Minor Injury/Illness': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50';
      case 'Minor - No Injury/Illness': return 'text-green-400 bg-green-900/30 border-green-500/50';
      case 'Near Miss': return 'text-blue-400 bg-blue-900/30 border-blue-500/50';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'text-red-400 bg-red-900/30 border-red-500/50';
      case 'Under Review': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50';
      case 'Pending Investigation': return 'text-orange-400 bg-orange-900/30 border-orange-500/50';
      case 'Resolved': return 'text-blue-400 bg-blue-900/30 border-blue-500/50';
      case 'Closed': return 'text-green-400 bg-green-900/30 border-green-500/50';
      case 'Referred to External Agency': return 'text-purple-400 bg-purple-900/30 border-purple-500/50';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
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

  // Filter individuals based on search term and active filter
  const filteredIndividuals = individuals.filter(ind => {
    const matchesSearch = 
      ind.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.individualid?.toLowerCase().includes(searchTerm.toLowerCase());

    // If there's an active filter, check if individual has incidents matching that filter
    if (activeFilter) {
      const individualIncidents = allIncidents.filter(inc => inc.individual_id === ind.id);
      
      if (individualIncidents.length === 0) return false;
      
      switch(activeFilter) {
        case 'open':
          return individualIncidents.some(inc => inc.status === 'Open');
        case 'high':
          return individualIncidents.some(inc => 
            inc.severity?.includes('Critical') || inc.severity?.includes('Major')
          );
        case 'total':
          return individualIncidents.length > 0;
        default:
          return true;
      }
    }

    return matchesSearch;
  });

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = 
      incident.incidenttype?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;
    const matchesType = filterType === 'all' || incident.incidenttype === filterType;

    return matchesSearch && matchesStatus && matchesSeverity && matchesType;
  });

  // Clear active filter
  const clearFilter = () => {
    setActiveFilter(null);
    setSearchTerm('');
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
        <div className="hidden md:flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm rounded-2xl px-5 py-2.5 w-96 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300">
          <Search size={18} className="text-emerald-400" />
          <input 
            type="text" 
            placeholder="Search incidents..." 
            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
        
        <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Incident Rate</span>
            <span className="text-xs text-red-400 font-bold">{cardStats.totalIncidents}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full transition-all duration-1000" 
              style={{width: `${Math.min((cardStats.totalIncidents / 10) * 100, 100)}%`}}></div>
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
                if (item.id !== 'incident') {
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
  if (!profileLoading && !canViewIncidents) {
    return (
      <div className="h-screen flex flex-col bg-slate-950 text-white">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
            <p className="text-slate-400 mb-6">
              You do not have permission to view incidents. Please contact your administrator if you believe this is an error.
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
          <p className="text-slate-400 text-lg">Loading incidents...</p>
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
                      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500">
                        Incident Reporting
                      </h2>
                      <div className="px-3 py-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full">
                        <span className="text-red-400 text-xs font-bold flex items-center gap-1">
                          <AlertTriangle size={12} /> IPMS
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-lg">
                      IPMS-Aligned • State Compliant Incident Management
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => router.push('/dashboard')}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-slate-700"
                    >
                      <ChevronLeft size={18} />
                      Back to Dashboard
                    </button>
                  </div>
                </div>

                {/* Quick Stats - Now showing data from all incidents */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Open Incidents Card */}
                  <div 
                    onClick={() => handleCardClick('open')}
                    className={`group relative bg-gradient-to-br from-red-600/20 to-pink-500/20 backdrop-blur-sm border rounded-2xl p-6 hover:border-red-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 overflow-hidden cursor-pointer ${
                      activeFilter === 'open' ? 'border-red-500/70 shadow-2xl shadow-red-500/30' : 'border-red-500/30'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-600 to-pink-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                          <AlertTriangle className="text-white" size={26} />
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="text-red-400" size={18} />
                          <span className="text-sm font-bold text-red-400">
                            {cardStats.openIncidents > 0 ? '+12%' : '0%'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Open Incidents</p>
                        <div className="flex items-end gap-2">
                          <p className="text-4xl font-black text-white">
                            {cardStats.openIncidents}
                          </p>
                          {cardStats.openIncidents > 0 && <AlertTriangle className="text-red-400 mb-2 animate-pulse" size={20} />}
                        </div>
                        {activeFilter === 'open' && (
                          <p className="text-red-300 text-xs mt-2">Showing individuals with open incidents</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* High Severity Card */}
                  <div 
                    onClick={() => handleCardClick('high')}
                    className={`group relative bg-gradient-to-br from-orange-600/20 to-red-500/20 backdrop-blur-sm border rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 overflow-hidden cursor-pointer ${
                      activeFilter === 'high' ? 'border-orange-500/70 shadow-2xl shadow-orange-500/30' : 'border-orange-500/30'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-600 to-red-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                          <AlertOctagon className="text-white" size={26} />
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="text-orange-400" size={18} />
                          <span className="text-sm font-bold text-orange-400">
                            {cardStats.highSeverity > 0 ? '+8%' : '0%'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">High Severity</p>
                        <div className="flex items-end gap-2">
                          <p className="text-4xl font-black text-white">
                            {cardStats.highSeverity}
                          </p>
                        </div>
                        {activeFilter === 'high' && (
                          <p className="text-orange-300 text-xs mt-2">Showing individuals with high severity incidents</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Closure Rate Card */}
                  <div className="group relative bg-gradient-to-br from-blue-600/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600 to-cyan-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                          <TrendingUp className="text-white" size={26} />
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="text-blue-400" size={18} />
                          <span className="text-sm font-bold text-blue-400">
                            {cardStats.closureRate}%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Closure Rate</p>
                        <div className="flex items-end gap-2">
                          <p className="text-4xl font-black text-white">
                            {cardStats.closureRate}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Incidents Card */}
                  <div 
                    onClick={() => handleCardClick('total')}
                    className={`group relative bg-gradient-to-br from-purple-600/20 to-pink-500/20 backdrop-blur-sm border rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden cursor-pointer ${
                      activeFilter === 'total' ? 'border-purple-500/70 shadow-2xl shadow-purple-500/30' : 'border-purple-500/30'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                          <BarChart3 className="text-white" size={26} />
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="text-purple-400" size={18} />
                          <span className="text-sm font-bold text-purple-400">
                            {cardStats.totalIncidents > 0 ? '+5%' : '0%'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Total Incidents</p>
                        <div className="flex items-end gap-2">
                          <p className="text-4xl font-black text-white">{cardStats.totalIncidents}</p>
                        </div>
                        {activeFilter === 'total' && (
                          <p className="text-purple-300 text-xs mt-2">Showing individuals with incidents</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter Clear Button */}
                {activeFilter && (
                  <div className="flex justify-end">
                    <button
                      onClick={clearFilter}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all duration-300 text-sm"
                    >
                      <X size={14} />
                      Clear Filter
                    </button>
                  </div>
                )}

                {/* Main Content */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300">
                  {!selectedIndividual ? (
                    <>
                      {/* Individual Selection */}
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">Select Individual</h3>
                          <p className="text-slate-400">Choose an individual to view their incident history</p>
                          {activeFilter && (
                            <p className="text-emerald-400 text-sm mt-1">
                              Showing individuals with {activeFilter === 'open' ? 'open incidents' : 
                              activeFilter === 'high' ? 'high severity incidents' : 
                              'incidents'}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-3 bg-slate-900/50 rounded-xl px-5 py-3 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 group">
                            <Search size={20} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                            <input 
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Search individuals..." 
                              className="bg-transparent border-none outline-none text-sm text-white w-64 placeholder:text-slate-500"
                            />
                          </div>
                        </div>
                      </div>

                      <ScrollArea className="h-[400px]">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredIndividuals.map((individual, idx) => {
                            // Get incident count for this individual
                            const individualIncidents = allIncidents.filter(inc => inc.individual_id === individual.id);
                            const openIncidentsCount = individualIncidents.filter(inc => inc.status === 'Open').length;
                            const highSeverityCount = individualIncidents.filter(inc => 
                              inc.severity?.includes('Critical') || inc.severity?.includes('Major')
                            ).length;
                            
                            return (
                              <div
                                key={individual.id}
                                onClick={() => {
                                  setSelectedIndividual(individual);
                                  fetchIncidents(individual.id);
                                }}
                                className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 cursor-pointer hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 group"
                              >
                                <div className="flex items-center gap-3 mb-3">
                                  <div className={`w-12 h-12 bg-gradient-to-br ${getColorClass(idx)} rounded-xl flex items-center justify-center text-white font-bold`}>
                                    {getInitials(individual.firstname, individual.lastname)}
                                  </div>
                                  <div>
                                    <h3 className="text-white font-semibold group-hover:text-emerald-400 transition-colors">
                                      {individual.firstname} {individual.lastname}
                                    </h3>
                                    <p className="text-slate-400 text-sm">ID: {individual.individualid}</p>
                                  </div>
                                </div>
                                
                                {/* Incident Badges */}
                                {individualIncidents.length > 0 && (
                                  <div className="flex gap-2 mb-3">
                                    {openIncidentsCount > 0 && (
                                      <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded-full border border-red-500/50">
                                        {openIncidentsCount} Open
                                      </span>
                                    )}
                                    {highSeverityCount > 0 && (
                                      <span className="px-2 py-1 bg-orange-900/30 text-orange-400 text-xs rounded-full border border-orange-500/50">
                                        {highSeverityCount} High
                                      </span>
                                    )}
                                    <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                                      {individualIncidents.length} Total
                                    </span>
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-400">{individual.homeassignment}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    individual.status === 'Active' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                                  }`}>
                                    {individual.status}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </>
                  ) : (
                    <>
                      {/* Selected Individual Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                            {getInitials(selectedIndividual.firstname, selectedIndividual.lastname)}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white">
                              {selectedIndividual.firstname} {selectedIndividual.lastname}
                            </h3>
                            <p className="text-slate-400">ID: {selectedIndividual.individualid} • {selectedIndividual.homeassignment}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setSelectedIndividual(null);
                              setIncidents([]);
                            }}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all duration-300"
                          >
                            Change Individual
                          </button>
                          {canCreateIncidents && (
                            <button
                              onClick={() => setShowAddModal(true)}
                              className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-300"
                            >
                              <AlertTriangle size={18} />
                              Report Incident
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Incidents List */}
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-xl font-bold text-white">Incident History</h3>
                            <p className="text-slate-400">IPMS-aligned incident tracking and management</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setShowFilterMenu(!showFilterMenu)}
                              className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-800 text-white rounded-xl px-5 py-3 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 font-semibold"
                            >
                              <Filter size={18} />
                              Filters
                              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full font-bold">
                                {filterStatus === 'all' ? 'All' : filterStatus}
                              </span>
                            </button>
                            {canExportIncidents && (
                              <button className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-800 text-white rounded-xl px-5 py-3 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 font-semibold">
                                <Download size={18} />
                                Export
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Filter Menu */}
                        {showFilterMenu && (
                          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                                <select
                                  value={filterStatus}
                                  onChange={(e) => setFilterStatus(e.target.value)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                                >
                                  <option value="all">All Statuses</option>
                                  {incidentStatuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Severity</label>
                                <select
                                  value={filterSeverity}
                                  onChange={(e) => setFilterSeverity(e.target.value)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                                >
                                  <option value="all">All Severities</option>
                                  {severityLevels.map(severity => (
                                    <option key={severity} value={severity}>{severity}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                                <select
                                  value={filterType}
                                  onChange={(e) => setFilterType(e.target.value)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                                >
                                  <option value="all">All Types</option>
                                  {ipmsIncidentTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        {filteredIncidents.length === 0 ? (
                          <div className="text-center py-16">
                            <AlertTriangle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h4 className="text-xl font-bold text-slate-400 mb-2">No incidents found</h4>
                            <p className="text-slate-500">
                              {incidents.length === 0 
                                ? 'No incidents reported for this individual' 
                                : 'Try adjusting your search or filters'}
                            </p>
                          </div>
                        ) : (
                          <ScrollArea className="h-[600px]">
                            <div className="space-y-4">
                              {filteredIncidents.map((incident) => (
                                <div key={incident.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-red-500/30 transition-all duration-300">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-4">
                                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                        incident.severity?.includes('Critical') ? 'bg-red-900/50' :
                                        incident.severity?.includes('Major') ? 'bg-orange-900/50' :
                                        incident.severity?.includes('Moderate') ? 'bg-yellow-900/50' :
                                        'bg-green-900/50'
                                      }`}>
                                        <AlertTriangle className={`${
                                          incident.severity?.includes('Critical') ? 'text-red-400' :
                                          incident.severity?.includes('Major') ? 'text-orange-400' :
                                          incident.severity?.includes('Moderate') ? 'text-yellow-400' :
                                          'text-green-400'
                                        }`} size={24} />
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                          <h4 className="text-white font-bold text-lg">{incident.incidenttype}</h4>
                                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(incident.severity)}`}>
                                            {incident.severity}
                                          </span>
                                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(incident.status)}`}>
                                            {incident.status}
                                          </span>
                                        </div>
                                        <p className="text-slate-300 text-sm mb-2">
                                          {new Date(incident.dateoccurred).toLocaleDateString()} at {incident.timeoccurred} • {incident.location}
                                        </p>
                                        <p className="text-slate-400 text-sm line-clamp-2">{incident.description}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {canReviewIncidents && (
                                        <button
                                          onClick={() => {
                                            setReviewForm({
                                              ...reviewForm, 
                                              incidentid: incident.id,
                                              reviewedby: userProfile.fullname,
                                              reviewed_by: userProfile.fullname,
                                              reviewed_by_role: userProfile.role_name
                                            });
                                            setShowReviewModal(true);
                                          }}
                                          className="p-2 hover:bg-blue-500/20 rounded-lg transition-all duration-300"
                                        >
                                          <Eye size={16} className="text-blue-400" />
                                        </button>
                                      )}
                                      {canDeleteIncidents && (
                                        <button
                                          onClick={() => handleDeleteIncident(incident.id)}
                                          className="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                                        >
                                          <Trash2 size={16} className="text-red-400" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Quick Details */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                                    <div>
                                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Reported By</p>
                                      <p className="text-white text-sm">{incident.created_by || 'Unknown'}</p>
                                    </div>
                                    <div>
                                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Staff Involved</p>
                                      <p className="text-white text-sm">{incident.staffinvolved?.length || 0} staff</p>
                                    </div>
                                    <div>
                                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Medical Attention</p>
                                      <p className="text-white text-sm">{incident.medicalattention ? 'Yes' : 'No'}</p>
                                    </div>
                                    <div>
                                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Follow-up Required</p>
                                      <p className="text-white text-sm">{incident.followuprequired ? 'Yes' : 'No'}</p>
                                    </div>
                                    <div>
                                      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Attachments</p>
                                      <p className="text-white text-sm">{incident.attachments?.length || 0} files</p>
                                    </div>
                                  </div>

                                  {/* IPMS Fields */}
                                  {incident.ipmsfields?.incidentcategory && (
                                    <div className="border-t border-slate-700 pt-4">
                                      <h5 className="text-slate-400 text-sm font-semibold mb-2">IPMS Classification</h5>
                                      <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded border border-blue-500/50">
                                          {incident.ipmsfields.incidentcategory}
                                        </span>
                                        {incident.ipmsfields.subcategory && (
                                          <span className="px-2 py-1 bg-cyan-900/30 text-cyan-400 text-xs rounded border border-cyan-500/50">
                                            {incident.ipmsfields.subcategory}
                                          </span>
                                        )}
                                        {incident.ipmsfields.locationcode && (
                                          <span className="px-2 py-1 bg-purple-900/30 text-purple-400 text-xs rounded border border-purple-500/50">
                                            {incident.ipmsfields.locationcode}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Review Status */}
                                  {(incident.qidpreviewnotes || incident.adminreviewnotes) && (
                                    <div className="border-t border-slate-700 pt-4 mt-4">
                                      <h5 className="text-slate-400 text-sm font-semibold mb-2">Review Status</h5>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {incident.qidpreviewnotes && (
                                          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                                            <p className="text-blue-400 text-xs uppercase tracking-wider mb-1">QIDP Review</p>
                                            <p className="text-white text-sm">{incident.qidpreviewnotes}</p>
                                            <p className="text-blue-300 text-xs mt-1">
                                              {incident.qidpreviewdate ? new Date(incident.qidpreviewdate).toLocaleDateString() : 'No date'}
                                            </p>
                                          </div>
                                        )}
                                        {incident.adminreviewnotes && (
                                          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                                            <p className="text-purple-400 text-xs uppercase tracking-wider mb-1">Admin Review</p>
                                            <p className="text-white text-sm">{incident.adminreviewnotes}</p>
                                            <p className="text-purple-300 text-xs mt-1">
                                              {incident.adminreviewdate ? new Date(incident.adminreviewdate).toLocaleDateString() : 'No date'}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </main>
          </ScrollArea>
        </div>
      </div>

      {/* Add Incident Modal */}
      {showAddModal && canCreateIncidents && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Report New Incident</h3>
                  <p className="text-slate-400 text-sm">IPMS-aligned incident reporting</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="text-slate-400" size={24} />
              </button>
            </div>

            <ScrollArea className="h-[calc(90vh-180px)]">
              <form onSubmit={handleAddIncident} className="p-6 space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <AlertTriangle size={20} />
                    Basic Incident Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Incident Type *</label>
                      <select
                        value={incidentForm.incidenttype}
                        onChange={(e) => setIncidentForm({...incidentForm, incidenttype: e.target.value})}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      >
                        <option value="">Select Incident Type</option>
                        {ipmsIncidentTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Severity Level *</label>
                      <select
                        value={incidentForm.severity}
                        onChange={(e) => setIncidentForm({...incidentForm, severity: e.target.value})}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      >
                        <option value="">Select Severity</option>
                        {severityLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Date Occurred *</label>
                      <input
                        type="date"
                        value={incidentForm.dateoccurred}
                        onChange={(e) => setIncidentForm({...incidentForm, dateoccurred: e.target.value})}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Time Occurred *</label>
                      <input
                        type="time"
                        value={incidentForm.timeoccurred}
                        onChange={(e) => setIncidentForm({...incidentForm, timeoccurred: e.target.value})}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Location *</label>
                      <input
                        type="text"
                        value={incidentForm.location}
                        onChange={(e) => setIncidentForm({...incidentForm, location: e.target.value})}
                        required
                        placeholder="e.g., Oak Ridge Home, Community"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Medical Attention Required</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setIncidentForm({...incidentForm, medicalattention: !incidentForm.medicalattention})}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            incidentForm.medicalattention 
                              ? 'bg-red-600 text-white' 
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {incidentForm.medicalattention ? 'Yes' : 'No'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* IPMS Classification */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <Shield size={20} />
                    IPMS Classification
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Incident Category</label>
                      <select
                        value={incidentForm.ipmsfields.incidentcategory}
                        onChange={(e) => setIncidentForm({
                          ...incidentForm,
                          ipmsfields: {...incidentForm.ipmsfields, incidentcategory: e.target.value}
                        })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      >
                        <option value="">Select Category</option>
                        <option value="Consumer">Consumer</option>
                        <option value="Staff">Staff</option>
                        <option value="Environmental">Environmental</option>
                        <option value="Vehicle">Vehicle</option>
                        <option value="Property">Property</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Subcategory</label>
                      <input
                        type="text"
                        value={incidentForm.ipmsfields.subcategory}
                        onChange={(e) => setIncidentForm({
                          ...incidentForm,
                          ipmsfields: {...incidentForm.ipmsfields, subcategory: e.target.value}
                        })}
                        placeholder="e.g., Injury, Death, Abuse"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Location Code</label>
                      <select
                        value={incidentForm.ipmsfields.locationcode}
                        onChange={(e) => setIncidentForm({
                          ...incidentForm,
                          ipmsfields: {...incidentForm.ipmsfields, locationcode: e.target.value}
                        })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      >
                        <option value="">Select Location Code</option>
                        {locationCodes.map(code => (
                          <option key={code} value={code}>{code}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Detailed Description */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <FileText size={20} />
                    Detailed Description
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Incident Description *</label>
                      <textarea
                        value={incidentForm.description}
                        onChange={(e) => setIncidentForm({...incidentForm, description: e.target.value})}
                        required
                        rows="4"
                        placeholder="Provide detailed description of what happened..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Immediate Action Taken *</label>
                      <textarea
                        value={incidentForm.immediateaction}
                        onChange={(e) => setIncidentForm({...incidentForm, immediateaction: e.target.value})}
                        required
                        rows="3"
                        placeholder="Describe immediate actions taken..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Injuries Sustained</label>
                        <input
                          type="text"
                          value={incidentForm.injuries}
                          onChange={(e) => setIncidentForm({...incidentForm, injuries: e.target.value})}
                          placeholder="Describe any injuries"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Witness Names</label>
                        <input
                          type="text"
                          value={incidentForm.witnessnames.join(', ')}
                          onChange={(e) => setIncidentForm({...incidentForm, witnessnames: e.target.value.split(',').map(name => name.trim()).filter(name => name)})}
                          placeholder="Separate names with commas"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Witness Statements</label>
                      <textarea
                        value={incidentForm.witnessstatements}
                        onChange={(e) => setIncidentForm({...incidentForm, witnessstatements: e.target.value})}
                        rows="3"
                        placeholder="Record witness statements..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

              
                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-300"
                  >
                    <AlertTriangle size={18} />
                    Report Incident
                  </button>
                </div>
              </form>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Review Incident Modal */}
      {showReviewModal && canReviewIncidents && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Eye className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Review Incident</h3>
                  <p className="text-slate-400 text-sm">QIDP/Admin review and recommendations</p>
                </div>
              </div>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="text-slate-400" size={24} />
              </button>
            </div>

            <form onSubmit={handleReviewIncident} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Review Type</label>
                  <select
                    value={reviewForm.reviewtype}
                    onChange={(e) => setReviewForm({...reviewForm, reviewtype: e.target.value})}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="">Select Review Type</option>
                    <option value="QIDP">QIDP Review</option>
                    <option value="Admin">Admin Review</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status Change</label>
                  <select
                    value={reviewForm.statuschange}
                    onChange={(e) => setReviewForm({...reviewForm, statuschange: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="">No Change</option>
                    {incidentStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Reviewed By</label>
                  <input
                    type="text"
                    value={reviewForm.reviewedby}
                    onChange={(e) => setReviewForm({...reviewForm, reviewedby: e.target.value})}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Review Date</label>
                  <input
                    type="date"
                    value={reviewForm.reviewdate}
                    onChange={(e) => setReviewForm({...reviewForm, reviewdate: e.target.value})}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Review Notes</label>
                <textarea
                  value={reviewForm.notes}
                  onChange={(e) => setReviewForm({...reviewForm, notes: e.target.value})}
                  required
                  rows="4"
                  placeholder="Enter review notes and observations..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Recommendations</label>
                <textarea
                  value={reviewForm.recommendations}
                  onChange={(e) => setReviewForm({...reviewForm, recommendations: e.target.value})}
                  rows="3"
                  placeholder="Enter recommendations for prevention/improvement..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-blue-500/50 transition-all"
                >
                  <CheckCircle size={18} />
                  Complete Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentsPage;
