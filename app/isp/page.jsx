
'use client'

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Save, Edit2, Plus, Trash2, Calendar, Target, 
  AlertCircle, Shield, Heart, Activity, FileText, Users,
  Clock, CheckCircle, XCircle, ChevronRight, ChevronDown,
  Home as HomeIcon, Phone, Mail, MapPin, User, Loader2,Search,
  Award, TrendingUp, AlertTriangle, Info, Lock, Upload,
  Type, X, Download, Move, Eye, Trash
} from 'lucide-react';
import { ScrollArea } from "../../components/ui/scroll-area";
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useUserProfile } from '../../contexts/userProfileContext';
import { PERMISSIONS } from '../../utils/permissions';

const supabase = createClient(
  'https://bbikcxalypttfgrlxstf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWtjeGFseXB0dGZncmx4c3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODcwOCwiZXhwIjoyMDY5Mjk0NzA4fQ.4BLQyvPA0eB745Sfdn2Tl4oCDRTzNhLXrJ8Os8wOXfs'
);

const IndividualProfilePage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const individualId = params?.id;
  const { userProfile, loading: profileLoading, hasPermission, hasAnyPermission } = useUserProfile();

  const [individual, setIndividual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    outcomes: true,
    goals: true,
    risks: false,
    alerts: false
  });

   // CHANGED: Add state for all individuals and selected individual
  const [individuals, setIndividuals] = useState([]);
  const [selectedIndividual, setSelectedIndividual] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // ADDED: Search term

  // PDF Signature States
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPages, setPdfPages] = useState([]);
  const [signatures, setSignatures] = useState([]);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [selectedFont, setSelectedFont] = useState('cursive');
  const [draggedSignature, setDraggedSignature] = useState(null);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [savedDocuments, setSavedDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);
  const pageRefs = useRef([]);

  const fonts = [
    { name: 'Cursive', value: 'cursive', style: 'Dancing Script' },
    { name: 'Elegant', value: 'elegant', style: 'Great Vibes' },
    { name: 'Modern', value: 'modern', style: 'Pacifico' },
    { name: 'Classic', value: 'classic', style: 'Allura' }
  ];

  // Permission checks
  const canViewProfile = hasAnyPermission([
    PERMISSIONS.DAILY_NOTES_VIEW,
    PERMISSIONS.DAILY_NOTES_CREATE,
    PERMISSIONS.PLANS_VIEW,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canEditBasicInfo = hasAnyPermission([
    PERMISSIONS.PLANS_EDIT,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canEditPlans = hasAnyPermission([
    PERMISSIONS.PLANS_CREATE,
    PERMISSIONS.PLANS_EDIT,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canViewPlans = hasAnyPermission([
    PERMISSIONS.PLANS_VIEW,
    PERMISSIONS.PLANS_CREATE,
    PERMISSIONS.PLANS_EDIT,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canManageRisks = hasAnyPermission([
    PERMISSIONS.PLANS_EDIT,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canManageAlerts = hasAnyPermission([
    PERMISSIONS.INCIDENTS_CREATE,
    PERMISSIONS.PLANS_EDIT,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canManageDocuments = hasAnyPermission([
    PERMISSIONS.PLANS_CREATE,
    PERMISSIONS.PLANS_EDIT,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  // Form state - matches all fields from the add modal
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    individualid: '',
    dateofbirth: '',
    gender: '',
    phone: '',
    email: '',
    location: '',
    homeassignment: '',
    primarydiagnosis: '',
    guardianname: '',
    guardianphone: '',
    guardianemail: '',
    admissiondate: '',
    status: 'Active',
    medicaidnumber: '',
    emergencycontact: '',
    allergies: '',
    notes: '',
    outcomes: [],
    goals: [],
    riskplans: [],
    medicalalerts: [],
    behavioralalerts: [],
    rightsrestrictions: [],
    hcbsdomains: [],
    effectivedate: '',
    nextreviewdate: '',
    qidpnotes: '',


      
  // Person-Centered Information (already added)
  important_to: '',
  important_for: '',
  strengths_interests: '',
  
  // Community Integration (already added)
  community_activities: [],
  transportation_method: '',
  community_barriers: '',
  
  // Behavior Support (already added)
  behavior_summary: '',
  behavior_strategies: '',
  abc_data_required: false,
  
  // Health & Wellness (already added)
  health_summary: '',
  seizure_history: '',
  medication_monitoring_notes: '',
  
  // Quarterly Reviews (already added)
  quarterly_reviews: [],
  
  // ISP Dates (already added)
  isp_effective_start: '',
  isp_effective_end: '',
  isp_next_review: '',
  
  // NEW: Lease / Residency Agreement
  lease_start_date: '',
  lease_end_date: '',
  rent_amount: '',
  rights_explained: false,
  signed_by_individual: false,
  lease_signature_date: '',
  
  // NEW: Complaint & Grievance tracking
  complaints: [],
  
  // NEW: Corrective Action Plans
  corrective_action_plans: [],

staff_training_requirements: [],

// NEW: Assigned Staff tracking
  assigned_staff: []


  

  });

  // Load PDF.js and jsPDF on component mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    document.body.appendChild(script);

    const jsPDFScript = document.createElement('script');
    jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    jsPDFScript.async = true;
    document.body.appendChild(jsPDFScript);

    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Great+Vibes&family=Pacifico&family=Allura&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
      if (document.body.contains(jsPDFScript)) document.body.removeChild(jsPDFScript);
      if (document.head.contains(fontLink)) document.head.removeChild(fontLink);
    };
  }, []);



  // Check if edit mode was requested via URL parameter
  useEffect(() => {
    const editParam = searchParams?.get('edit');
    if (editParam === 'true' && canEditBasicInfo) {
      setIsEditing(true);
    }
  }, [searchParams, canEditBasicInfo]);

  // Render PDF when file is selected
  useEffect(() => {
    if (pdfFile && window.pdfjsLib) {
      renderPDF();
    }
  }, [pdfFile]);

  // Load saved documents when tab is accessed
  useEffect(() => {
    if (activeTab === 'rights-agreements' && individualId) {
      loadSavedDocuments();
    }
  }, [activeTab, individualId]);

    // Fetch all individuals instead of single individual
  useEffect(() => {
    if (isLoaded && user && !profileLoading && userProfile) {
      if (canViewProfile) {
        fetchAllIndividuals(); // CHANGED: Fetch all individuals
      } else {
        setLoading(false);
      }
    }
  }, [isLoaded, user, profileLoading, userProfile]);

// CHANGED: Fetch all individuals
  const fetchAllIndividuals = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('individuals')
        .select('*')
        .order('created_at', { ascending: false });

      // Role-based filtering remains the same
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
      alert('Error loading individuals data.');
    } finally {
      setLoading(false);
    }
  };

    // ADDED: Handle individual selection
  const handleSelectIndividual = (individual) => {
    setSelectedIndividual(individual);
    fetchIndividualData(individual.id);
    setActiveTab('overview');
    setIsEditing(false);
  };

    // ADDED: Filter individuals based on search
  const filteredIndividuals = individuals.filter(ind => 
    ind.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ind.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ind.individualid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ADDED: Helper function for initials
  const getInitials = (firstname, lastname) => {
    return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
  };

    // ADDED: Color classes for avatar backgrounds
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

  // CHANGED: Fetch individual data when selected
  const fetchIndividualData = async (individualId) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('individuals')
        .select('*')
        .eq('id', individualId)
        .single();

      if (error) throw error;
      
      if (data) {
        setSelectedIndividual(data);
        setFormData({
          ...data,
          outcomes: data.outcomes || [],
          goals: data.goals || [],
          riskplans: data.riskplans || [],
          medicalalerts: data.medicalalerts || [],
          behavioralalerts: data.behavioralalerts || [],
          rightsrestrictions: data.rightsrestrictions || [],
          hcbsdomains: data.hcbsdomains || [],
          staff_training_requirements: data.staff_training_requirements || [],
          assigned_staff: data.assigned_staff || []
        });
      }
    } catch (error) {
      console.error('Error fetching individual:', error);
      alert('Error loading individual data.');
    } finally {
      setLoading(false);
    }
  };




  const fetchIndividual = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('individuals')
        .select('*')
        .eq('id', individualId);

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

      const { data, error } = await query.single();

      if (error) throw error;
      
      if (data) {
        setIndividual(data);
        setFormData({
          ...data,
          outcomes: data.outcomes || [],
          goals: data.goals || [],
          riskplans: data.riskplans || [],
          medicalalerts: data.medicalalerts || [],
          behavioralalerts: data.behavioralalerts || [],
          rightsrestrictions: data.rightsrestrictions || [],
          hcbsdomains: data.hcbsdomains || [],
          staff_training_requirements: data.staff_training_requirements || [], // ADD THIS
        assigned_staff: data.assigned_staff || [] // ADD THIS
        });
      }
    } catch (error) {
      console.error('Error fetching individual:', error);
      alert('Error loading individual data or you do not have permission to view this individual.');
      router.push('/individuals');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!canEditBasicInfo) {
      alert('You do not have permission to edit this individual.');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('individuals')
        .update({
          ...formData,
          last_activity: new Date().toISOString(),
          updated_by: userProfile.fullname,
          updated_by_role: userProfile.role_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedIndividual.id);

      if (error) throw error;

      setSelectedIndividual(formData);
      setIsEditing(false);
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // PDF Signature Functions
  const renderPDF = async () => {
    try {
      setPdfLoaded(false);
      const pdfjsLib = window.pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const fileReader = new FileReader();
      fileReader.onload = async function() {
        const typedArray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        
        const pages = [];
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;

          pages.push({
            dataUrl: canvas.toDataURL(),
            width: canvas.width,
            height: canvas.height
          });
        }
        
        setPdfPages(pages);
        setPdfLoaded(true);
      };
      fileReader.readAsArrayBuffer(pdfFile);
    } catch (error) {
      console.error('Error rendering PDF:', error);
      alert('Error loading PDF. Please try another file.');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setSignatures([]);
      setPdfPages([]);
    } else {
      alert('Please upload a PDF file');
    }
  };

  const createSignature = () => {
    if (!signatureName.trim()) {
      alert('Please enter your name');
      return;
    }

    const newSignature = {
      id: Date.now(),
      text: signatureName,
      font: selectedFont,
      page: 0,
      x: 100,
      y: 100
    };

    setSignatures([...signatures, newSignature]);
    setShowSignatureModal(false);
    setSignatureName('');
  };

  const handleDragStart = (e, signature) => {
    setDraggedSignature(signature);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, pageIndex) => {
    e.preventDefault();
    if (!draggedSignature) return;

    const pageElement = pageRefs.current[pageIndex];
    if (!pageElement) return;

    const rect = pageElement.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    setSignatures(signatures.map(sig =>
      sig.id === draggedSignature.id ? { ...sig, page: pageIndex, x, y } : sig
    ));
    setDraggedSignature(null);
  };

  const removeSignature = (id) => {
    setSignatures(signatures.filter(sig => sig.id !== id));
  };

  const getFontFamily = (font) => {
    const fontMap = {
      cursive: "'Dancing Script', cursive",
      elegant: "'Great Vibes', cursive",
      modern: "'Pacifico', cursive",
      classic: "'Allura', cursive"
    };
    return fontMap[font] || fontMap.cursive;
  };

  const saveSignedPDF = async () => {
    if (!canvasRef.current || pdfPages.length === 0 || !window.jspdf) {
      alert('Cannot generate PDF. Please try again.');
      return;
    }

    try {
      setUploadingPdf(true);

      const { jsPDF } = window.jspdf;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      const firstPage = pdfPages[0];
      const pdfWidth = firstPage.width * 0.264583;
      const pdfHeight = firstPage.height * 0.264583;
      
      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });

      for (let i = 0; i < pdfPages.length; i++) {
        const page = pdfPages[i];
        
        canvas.width = page.width;
        canvas.height = page.height;
        
        const img = new Image();
        img.src = page.dataUrl;
        
        await new Promise((resolve) => {
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
            
            const pageElement = pageRefs.current[i];
            const displayedWidth = pageElement ? pageElement.offsetWidth : page.width;
            const scaleRatio = page.width / displayedWidth;
            
            const pageSignatures = signatures.filter(sig => sig.page === i);
            pageSignatures.forEach(sig => {
              ctx.font = `48px ${getFontFamily(sig.font)}`;
              ctx.fillStyle = '#000';
              const scaledX = sig.x * scaleRatio;
              const scaledY = sig.y * scaleRatio;
              ctx.fillText(sig.text, scaledX, scaledY);
            });
            
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pageWidth = page.width * 0.264583;
            const pageHeight = page.height * 0.264583;
            
            if (i > 0) {
              pdf.addPage([pageWidth, pageHeight], pageWidth > pageHeight ? 'landscape' : 'portrait');
            }
            
            pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
            resolve();
          };
        });
      }
      
      const pdfBlob = pdf.output('blob');
      
      // Upload to Supabase Storage
      const fileName = `${individualId}/rights-agreements/${Date.now()}_signed_document.pdf`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Save document metadata to database
      const { error: dbError } = await supabase
        .from('individual_documents')
        .insert({
          individual_id: individualId,
          document_type: 'rights_agreement',
          document_name: `Signed Document - ${new Date().toLocaleDateString()}`,
          file_path: fileName,
          file_url: urlData.publicUrl,
          uploaded_by: userProfile.fullname,
          uploaded_at: new Date().toISOString(),
          signatures_count: signatures.length
        });

      if (dbError) throw dbError;

      alert('Document saved successfully!');
      
      // Reset PDF editor
      setPdfFile(null);
      setPdfPages([]);
      setSignatures([]);
      setPdfLoaded(false);
      
      // Reload documents list
      loadSavedDocuments();
      
    } catch (error) {
      console.error('Error saving PDF:', error);
      alert('Error saving document. Please try again.');
    } finally {
      setUploadingPdf(false);
    }
  };

  const loadSavedDocuments = async () => {
    try {
      setLoadingDocuments(true);
      
      const { data, error } = await supabase
        .from('individual_documents')
        .select('*')
        .eq('individual_id', individualId)
        .eq('document_type', 'rights_agreement')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      setSavedDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const deleteDocument = async (docId, filePath) => {
    if (!canManageDocuments) {
      alert('You do not have permission to delete documents.');
      return;
    }

    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('individual-documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('individual_documents')
        .delete()
        .eq('id', docId);

      if (dbError) throw dbError;

      alert('Document deleted successfully!');
      loadSavedDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document. Please try again.');
    }
  };

  const viewDocument = (url) => {
    window.open(url, '_blank');
  };


  // Outcome Management
  const addOutcome = () => {
    if (!canEditPlans) {
      alert('You do not have permission to add outcomes.');
      return;
    }
    const newOutcome = {
      id: Date.now().toString(),
      description: '',
      targetdate: '',
      status: 'In Progress',
      hcbsdomain: '',
      createddate: new Date().toISOString(),
      createdby: userProfile.fullname
    };
    setFormData(prev => ({
      ...prev,
      outcomes: [...prev.outcomes, newOutcome]
    }));
  };

  const updateOutcome = (id, field, value) => {
    if (!canEditPlans) return;
    setFormData(prev => ({
      ...prev,
      outcomes: prev.outcomes.map(outcome => 
        outcome.id === id ? { ...outcome, [field]: value } : outcome
      )
    }));
  };

  const deleteOutcome = (id) => {
    if (!canEditPlans) {
      alert('You do not have permission to delete outcomes.');
      return;
    }
    if (confirm('Are you sure you want to delete this outcome?')) {
      setFormData(prev => ({
        ...prev,
        outcomes: prev.outcomes.filter(outcome => outcome.id !== id)
      }));
    }
  };

  // Goal Management
  const addGoal = () => {
    if (!canEditPlans) {
      alert('You do not have permission to add goals.');
      return;
    }
    const newGoal = {
      id: Date.now().toString(),
      description: '',
      outcomeid: '',
      targetdate: '',
      frequency: 'Daily',
      status: 'Active',
      progress: 0,
      hcbsdomain: '',
      createddate: new Date().toISOString(),
      createdby: userProfile.fullname
    };
    setFormData(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal]
    }));
  };

  const updateGoal = (id, field, value) => {
    if (!canEditPlans) return;
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.map(goal => 
        goal.id === id ? { ...goal, [field]: value } : goal
      )
    }));
  };

  const deleteGoal = (id) => {
    if (!canEditPlans) {
      alert('You do not have permission to delete goals.');
      return;
    }
    if (confirm('Are you sure you want to delete this goal?')) {
      setFormData(prev => ({
        ...prev,
        goals: prev.goals.filter(goal => goal.id !== id)
      }));
    }
  };

  // Risk Plan Management
  const addRiskPlan = () => {
    if (!canManageRisks) {
      alert('You do not have permission to add risk plans.');
      return;
    }
    const newRisk = {
      id: Date.now().toString(),
      risktype: '',
      description: '',
      interventions: '',
      responsiblestaff: '',
      reviewdate: '',
      status: 'Active',
      createddate: new Date().toISOString(),
      createdby: userProfile.fullname
    };
    setFormData(prev => ({
      ...prev,
      riskplans: [...prev.riskplans, newRisk]
    }));
  };

  const updateRiskPlan = (id, field, value) => {
    if (!canManageRisks) return;
    setFormData(prev => ({
      ...prev,
      riskplans: prev.riskplans.map(risk => 
        risk.id === id ? { ...risk, [field]: value } : risk
      )
    }));
  };

  const deleteRiskPlan = (id) => {
    if (!canManageRisks) {
      alert('You do not have permission to delete risk plans.');
      return;
    }
    if (confirm('Are you sure you want to delete this risk plan?')) {
      setFormData(prev => ({
        ...prev,
        riskplans: prev.riskplans.filter(risk => risk.id !== id)
      }));
    }
  };

  // Alert Management
  const addAlert = (type) => {
    if (!canManageAlerts) {
      alert('You do not have permission to add alerts.');
      return;
    }
    const newAlert = {
      id: Date.now().toString(),
      description: '',
      severity: 'Medium',
      dateadded: new Date().toISOString(),
      status: 'Active',
      addedby: userProfile.fullname
    };
    
    if (type === 'medical') {
      setFormData(prev => ({
        ...prev,
        medicalalerts: [...prev.medicalalerts, newAlert]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        behavioralalerts: [...prev.behavioralalerts, newAlert]
      }));
    }
  };

  const updateAlert = (type, id, field, value) => {
    if (!canManageAlerts) return;
    const fieldName = type === 'medical' ? 'medicalalerts' : 'behavioralalerts';
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map(alert => 
        alert.id === id ? { ...alert, [field]: value } : alert
      )
    }));
  };

  const deleteAlert = (type, id) => {
    if (!canManageAlerts) {
      alert('You do not have permission to delete alerts.');
      return;
    }
    if (confirm('Are you sure you want to delete this alert?')) {
      const fieldName = type === 'medical' ? 'medicalalerts' : 'behavioralalerts';
      setFormData(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].filter(alert => alert.id !== id)
      }));
    }
  };

    // ADDED: Show individuals list when no individual is selected
  if (!selectedIndividual) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
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
                  Individual Profiles
                </h1>
                <p className="text-slate-400 mt-1">Select an individual to view their profile</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3 bg-slate-900/50 rounded-xl px-5 py-3 border border-slate-700/50">
            <Search size={20} className="text-emerald-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search individuals by name or ID..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-500"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="p-1 hover:bg-slate-700 rounded"
              >
                <X size={18} className="text-slate-400" />
              </button>
            )}
          </div>

          {/* Individuals Grid */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            {filteredIndividuals.length === 0 ? (
              <div className="text-center py-16">
                <Users className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <h3 className="text-xl font-bold text-slate-400 mb-2">No individuals found</h3>
                <p className="text-slate-500">
                  {searchTerm ? 'Try adjusting your search' : 'No individuals available for your role'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIndividuals.map((individual, idx) => (
                  <div
                    key={individual.id}
                    onClick={() => handleSelectIndividual(individual)}
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
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{individual.homeassignment}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        individual.status === 'Active' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                      }`}>
                        {individual.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }


  // Permission Check - No Access Screen
  if (!profileLoading && !canViewProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
          <p className="text-slate-400 mb-6">
            You do not have permission to view individual profiles. Please contact your administrator if you believe this is an error.
          </p>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-400">Your Current Role:</p>
            <p className="text-lg font-bold text-emerald-400 mt-1">{userProfile?.role_name}</p>
            <p className="text-sm text-slate-500 mt-2">Division: {userProfile?.division}</p>
          </div>
          <button
            onClick={() => router.push('/individual')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!isLoaded || loading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Loading individual profile...</p>
        </div>
      </div>
    );
  }

  if (!selectedIndividual) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-2">Individual not found</p>
          <p className="text-slate-500 text-sm mb-6">This individual may not exist or you may not have permission to view them.</p>
          <button
            onClick={() => router.push('/individual')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all"
          >
            Back to Individuals
          </button>
        </div>
      </div>
    );
  }

const tabs = [
  { id: 'overview', label: 'Overview', icon: User, permission: canViewProfile },
  { id: 'person-centered', label: 'Person-Centered Info', icon: Heart, permission: canViewPlans },
  { id: 'outcomes', label: 'Outcomes & Objectives', icon: Target, permission: canViewPlans },
  { id: 'community-integration', label: 'Community Integration', icon: Users, permission: canViewPlans },
  { id: 'behavior-support', label: 'Behavior Support', icon: Activity, permission: canViewPlans },
  { id: 'health-wellness', label: 'Health & Wellness', icon: Heart, permission: canViewPlans },
  { id: 'lease-residency', label: 'Lease & Residency', icon: HomeIcon, permission: canViewPlans },
  { id: 'complaints-grievances', label: 'Complaints & Grievances', icon: AlertCircle, permission: canManageAlerts || canViewPlans },
  { id: 'corrective-actions', label: 'Corrective Actions', icon: AlertTriangle, permission: canManageRisks || canViewPlans },
  { id: 'staff', label: 'Staff & Training', icon: Users, permission: canViewPlans }, // NEW TAB
  { id: 'rights-agreements', label: 'Rights & Agreements', icon: FileText, permission: canViewPlans },
  { id: 'risks', label: 'Risk Management', icon: Shield, permission: canManageRisks || canViewPlans },
  { id: 'quarterly-reviews', label: 'Quarterly Reviews', icon: Calendar, permission: canViewPlans }
].filter(tab => tab.permission);



  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}


        <div className="flex items-center justify-between">
<div className="flex items-center gap-4">
<button
onClick={() => {
  setSelectedIndividual(null)
}}
className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
>
<ArrowLeft className="text-white" size={20} />
</button>
<div>
<h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500">
{formData.firstname} {formData.lastname}
</h1>
<p className="text-slate-400 mt-1">ID: {formData.individualid}</p>
{!canEditBasicInfo && (
<div className="flex items-center gap-2 mt-2">
<Lock size={14} className="text-slate-500" />
<span className="text-xs text-slate-500">Read-only access</span>
</div>
)}
</div>
</div>
<div className="flex items-center gap-3">
{isEditing ? (
<>
<button
// CHANGE TO:
onClick={() => {
  setIsEditing(false);
  setFormData({ ...selectedIndividual });
}}
className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
>
Cancel
</button>
<button
               onClick={handleSave}
               disabled={saving}
               className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all disabled:opacity-50"
             >
{saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
{saving ? 'Saving...' : 'Save Changes'}
</button>
</>
) : (
canEditBasicInfo && activeTab !== 'rights-agreements' && (
<button
onClick={() => setIsEditing(true)}
className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all"
>
<Edit2 size={18} />
Edit Profile
</button>
)
)}
</div>
</div>
    {/* Quick Stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-emerald-600/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <CheckCircle className="text-emerald-400" size={24} />
          <span className="text-2xl font-bold text-white">{formData.compliance_score || 100}%</span>
        </div>
        <p className="text-slate-300 text-sm font-semibold">Compliance Score</p>
      </div>
      <div className="bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <Target className="text-blue-400" size={24} />
          <span className="text-2xl font-bold text-white">{formData.goals?.length || 0}</span>
        </div>
        <p className="text-slate-300 text-sm font-semibold">Active Goals</p>
      </div>
      <div className="bg-gradient-to-br from-purple-600/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <Award className="text-purple-400" size={24} />
          <span className="text-2xl font-bold text-white">{formData.outcomes?.length || 0}</span>
        </div>
        <p className="text-slate-300 text-sm font-semibold">Outcomes</p>
      </div>
      <div className="bg-gradient-to-br from-orange-600/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <FileText className="text-orange-400" size={24} />
          <span className="text-2xl font-bold text-white">{savedDocuments.length}</span>
        </div>
        <p className="text-slate-300 text-sm font-semibold">Documents</p>
      </div>
    </div>

    {/* Navigation Tabs */}
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-2 flex gap-2 overflow-x-auto">
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
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
      <ScrollArea className="h-[calc(100vh-400px)]">
        <div className="pr-4">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                  <User size={20} />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Individual ID</label>
                    <input
                      type="text"
                      name="individualid"
                      value={formData.individualid}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      name="dateofbirth"
                      value={formData.dateofbirth}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Assignment */}
              <div>
                <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                  <HomeIcon size={20} />
                  Location & Assignment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Home Assignment</label>
                    <input
                      type="text"
                      name="homeassignment"
                      value={formData.homeassignment}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Admission Date</label>
                    <input
                      type="date"
                      name="admissiondate"
                      value={formData.admissiondate}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                    >
                      <option value="Active">Active</option>
                      <option value="Review">Review</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                  <Heart size={20} />
                  Medical Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Primary Diagnosis</label>
                    <input
                      type="text"
                      name="primarydiagnosis"
                      value={formData.primarydiagnosis}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Medicaid Number</label>
                    <input
                      type="text"
                      name="medicaidnumber"
                      value={formData.medicaidnumber}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all font-mono"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Allergies</label>
                    <input
                      type="text"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Guardian Information */}
              <div>
                <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                  <Shield size={20} />
                  Guardian & Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Guardian Name</label>
                    <input
                      type="text"
                      name="guardianname"
                      value={formData.guardianname}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Guardian Phone</label>
                    <input
                      type="tel"
                      name="guardianphone"
                      value={formData.guardianphone}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Guardian Email</label>
                    <input
                      type="email"
                      name="guardianemail"
                      value={formData.guardianemail}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Emergency Contact</label>
                    <input
                      type="text"
                      name="emergencycontact"
                      value={formData.emergencycontact}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  Additional Notes
                </h3>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  disabled={!isEditing || !canEditBasicInfo}
                  rows="4"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Lease & Residency Agreement Tab */}
{activeTab === 'lease-residency' && (
  <div className="space-y-6">
    {!canViewPlans ? (
      <div className="text-center py-16">
        <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-400 mb-2">Access Restricted</h3>
        <p className="text-slate-500">You do not have permission to view lease and residency information.</p>
      </div>
    ) : (
      <>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <HomeIcon size={20} className="text-indigo-400" />
            Lease / Residency Agreement
          </h3>
          
          <div className="bg-amber-600/10 border border-amber-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <Info size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-400 mb-1">HCBS Compliance Required</p>
                <p className="text-sm text-slate-300">
                  Unsigned lease = HCBS violation risk. All residents must have a signed residency agreement with rights explained.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Lease Start Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="lease_start_date"
                  value={formData.lease_start_date}
                  onChange={handleInputChange}
                  disabled={!isEditing || !canEditPlans}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Lease End Date
                </label>
                <input
                  type="date"
                  name="lease_end_date"
                  value={formData.lease_end_date}
                  onChange={handleInputChange}
                  disabled={!isEditing || !canEditPlans}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Rent Amount (if applicable)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400">$</span>
                  <input
                    type="number"
                    name="rent_amount"
                    value={formData.rent_amount}
                    onChange={handleInputChange}
                    disabled={!isEditing || !canEditPlans}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Lease Signature Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="lease_signature_date"
                  value={formData.lease_signature_date}
                  onChange={handleInputChange}
                  disabled={!isEditing || !canEditPlans}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-all"
                />
              </div>
            </div>

            {/* HCBS Rights Checklist */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
              <h4 className="text-md font-semibold text-white mb-4">HCBS Rights Documentation</h4>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <input
                    type="checkbox"
                    name="rights_explained"
                    checked={formData.rights_explained}
                    onChange={(e) => setFormData(prev => ({ ...prev, rights_explained: e.target.checked }))}
                    disabled={!isEditing || !canEditPlans}
                    className="w-5 h-5 text-emerald-600 bg-slate-800 border-slate-600 rounded focus:ring-emerald-500 disabled:opacity-50"
                  />
                  <label className="text-sm text-slate-300 flex-1">
                    <span className="font-semibold text-white">Rights Explained</span>
                    <p className="text-xs text-slate-400 mt-0.5">Individual's rights, privacy, dignity, and autonomy have been explained</p>
                  </label>
                  {formData.rights_explained && (
                    <CheckCircle size={20} className="text-emerald-400" />
                  )}
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <input
                    type="checkbox"
                    name="signed_by_individual"
                    checked={formData.signed_by_individual}
                    onChange={(e) => setFormData(prev => ({ ...prev, signed_by_individual: e.target.checked }))}
                    disabled={!isEditing || !canEditPlans}
                    className="w-5 h-5 text-emerald-600 bg-slate-800 border-slate-600 rounded focus:ring-emerald-500 disabled:opacity-50"
                  />
                  <label className="text-sm text-slate-300 flex-1">
                    <span className="font-semibold text-white">Signed by Individual/Guardian</span>
                    <p className="text-xs text-slate-400 mt-0.5">Individual or legal guardian has signed the agreement</p>
                  </label>
                  {formData.signed_by_individual && (
                    <CheckCircle size={20} className="text-emerald-400" />
                  )}
                </div>
              </div>

              {/* Warning if not compliant */}
              {(!formData.rights_explained || !formData.signed_by_individual || !formData.lease_signature_date) && (
                <div className="mt-4 bg-red-600/10 border border-red-500/30 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-400">HCBS Compliance Warning</p>
                      <p className="text-xs text-slate-300 mt-1">
                        Incomplete lease documentation may result in HCBS violations. Ensure all fields are completed and signed.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    )}
  </div>
)}

{/* Staff Training Requirements Tab */}
{activeTab === 'staff-training' && (
  <div className="space-y-6">
    {!canViewPlans ? (
      <div className="text-center py-16">
        <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-400 mb-2">Access Restricted</h3>
        <p className="text-slate-500">You do not have permission to view staff training requirements.</p>
      </div>
    ) : (
      <>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Award size={20} className="text-yellow-400" />
                Staff Training Requirements
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Required training for staff working with this individual (per ISP Section 10)
              </p>
            </div>
            {isEditing && canEditPlans && (
              <button
                onClick={() => {
                  const newRequirement = {
                    id: Date.now().toString(),
                    training_type: '',
                    required: true,
                    frequency: 'One-Time',
                    notes: '',
                    created_at: new Date().toISOString()
                  };
                  setFormData(prev => ({
                    ...prev,
                    staff_training_requirements: [...(prev.staff_training_requirements || []), newRequirement]
                  }));
                }}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-all"
              >
                <Plus size={16} />
                Add Requirement
              </button>
            )}
          </div>

          {/* Standard Required Trainings (Always Required) */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-slate-300 mb-3">
              Standard Required Training (All Staff)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                'ISP Review & Acknowledgment',
                'HCBS Rights & Dignity Training',
                'Medication Administration (if applicable)',
                'Emergency Procedures & First Aid'
              ].map((training) => (
                <div key={training} className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg">
                  <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{training}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Individual-Specific Requirements */}
          <h4 className="text-sm font-semibold text-slate-300 mb-3">
            Individual-Specific Training Requirements
          </h4>

          {(!formData.staff_training_requirements || formData.staff_training_requirements.length === 0) ? (
            <div className="text-center py-12 bg-slate-900/50 rounded-lg border border-slate-700">
              <Award className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-sm text-slate-400 mb-1">No individual-specific training requirements</p>
              <p className="text-xs text-slate-500">Add specialized training if needed for this individual</p>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.staff_training_requirements.map((req) => (
                <div key={req.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Training Type <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={req.training_type}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            staff_training_requirements: prev.staff_training_requirements.map(r => 
                              r.id === req.id ? { ...r, training_type: e.target.value } : r
                            )
                          }));
                        }}
                        disabled={!isEditing || !canEditPlans}
                        placeholder="e.g., Behavior support strategies, Dietary restrictions training, Seizure protocol"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 disabled:opacity-50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Frequency</label>
                      <select
                        value={req.frequency || 'One-Time'}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            staff_training_requirements: prev.staff_training_requirements.map(r => 
                              r.id === req.id ? { ...r, frequency: e.target.value } : r
                            )
                          }));
                        }}
                        disabled={!isEditing || !canEditPlans}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 disabled:opacity-50 transition-all"
                      >
                        <option value="One-Time">One-Time (upon assignment)</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Annually">Annually</option>
                        <option value="As Needed">As Needed</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={req.required !== false}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            staff_training_requirements: prev.staff_training_requirements.map(r => 
                              r.id === req.id ? { ...r, required: e.target.checked } : r
                            )
                          }));
                        }}
                        disabled={!isEditing || !canEditPlans}
                        className="w-4 h-4 text-yellow-600 bg-slate-800 border-slate-600 rounded focus:ring-yellow-500 disabled:opacity-50"
                      />
                      <label className="text-sm text-slate-300">
                        Required (staff cannot work without this training)
                      </label>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Training Notes / Content Description
                      </label>
                      <textarea
                        value={req.notes}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            staff_training_requirements: prev.staff_training_requirements.map(r => 
                              r.id === req.id ? { ...r, notes: e.target.value } : r
                            )
                          }));
                        }}
                        disabled={!isEditing || !canEditPlans}
                        rows="2"
                        placeholder="Describe what staff need to know (triggers, interventions, protocols, preferences, etc.)"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 disabled:opacity-50 transition-all resize-none"
                      />
                    </div>

                    {isEditing && canEditPlans && (
                      <div className="md:col-span-2">
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this training requirement?')) {
                              setFormData(prev => ({
                                ...prev,
                                staff_training_requirements: prev.staff_training_requirements.filter(r => r.id !== req.id)
                              }));
                            }
                          }}
                          className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm"
                        >
                          <Trash2 size={14} />
                          Delete Requirement
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Information Box */}
          <div className="mt-6 bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-400 mb-1">ISP Compliance Requirement</p>
                <p className="text-xs text-slate-300">
                  All staff working with this individual must complete ISP review and any individual-specific training requirements. 
                  Training records should be maintained in the Staff module.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    )}
  </div>
)}

{/* Staff & Training Tab */}
{activeTab === 'staff' && (
  <div className="space-y-6">
    {!canViewPlans ? (
      <div className="text-center py-16">
        <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-400 mb-2">Access Restricted</h3>
        <p className="text-slate-500">You do not have permission to view staff and training information.</p>
      </div>
    ) : (
      <>
        {/* SECTION 1: Assigned Staff */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Users size={20} className="text-blue-400" />
                Assigned Staff
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Staff members who provide direct support to this individual
              </p>
            </div>
            {isEditing && canEditPlans && (
              <button
                onClick={() => {
                  const newStaff = {
                    id: Date.now().toString(),
                    staff_name: '',
                    staff_id: '',
                    role: '',
                    primary_contact: false,
                    shift_assignment: '1st Shift',
                    contact_phone: '',
                    contact_email: '',
                    start_date: new Date().toISOString().split('T')[0],
                    status: 'Active',
                    training_completed: false,
                    training_completion_date: '',
                    notes: '',
                    created_at: new Date().toISOString()
                  };
                  setFormData(prev => ({
                    ...prev,
                    assigned_staff: [...(prev.assigned_staff || []), newStaff]
                  }));
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
              >
                <Plus size={16} />
                Add Staff
              </button>
            )}
          </div>

          {(!formData.assigned_staff || formData.assigned_staff.length === 0) ? (
            <div className="text-center py-12 bg-slate-900/50 rounded-lg border border-slate-700">
              <Users className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-lg mb-2 text-slate-400">No staff assigned yet</p>
              <p className="text-sm text-slate-500">Add staff members who work with this individual</p>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.assigned_staff.map((staff) => (
                <div 
                  key={staff.id} 
                  className={`bg-slate-900/50 border rounded-lg p-4 ${
                    staff.primary_contact 
                      ? 'border-blue-500/50' 
                      : 'border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        staff.training_completed 
                          ? 'bg-emerald-600/20 border-2 border-emerald-500' 
                          : 'bg-yellow-600/20 border-2 border-yellow-500'
                      }`}>
                        <User size={20} className={staff.training_completed ? 'text-emerald-400' : 'text-yellow-400'} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white">
                            {staff.staff_name || 'Unnamed Staff'}
                          </span>
                          {staff.primary_contact && (
                            <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full font-bold border border-blue-500/30">
                              Primary Contact
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs rounded-full font-bold border ${
                            staff.status === 'Active'
                              ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-600/20 text-slate-400 border-slate-500/30'
                          }`}>
                            {staff.status || 'Active'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                          {staff.role || 'No role specified'} • {staff.shift_assignment || 'No shift assigned'}
                        </p>
                      </div>
                    </div>
                    {isEditing && canEditPlans && (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to remove this staff assignment?')) {
                            setFormData(prev => ({
                              ...prev,
                              assigned_staff: prev.assigned_staff.filter(s => s.id !== staff.id)
                            }));
                          }
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Staff Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={staff.staff_name}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            assigned_staff: prev.assigned_staff.map(s => 
                              s.id === staff.id ? { ...s, staff_name: e.target.value } : s
                            )
                          }));
                        }}
                        disabled={!isEditing || !canEditPlans}
                        placeholder="Full name"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Staff ID / Employee #</label>
                      <input
                        type="text"
                        value={staff.staff_id}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            assigned_staff: prev.assigned_staff.map(s => 
                              s.id === staff.id ? { ...s, staff_id: e.target.value } : s
                            )
                          }));
                        }}
                        disabled={!isEditing || !canEditPlans}
                        placeholder="Employee ID"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Role / Position</label>
                      <select
                        value={staff.role}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            assigned_staff: prev.assigned_staff.map(s => 
                              s.id === staff.id ? { ...s, role: e.target.value } : s
                            )
                          }));
                        }}
                        disabled={!isEditing || !canEditPlans}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                      >
                        <option value="">Select Role</option>
                        <option value="Direct Support Professional (DSP)">Direct Support Professional (DSP)</option>
                        <option value="House Manager">House Manager</option>
                        <option value="QDDP">QDDP</option>
                        <option value="Nurse">Nurse</option>
                        <option value="Behavioral Specialist">Behavioral Specialist</option>
                        <option value="Job Coach">Job Coach</option>
                        <option value="Case Manager">Case Manager</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Shift Assignment</label>
                      <select
                        value={staff.shift_assignment}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            assigned_staff: prev.assigned_staff.map(s => 
                              s.id === staff.id ? { ...s, shift_assignment: e.target.value } : s
                            )
                          }));
                        }}
                        disabled={!isEditing || !canEditPlans}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                      >
                        <option value="1st Shift">1st Shift (Day)</option>
                        <option value="2nd Shift">2nd Shift (Evening)</option>
                        <option value="3rd Shift">3rd Shift (Night)</option>
                        <option value="Awake Overnight">Awake Overnight</option>
                        <option value="Rotating">Rotating</option>
                        <option value="PRN / As Needed">PRN / As Needed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        value={staff.contact_phone}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            assigned_staff: prev.assigned_staff.map(s => 
                              s.id === staff.id ? { ...s, contact_phone: e.target.value } : s
                            )
                          }));
                        }}
                        disabled={!isEditing || !canEditPlans}
                        placeholder="Phone number"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Contact Email</label>
                      <input
                        type="email"
                        value={staff.contact_email}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            assigned_staff: prev.assigned_staff.map(s => 
                              s.id === staff.id ? { ...s, contact_email: e.target.value } : s
                            )
                          }));
                        }}
                        disabled={!isEditing || !canEditPlans}
                        placeholder="Email address"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={staff.start_date}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            assigned_staff: prev.assigned_staff.map(s => 
                              s.id === staff.id ? { ...s, start_date: e.target.value } : s
                            )
                          }));
                        }}
                        disabled={!isEditing || !canEditPlans}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                      <select
                        value={staff.status}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            assigned_staff: prev.assigned_staff.map(s => 
                              s.id === staff.id ? { ...s, status: e.target.value } : s
                            )
                          }));
                        }}
                        disabled={!isEditing || !canEditPlans}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                      >
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-400 mb-1">Notes</label>
                      <textarea
                        value={staff.notes}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            assigned_staff: prev.assigned_staff.map(s => 
                              s.id === staff.id ? { ...s, notes: e.target.value } : s
                            )
                          }));
                        }}
                        disabled={!isEditing || !canEditPlans}
                        rows="2"
                        placeholder="Special notes, schedule preferences, expertise, etc."
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all resize-none"
                      />
                    </div>

                    {/* Training Status */}
                    <div className="md:col-span-2 pt-3 border-t border-slate-700">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={staff.primary_contact}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                assigned_staff: prev.assigned_staff.map(s => 
                                  s.id === staff.id ? { ...s, primary_contact: e.target.checked } : s
                                )
                              }));
                            }}
                            disabled={!isEditing || !canEditPlans}
                            className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500 disabled:opacity-50"
                          />
                          <label className="text-sm text-slate-300">Primary Contact for this Individual</label>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={staff.training_completed}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                assigned_staff: prev.assigned_staff.map(s => 
                                  s.id === staff.id ? { 
                                    ...s, 
                                    training_completed: e.target.checked,
                                    training_completion_date: e.target.checked ? new Date().toISOString().split('T')[0] : ''
                                  } : s
                                )
                              }));
                            }}
                            disabled={!isEditing || !canEditPlans}
                            className="w-4 h-4 text-emerald-600 bg-slate-800 border-slate-600 rounded focus:ring-emerald-500 disabled:opacity-50"
                          />
                          <label className="text-sm text-slate-300">ISP Training Completed</label>
                          {staff.training_completed && staff.training_completion_date && (
                            <span className="text-xs text-slate-500">
                              ({new Date(staff.training_completion_date).toLocaleDateString()})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Training Alert */}
                  {!staff.training_completed && (
                    <div className="mt-4 bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-yellow-400">Training Required</p>
                          <p className="text-xs text-slate-300 mt-1">
                            This staff member must complete ISP review and all required training before providing direct support.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Staff Summary */}
          {formData.assigned_staff?.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Users size={20} className="text-blue-400" />
                  <span className="text-2xl font-bold text-white">
                    {formData.assigned_staff.filter(s => s.status === 'Active').length}
                  </span>
                </div>
                <p className="text-sm text-slate-300 font-semibold">Active Staff</p>
              </div>
              <div className="bg-emerald-600/10 border border-emerald-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle size={20} className="text-emerald-400" />
                  <span className="text-2xl font-bold text-white">
                    {formData.assigned_staff.filter(s => s.training_completed).length}
                  </span>
                </div>
                <p className="text-sm text-slate-300 font-semibold">Training Complete</p>
              </div>
              <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle size={20} className="text-yellow-400" />
                  <span className="text-2xl font-bold text-white">
                    {formData.assigned_staff.filter(s => !s.training_completed && s.status === 'Active').length}
                  </span>
                </div>
                <p className="text-sm text-slate-300 font-semibold">Training Pending</p>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: Staff Training Requirements */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Award size={20} className="text-yellow-400" />
                Staff Training Requirements
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Required training for ALL staff working with this individual (per ISP Section 10)
              </p>
            </div>
            {isEditing && canEditPlans && (
              <button
                onClick={() => {
                  const newRequirement = {
                    id: Date.now().toString(),
                    training_type: '',
                    required: true,
                    frequency: 'One-Time',
                    notes: '',
                    created_at: new Date().toISOString()
                  };
                  setFormData(prev => ({
                    ...prev,
                    staff_training_requirements: [...(prev.staff_training_requirements || []), newRequirement]
                  }));
                }}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-all"
              >
                <Plus size={16} />
                Add Requirement
              </button>
            )}
          </div>

          {/* Standard Required Trainings (Always Required) */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-slate-300 mb-3">
              Standard Required Training (All Staff)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                'ISP Review & Acknowledgment',
                'HCBS Rights & Dignity Training',
                'Medication Administration (if applicable)',
                'Emergency Procedures & First Aid'
              ].map((training) => (
                <div key={training} className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg">
                  <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{training}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Individual-Specific Requirements */}
          <h4 className="text-sm font-semibold text-slate-300 mb-3">
            Individual-Specific Training Requirements
          </h4>

          {(!formData.staff_training_requirements || formData.staff_training_requirements.length === 0) ? (
            <div className="text-center py-12 bg-slate-900/50 rounded-lg border border-slate-700">
              <Award className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-sm text-slate-400 mb-1">No individual-specific training requirements</p>
              <p className="text-xs text-slate-500">Add specialized training if needed for this individual</p>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.staff_training_requirements.map((req) => (
                <div key={req.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Training Type <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={req.training_type}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            staff_training_requirements: prev.staff_training_requirements.map(r => 
                              r.id === req.id ? { ...r, training_type: e.target.value } : r
                            )
                          }));
                        }}
                        disabled={!isEditing || !canEditPlans}
                        placeholder="e.g., Behavior support strategies, Dietary restrictions training, Seizure protocol"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 disabled:opacity-50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Frequency</label>
                      <select
                        value={req.frequency || 'One-Time'}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            staff_training_requirements: prev.staff_training_requirements.map(r => 
                              r.id === req.id ? { ...r, frequency: e.target.value } : r
                            )
                          }));
                        }}
                        disabled={!isEditing || !canEditPlans}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 disabled:opacity-50 transition-all"
                      >
                        <option value="One-Time">One-Time (upon assignment)</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Annually">Annually</option>
                        <option value="As Needed">As Needed</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={req.required !== false}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            staff_training_requirements: prev.staff_training_requirements.map(r => 
                              r.id === req.id ? { ...r, required: e.target.checked } : r
                            )
                          }));
                        }}
                        disabled={!isEditing || !canEditPlans}
                        className="w-4 h-4 text-yellow-600 bg-slate-800 border-slate-600 rounded focus:ring-yellow-500 disabled:opacity-50"
                      />
                      <label className="text-sm text-slate-300">
                        Required (staff cannot work without this training)
                      </label>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Training Notes / Content Description
                      </label>
                      <textarea
                        value={req.notes}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            staff_training_requirements: prev.staff_training_requirements.map(r => 
                              r.id === req.id ? { ...r, notes: e.target.value } : r
                            )
                          }));
                        }}
                        disabled={!isEditing || !canEditPlans}
                        rows="2"
                        placeholder="Describe what staff need to know (triggers, interventions, protocols, preferences, etc.)"
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500 disabled:opacity-50 transition-all resize-none"
                      />
                    </div>

                    {isEditing && canEditPlans && (
                      <div className="md:col-span-2">
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this training requirement?')) {
                              setFormData(prev => ({
                                ...prev,
                                staff_training_requirements: prev.staff_training_requirements.filter(r => r.id !== req.id)
                              }));
                            }
                          }}
                          className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm"
                        >
                          <Trash2 size={14} />
Delete Requirement
</button>
</div>
)}
</div>

</div>
))}
</div>
)}
{/* Information Box */}
      <div className="mt-6 bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Info size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-400 mb-1">ISP Compliance Requirement</p>
            <p className="text-xs text-slate-300">
              All staff working with this individual must complete ISP review and any individual-specific training requirements. 
              Training records should be maintained in the Staff module and verified before assignment.
            </p>
          </div>
        </div>
      </div>
    </div>
  </>
)}
</div>
)}



{/* Complaints & Grievances Tab */}
{activeTab === 'complaints-grievances' && (
  <div className="space-y-6">
    {!canManageAlerts && !canViewPlans ? (
      <div className="text-center py-16">
        <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-400 mb-2">Access Restricted</h3>
        <p className="text-slate-500">You do not have permission to view complaints and grievances.</p>
      </div>
    ) : (
      <>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertCircle size={20} className="text-orange-400" />
                Complaint & Grievance Log
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Document and track all complaints and grievances for rights & autonomy compliance
              </p>
            </div>
            {isEditing && canManageAlerts && (
              <button
                onClick={() => {
                  const newComplaint = {
                    id: Date.now().toString(),
                    complaint_id: `CMP-${Date.now()}`,
                    date_filed: new Date().toISOString().split('T')[0],
                    complaint_type: '',
                    description: '',
                    report_method: 'Verbal',
                    resolution_status: 'Open',
                    resolution_date: '',
                    resolution_summary: '',
                    filed_by: userProfile.fullname,
                    created_at: new Date().toISOString()
                  };
                  setFormData(prev => ({
                    ...prev,
                    complaints: [...(prev.complaints || []), newComplaint]
                  }));
                }}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-all"
              >
                <Plus size={16} />
                Add Complaint
              </button>
            )}
          </div>

          {(!formData.complaints || formData.complaints.length === 0) ? (
            <div className="text-center py-12 text-slate-400">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-lg mb-2">No complaints or grievances filed</p>
              <p className="text-sm text-slate-500">All complaints should be documented for compliance tracking</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.complaints.map((complaint) => (
                <div 
                  key={complaint.id} 
                  className={`bg-slate-900/50 border rounded-lg p-4 ${
                    complaint.resolution_status === 'Open' 
                      ? 'border-orange-500/50' 
                      : 'border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-xs font-mono text-slate-400">{complaint.complaint_id}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          complaint.resolution_status === 'Open'
                            ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30'
                            : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {complaint.resolution_status}
                        </span>
                      </div>
                    </div>
                    {isEditing && canManageAlerts && (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this complaint record?')) {
                            setFormData(prev => ({
                              ...prev,
                              complaints: prev.complaints.filter(c => c.id !== complaint.id)
                            }));
                          }
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Date Filed</label>
                      <input
                        type="date"
                        value={complaint.date_filed}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            complaints: prev.complaints.map(c => 
                              c.id === complaint.id ? { ...c, date_filed: e.target.value } : c
                            )
                          }));
                        }}
                        disabled={!isEditing || !canManageAlerts}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500 disabled:opacity-50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Complaint Type</label>
                      <select
                        value={complaint.complaint_type}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            complaints: prev.complaints.map(c => 
                              c.id === complaint.id ? { ...c, complaint_type: e.target.value } : c
                            )
                          }));
                        }}
                        disabled={!isEditing || !canManageAlerts}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500 disabled:opacity-50 transition-all"
                      >
                        <option value="">Select Type</option>
                        <option value="Rights Violation">Rights Violation</option>
                        <option value="Service Quality">Service Quality</option>
                        <option value="Staff Conduct">Staff Conduct</option>
                        <option value="Safety Concern">Safety Concern</option>
                        <option value="Financial">Financial</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                      <textarea
                        value={complaint.description}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            complaints: prev.complaints.map(c => 
                              c.id === complaint.id ? { ...c, description: e.target.value } : c
                            )
                          }));
                        }}
                        disabled={!isEditing || !canManageAlerts}
                        rows="3"
                        placeholder="Detailed description of the complaint..."
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500 disabled:opacity-50 transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Report Method</label>
                      <select
                        value={complaint.report_method}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            complaints: prev.complaints.map(c => 
                              c.id === complaint.id ? { ...c, report_method: e.target.value } : c
                            )
                          }));
                        }}
                        disabled={!isEditing || !canManageAlerts}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500 disabled:opacity-50 transition-all"
                      >
                        <option value="Verbal">Verbal</option>
                        <option value="Written">Written</option>
                        <option value="Email">Email</option>
                        <option value="Phone">Phone</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Resolution Status</label>
                      <select
                        value={complaint.resolution_status}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            complaints: prev.complaints.map(c => 
                              c.id === complaint.id ? { ...c, resolution_status: e.target.value } : c
                            )
                          }));
                        }}
                        disabled={!isEditing || !canManageAlerts}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500 disabled:opacity-50 transition-all"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    {complaint.resolution_status === 'Closed' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Resolution Date</label>
                          <input
                            type="date"
                            value={complaint.resolution_date}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                complaints: prev.complaints.map(c => 
                                  c.id === complaint.id ? { ...c, resolution_date: e.target.value } : c
                                )
                              }));
                            }}
                            disabled={!isEditing || !canManageAlerts}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500 disabled:opacity-50 transition-all"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-400 mb-1">Resolution Summary</label>
                          <textarea
                            value={complaint.resolution_summary}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                complaints: prev.complaints.map(c => 
                                  c.id === complaint.id ? { ...c, resolution_summary: e.target.value } : c
                                )
                              }));
                            }}
                            disabled={!isEditing || !canManageAlerts}
                            rows="2"
                            placeholder="How was this complaint resolved?"
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500 disabled:opacity-50 transition-all resize-none"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Open Complaints Alert */}
          {formData.complaints?.filter(c => c.resolution_status === 'Open').length > 0 && (
            <div className="mt-4 bg-orange-600/10 border border-orange-500/30 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle size={18} className="text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-orange-400">
                    {formData.complaints.filter(c => c.resolution_status === 'Open').length} Open Complaint(s)
                  </p>
                  <p className="text-xs text-slate-300 mt-1">
                    Open complaints surface in autonomy reports and may require immediate attention.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    )}
  </div>
)}

{/* Corrective Action Plans Tab */}
{activeTab === 'corrective-actions' && (
  <div className="space-y-6">
    {!canManageRisks && !canViewPlans ? (
      <div className="text-center py-16">
        <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-400 mb-2">Access Restricted</h3>
        <p className="text-slate-500">You do not have permission to view corrective action plans.</p>
      </div>
    ) : (
      <>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-400" />
                Corrective Action Plans (CAP)
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Document corrective actions for incidents, trends, or audit findings
              </p>
            </div>
            {isEditing && canManageRisks && (
              <button
                onClick={() => {
                  const newCAP = {
                    id: Date.now().toString(),
                    cap_id: `CAP-${Date.now()}`,
                    trigger_event: '',
                    trigger_type: 'Incident',
                    root_cause: '',
                    corrective_actions: '',
                    responsible_staff: '',
                    due_date: '',
                    status: 'Open',
                    effectiveness_review_date: '',
                    effectiveness_notes: '',
                    created_by: userProfile.fullname,
                    created_at: new Date().toISOString()
                  };
                  setFormData(prev => ({
                    ...prev,
                    corrective_action_plans: [...(prev.corrective_action_plans || []), newCAP]
                  }));
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
              >
                <Plus size={16} />
                Add CAP
              </button>
            )}
          </div>

          {(!formData.corrective_action_plans || formData.corrective_action_plans.length === 0) ? (
            <div className="text-center py-12 text-slate-400">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-lg mb-2">No corrective action plans</p>
              <p className="text-sm text-slate-500">CAPs are required for repeat issues and serious incidents</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.corrective_action_plans.map((cap) => (
                <div 
                  key={cap.id} 
                  className={`bg-slate-900/50 border rounded-lg p-5 ${
                    cap.status === 'Open' || cap.status === 'In Progress'
                      ? 'border-red-500/50' 
                      : 'border-emerald-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-xs font-mono text-slate-400">{cap.cap_id}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          cap.status === 'Open'
                            ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                            : cap.status === 'In Progress'
                            ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {cap.status}
                        </span>
                      </div>
                    </div>
                    {isEditing && canManageRisks && (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this CAP?')) {
                            setFormData(prev => ({
                              ...prev,
                              corrective_action_plans: prev.corrective_action_plans.filter(c => c.id !== cap.id)
                            }));
                          }
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Trigger Event */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Trigger Type</label>
                        <select
                          value={cap.trigger_type}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              corrective_action_plans: prev.corrective_action_plans.map(c => 
                                c.id === cap.id ? { ...c, trigger_type: e.target.value } : c
                              )
                            }));
                          }}
                          disabled={!isEditing || !canManageRisks}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500 disabled:opacity-50 transition-all"
                        >
                          <option value="Incident">Incident</option>
                          <option value="Audit Finding">Audit Finding</option>
                          <option value="Trend Report">Trend Report</option>
                          <option value="Complaint">Complaint</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Trigger Event/ID</label>
                        <input
                          type="text"
                          value={cap.trigger_event}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              corrective_action_plans: prev.corrective_action_plans.map(c => 
                                c.id === cap.id ? { ...c, trigger_event:e.target.value } : c
)
}));
}}
disabled={!isEditing || !canManageRisks}
placeholder="e.g., INC-12345, Audit 2025-Q1"
className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500 disabled:opacity-50 transition-all"
/>
</div>
</div>
{/* Root Cause Analysis */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Root Cause Analysis <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={cap.root_cause}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        corrective_action_plans: prev.corrective_action_plans.map(c => 
                          c.id === cap.id ? { ...c, root_cause: e.target.value } : c
                        )
                      }));
                    }}
                    disabled={!isEditing || !canManageRisks}
                    rows="3"
                    placeholder="Why did this happen? (training gap, staffing shortage, process failure, communication issue, etc.)"
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500 disabled:opacity-50 transition-all resize-none"
                  />
                </div>

                {/* Corrective Actions */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Corrective Action Steps <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={cap.corrective_actions}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        corrective_action_plans: prev.corrective_action_plans.map(c => 
                          c.id === cap.id ? { ...c, corrective_actions: e.target.value } : c
                        )
                      }));
                    }}
                    disabled={!isEditing || !canManageRisks}
                    rows="4"
                    placeholder="What specific actions will be taken? (retraining staff, updating procedures, changing schedules, adding oversight)"
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500 disabled:opacity-50 transition-all resize-none"
                  />
                </div>

                {/* Responsibility & Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Responsible Staff</label>
                    <input
                      type="text"
                      value={cap.responsible_staff}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          corrective_action_plans: prev.corrective_action_plans.map(c => 
                            c.id === cap.id ? { ...c, responsible_staff: e.target.value } : c
                          )
                        }));
                      }}
                      disabled={!isEditing || !canManageRisks}
                      placeholder="Name and role"
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500 disabled:opacity-50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={cap.due_date}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          corrective_action_plans: prev.corrective_action_plans.map(c => 
                            c.id === cap.id ? { ...c, due_date: e.target.value } : c
                          )
                        }));
                      }}
                      disabled={!isEditing || !canManageRisks}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500 disabled:opacity-50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                    <select
                      value={cap.status}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          corrective_action_plans: prev.corrective_action_plans.map(c => 
                            c.id === cap.id ? { ...c, status: e.target.value } : c
                          )
                        }));
                      }}
                      disabled={!isEditing || !canManageRisks}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500 disabled:opacity-50 transition-all"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Effectiveness Review (if completed) */}
                {cap.status === 'Completed' && (
                  <div className="pt-4 border-t border-slate-700">
                    <h5 className="text-sm font-semibold text-emerald-400 mb-3">Effectiveness Review</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Review Date</label>
                        <input
                          type="date"
                          value={cap.effectiveness_review_date}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              corrective_action_plans: prev.corrective_action_plans.map(c => 
                                c.id === cap.id ? { ...c, effectiveness_review_date: e.target.value } : c
                              )
                            }));
                          }}
                          disabled={!isEditing || !canManageRisks}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-400 mb-1">Effectiveness Notes</label>
                        <textarea
                          value={cap.effectiveness_notes}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              corrective_action_plans: prev.corrective_action_plans.map(c => 
                                c.id === cap.id ? { ...c, effectiveness_notes: e.target.value } : c
                              )
                            }));
                          }}
                          disabled={!isEditing || !canManageRisks}
                          rows="2"
                          placeholder="Was the CAP effective? Any repeat issues?"
                          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active CAPs Alert */}
      {formData.corrective_action_plans?.filter(c => c.status === 'Open' || c.status === 'In Progress').length > 0 && (
        <div className="mt-4 bg-red-600/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-400">
                {formData.corrective_action_plans.filter(c => c.status === 'Open' || c.status === 'In Progress').length} Active CAP(s)
              </p>
              <p className="text-xs text-slate-300 mt-1">
                Corrective actions must be completed and reviewed for effectiveness.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  </>
)}
</div>
)}

          {/* Person-Centered Information Tab */}
{activeTab === 'person-centered' && (
  <div className="space-y-6">
    {!canViewPlans ? (
      <div className="text-center py-16">
        <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-400 mb-2">Access Restricted</h3>
        <p className="text-slate-500">You do not have permission to view person-centered information.</p>
      </div>
    ) : (
      <>
        {/* What Is Important TO */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
            <Heart size={20} />
            What Is Important TO {formData.firstname}
          </h3>
          <p className="text-sm text-slate-400 mb-3">
            In the individual's own words - their preferences, desires, and what matters most to them
          </p>
          <textarea
            name="important_to"
            value={formData.important_to}
            onChange={handleInputChange}
            disabled={!isEditing || !canEditPlans}
            rows="5"
            placeholder="What does this individual want? What are their preferences and desires?"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all resize-none"
          />
        </div>

        {/* What Is Important FOR */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
            <Shield size={20} />
            What Is Important FOR {formData.firstname}
          </h3>
          <p className="text-sm text-slate-400 mb-3">
            Health, safety, and support needs from a clinical/support perspective
          </p>
          <textarea
            name="important_for"
            value={formData.important_for}
            onChange={handleInputChange}
            disabled={!isEditing || !canEditPlans}
            rows="5"
            placeholder="What does this individual need for health, safety, and well-being?"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all resize-none"
          />
        </div>

        {/* Strengths, Interests, and Skills */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
            <Award size={20} />
            Strengths, Interests, and Skills
          </h3>
          <p className="text-sm text-slate-400 mb-3">
            Positive attributes, talents, and capabilities
          </p>
          <textarea
            name="strengths_interests"
            value={formData.strengths_interests}
            onChange={handleInputChange}
            disabled={!isEditing || !canEditPlans}
            rows="5"
            placeholder="What are this individual's strengths, interests, and skills?"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all resize-none"
          />
        </div>
      </>
    )}
  </div>
)}

{/* Community Integration Tab */}
{activeTab === 'community-integration' && (
  <div className="space-y-6">
    {!canViewPlans ? (
      <div className="text-center py-16">
        <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-400 mb-2">Access Restricted</h3>
        <p className="text-slate-500">You do not have permission to view community integration plans.</p>
      </div>
    ) : (
      <>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users size={20} className="text-indigo-400" />
            Community Integration Plan
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Community Activities & Participation
              </label>
              <textarea
                name="community_activities"
                value={formData.community_activities}
                onChange={handleInputChange}
                disabled={!isEditing || !canEditPlans}
                rows="4"
                placeholder="Describe community outings, activities, and participation (parks, restaurants, stores, etc.)"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Transportation Method
              </label>
              <input
                type="text"
                name="transportation_method"
                value={formData.transportation_method}
                onChange={handleInputChange}
                disabled={!isEditing || !canEditPlans}
                placeholder="e.g., Staff transportation, public transit, family"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Barriers & Mitigation Strategies
              </label>
              <textarea
                name="community_barriers"
                value={formData.community_barriers}
                onChange={handleInputChange}
                disabled={!isEditing || !canEditPlans}
                rows="4"
                placeholder="Identify barriers (anxiety, overstimulation, etc.) and strategies to address them"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-all resize-none"
              />
            </div>
          </div>
        </div>
      </>
    )}
  </div>
)}

{/* Behavior Support Tab */}
{activeTab === 'behavior-support' && (
  <div className="space-y-6">
    {!canViewPlans ? (
      <div className="text-center py-16">
        <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-400 mb-2">Access Restricted</h3>
        <p className="text-slate-500">You do not have permission to view behavior support information.</p>
      </div>
    ) : (
      <>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity size={20} className="text-yellow-400" />
            Behavior Support Summary
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Behavior Description
              </label>
              <textarea
                name="behavior_summary"
                value={formData.behavior_summary}
                onChange={handleInputChange}
                disabled={!isEditing || !canEditPlans}
                rows="4"
                placeholder="Describe behaviors, triggers, and patterns (e.g., anxiety-based behaviors, pacing, verbal protest)"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 disabled:opacity-50 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Support Strategies & Interventions
              </label>
              <textarea
                name="behavior_strategies"
                value={formData.behavior_strategies}
                onChange={handleInputChange}
                disabled={!isEditing || !canEditPlans}
                rows="4"
                placeholder="Describe coping strategies, interventions, and staff response procedures"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 disabled:opacity-50 transition-all resize-none"
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <input
                type="checkbox"
                name="abc_data_required"
                checked={formData.abc_data_required}
                onChange={(e) => setFormData(prev => ({ ...prev, abc_data_required: e.target.checked }))}
                disabled={!isEditing || !canEditPlans}
                className="w-5 h-5 text-yellow-600 bg-slate-800 border-slate-600 rounded focus:ring-yellow-500 disabled:opacity-50"
              />
              <label className="text-sm text-slate-300">
                ABC Data Collection Required (Antecedent-Behavior-Consequence)
              </label>
            </div>
          </div>
        </div>
      </>
    )}
  </div>
)}

{/* Health & Wellness Tab */}
{activeTab === 'health-wellness' && (
  <div className="space-y-6">
    {!canViewPlans ? (
      <div className="text-center py-16">
        <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-400 mb-2">Access Restricted</h3>
        <p className="text-slate-500">You do not have permission to view health and wellness information.</p>
      </div>
    ) : (
      <>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Heart size={20} className="text-red-400" />
            Health & Wellness Summary
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Health Summary
              </label>
              <textarea
                name="health_summary"
                value={formData.health_summary}
                onChange={handleInputChange}
                disabled={!isEditing || !canEditPlans}
                rows="4"
                placeholder="Overall health status, medications, and wellness notes"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 disabled:opacity-50 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Seizure History
              </label>
              <input
                type="text"
                name="seizure_history"
                value={formData.seizure_history}
                onChange={handleInputChange}
                disabled={!isEditing || !canEditPlans}
                placeholder="e.g., No seizure history, or describe seizure type and frequency"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 disabled:opacity-50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Medication Monitoring Notes
              </label>
              <textarea
                name="medication_monitoring_notes"
                value={formData.medication_monitoring_notes}
                onChange={handleInputChange}
                disabled={!isEditing || !canEditPlans}
                rows="4"
                placeholder="Medication monitoring requirements, side effects to watch for, reporting procedures"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 disabled:opacity-50 transition-all resize-none"
              />
            </div>
          </div>
        </div>
      </>
    )}
  </div>
)}


{/* Quarterly Reviews Tab */}
{activeTab === 'quarterly-reviews' && (
  <div className="space-y-6">
    {!canViewPlans ? (
      <div className="text-center py-16">
        <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-400 mb-2">Access Restricted</h3>
        <p className="text-slate-500">You do not have permission to view quarterly reviews.</p>
      </div>
    ) : (
      <>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar size={20} className="text-cyan-400" />
              Quarterly Review Summary
            </h3>
            {isEditing && canEditPlans && (
              <button
                onClick={() => {
                  const newReview = {
                    id: Date.now().toString(),
                    quarter: '',
                    review_date: new Date().toISOString().split('T')[0],
                    reviewed_by: userProfile.fullname,
                    progress_summary: '',
                    revisions_needed: '',
                    created_at: new Date().toISOString()
                  };
                  setFormData(prev => ({
                    ...prev,
                    quarterly_reviews: [...(prev.quarterly_reviews || []), newReview]
                  }));
                }}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-all"
              >
                <Plus size={16} />
                Add Review
              </button>
            )}
          </div>

          {(!formData.quarterly_reviews || formData.quarterly_reviews.length === 0) ? (
            <div className="text-center py-12 text-slate-400">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-lg mb-2">No quarterly reviews yet</p>
              <p className="text-sm text-slate-500">Reviews should be conducted every 3 months</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.quarterly_reviews.map((review) => (
                <div key={review.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Quarter</label>
                      <select
                        value={review.quarter}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            quarterly_reviews: prev.quarterly_reviews.map(r => 
                              r.id === review.id ? { ...r, quarter: e.target.value } : r
                            )
                          }));
                        }}
                        disabled={!isEditing || !canEditPlans}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50 transition-all"
                      >
                        <option value="">Select Quarter</option>
                        <option value="Q1 2025">Q1 2025</option>
                        <option value="Q2 2025">Q2 2025</option>
                        <option value="Q3 2025">Q3 2025</option>
                        <option value="Q4 2025">Q4 2025</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Review Date</label>
                      <input
                        type="date"
                        value={review.review_date}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            quarterly_reviews: prev.quarterly_reviews.map(r => 
                              r.id === review.id ? { ...r, review_date: e.target.value } : r
                            )
                          }));
                        }}
                        disabled={!isEditing || !canEditPlans}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Reviewed By</label>
                      <input
                        type="text"
                        value={review.reviewed_by}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            quarterly_reviews: prev.quarterly_reviews.map(r => 
                              r.id === review.id ? { ...r, reviewed_by: e.target.value } : r
                            )
                          }));
                        }}
                        disabled={!isEditing || !canEditPlans}
                        placeholder="QDDP Name"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50 transition-all"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-400 mb-2">Summary of Progress</label>
                      <textarea
                        value={review.progress_summary}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            quarterly_reviews: prev.quarterly_reviews.map(r => 
                              r.id === review.id ? { ...r, progress_summary: e.target.value } : r
                            )
                          }));
                        }}
                        disabled={!isEditing || !canEditPlans}
                        rows="4"
                        placeholder="Summarize progress on outcomes, goals, and overall ISP implementation"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50 transition-all resize-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-400 mb-2">Revisions Needed</label>
                      <textarea
                        value={review.revisions_needed}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            quarterly_reviews: prev.quarterly_reviews.map(r => 
                              r.id === review.id ? { ...r, revisions_needed: e.target.value } : r
                            )
                          }));
                        }}
                        disabled={!isEditing || !canEditPlans}
                        rows="3"
                        placeholder="Note any needed revisions to the ISP"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50 transition-all resize-none"
                      />
                    </div>

                    {isEditing && canEditPlans && (
                      <div className="md:col-span-2">
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this quarterly review?')) {
                              setFormData(prev => ({
                                ...prev,
                                quarterly_reviews: prev.quarterly_reviews.filter(r => r.id !== review.id)
                              }));
                            }
                          }}
                          className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-semibold transition-all flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          Delete Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    )}
  </div>
)}


{/* Outcomes & Objectives Tab */}
{activeTab === 'outcomes' && (
  <div className="space-y-6">
    {!canViewPlans ? (
      <div className="text-center py-16">
        <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-400 mb-2">Access Restricted</h3>
        <p className="text-slate-500">You do not have permission to view outcomes.</p>
      </div>
    ) : (
      <>
        {/* Outcomes Section */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Award className="text-purple-400" size={24} />
                Outcomes & Objectives
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                Outcomes are broad, person-centered goals in the individual's own words. Objectives are specific, measurable steps to achieve outcomes.
              </p>
            </div>
            {isEditing && canEditPlans && (
              <button
                onClick={addOutcome}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
              >
                <Plus size={16} />
                Add Outcome
              </button>
            )}
          </div>

          {formData.outcomes?.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Award className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p>No outcomes defined yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.outcomes?.map((outcome, outcomeIndex) => (
                <div key={outcome.id} className="bg-slate-900/50 border-2 border-purple-500/30 rounded-xl p-6">
                  {/* Outcome Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-purple-400 mb-2">
                        Outcome #{outcomeIndex + 1}
                      </h4>
                    </div>
                    {isEditing && canEditPlans && (
                      <button
                        onClick={() => deleteOutcome(outcome.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  {/* Outcome Statement */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Outcome Statement (In Individual's Words)
                    </label>
                    <textarea
                      value={outcome.description}
                      onChange={(e) => updateOutcome(outcome.id, 'description', e.target.value)}
                      disabled={!isEditing || !canEditPlans}
                      rows="2"
                      placeholder='"I want to..."'
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all resize-none"
                    />
                  </div>

                  {/* Why Important & HCBS Alignment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Why This Outcome Is Important
                      </label>
                      <textarea
                        value={outcome.why_important || ''}
                        onChange={(e) => updateOutcome(outcome.id, 'why_important', e.target.value)}
                        disabled={!isEditing || !canEditPlans}
                        rows="3"
                        placeholder="Explain why this outcome matters to the individual"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        HCBS Domain
                      </label>
                      <select
                        value={outcome.hcbsdomain}
                        onChange={(e) => updateOutcome(outcome.id, 'hcbsdomain', e.target.value)}
                        disabled={!isEditing || !canEditPlans}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all mb-3"
                      >
                        <option value="">Select Domain</option>
                        <option value="Autonomy">Autonomy</option>
                        <option value="Independence">Independence</option>
                        <option value="Privacy & Dignity">Privacy & Dignity</option>
                        <option value="Informed Choice">Informed Choice</option>
                        <option value="Community Integration">Community Integration</option>
                        <option value="Choice">Choice</option>
                        <option value="Social Relationships">Social Relationships</option>
                        <option value="Self-Determination">Self-Determination</option>
                        <option value="Health & Wellness">Health & Wellness</option>
                        <option value="Safety">Safety</option>
                      </select>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Target Date</label>
                          <input
                            type="date"
                            value={outcome.targetdate}
onChange={(e) => updateOutcome(outcome.id, 'targetdate', e.target.value)}
disabled={!isEditing || !canEditPlans}
className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all"
/>
</div>
<div>
<label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
<select
value={outcome.status}
onChange={(e) => updateOutcome(outcome.id, 'status', e.target.value)}
disabled={!isEditing || !canEditPlans}
className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all"
>
<option value="In Progress">In Progress</option>
<option value="Achieved">Achieved</option>
<option value="On Hold">On Hold</option>
<option value="Discontinued">Discontinued</option>
</select>
</div>
</div>
</div>
</div>
{/* Objectives Section */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-md font-bold text-blue-400">Objectives</h5>
                  {isEditing && canEditPlans && (
                    <button
                      onClick={() => {
                        const newObjective = {
                          id: Date.now().toString(),
                          description: '',
                          teaching_strategies: '',
                          data_collection: '',
                          mastery_criteria: '',
                          status: 'Active'
                        };
                        updateOutcome(outcome.id, 'objectives', [...(outcome.objectives || []), newObjective]);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all"
                    >
                      <Plus size={14} />
                      Add Objective
                    </button>
                  )}
                </div>

                {(!outcome.objectives || outcome.objectives.length === 0) ? (
                  <div className="text-center py-6 bg-slate-800/50 rounded-lg">
                    <Target className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                    <p className="text-sm text-slate-500">No objectives defined for this outcome</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {outcome.objectives.map((objective, objIndex) => (
                      <div key={objective.id} className="bg-slate-800/50 border border-blue-500/30 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-sm font-semibold text-blue-400">Objective {objIndex + 1}</span>
                          {isEditing && canEditPlans && (
                            <button
                              onClick={() => {
                                updateOutcome(
                                  outcome.id,
                                  'objectives',
                                  outcome.objectives.filter(obj => obj.id !== objective.id)
                                );
                              }}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">
                              Objective Description (Measurable)
                            </label>
                            <textarea
                              value={objective.description}
                              onChange={(e) => {
                                const updatedObjectives = outcome.objectives.map(obj =>
                                  obj.id === objective.id ? { ...obj, description: e.target.value } : obj
                                );
                                updateOutcome(outcome.id, 'objectives', updatedObjectives);
                              }}
                              disabled={!isEditing || !canEditPlans}
                              rows="2"
                              placeholder="e.g., 'Will brush teeth with verbal prompts only in 4 out of 5 opportunities over 8 weeks'"
                              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all resize-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-400 mb-1">
                                Teaching Strategies
                              </label>
                              <textarea
                                value={objective.teaching_strategies}
                                onChange={(e) => {
                                  const updatedObjectives = outcome.objectives.map(obj =>
                                    obj.id === objective.id ? { ...obj, teaching_strategies: e.target.value } : obj
                                  );
                                  updateOutcome(outcome.id, 'objectives', updatedObjectives);
                                }}
                                disabled={!isEditing || !canEditPlans}
                                rows="2"
                                placeholder="e.g., Verbal prompting, modeling, positive reinforcement"
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all resize-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-slate-400 mb-1">
                                Data Collection Method
                              </label>
                              <textarea
                                value={objective.data_collection}
                                onChange={(e) => {
                                  const updatedObjectives = outcome.objectives.map(obj =>
                                    obj.id === objective.id ? { ...obj, data_collection: e.target.value } : obj
                                  );
                                  updateOutcome(outcome.id, 'objectives', updatedObjectives);
                                }}
                                disabled={!isEditing || !canEditPlans}
                                rows="2"
                                placeholder="e.g., Prompt level, completion %, narrative notes"
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all resize-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">
                              Mastery Criteria
                            </label>
                            <input
                              type="text"
                              value={objective.mastery_criteria}
                              onChange={(e) => {
                                const updatedObjectives = outcome.objectives.map(obj =>
                                  obj.id === objective.id ? { ...obj, mastery_criteria: e.target.value } : obj
                                );
                                updateOutcome(outcome.id, 'objectives', updatedObjectives);
                              }}
                              disabled={!isEditing || !canEditPlans}
                              placeholder="e.g., Met for 4 consecutive weeks"
                              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </>
)}
</div>
)}


          {/* Person-Centered Plan Tab */}
          {activeTab === 'person-centered-plan' && (
            <div className="space-y-6">
              {!canViewPlans ? (
                <div className="text-center py-16">
                  <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-400 mb-2">Access Restricted</h3>
                  <p className="text-slate-500">You do not have permission to view person-centered plans.</p>
                </div>
              ) : (
                <>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-2xl font-bold text-white mb-4">Person-Centered Plan Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Effective Date</label>
                        <input
                          type="date"
                          name="effectivedate"
                          value={formData.effectivedate}
                          onChange={handleInputChange}
                          disabled={!isEditing || !canEditPlans}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Next Review Date</label>
                        <input
                          type="date"
                          name="nextreviewdate"
                          value={formData.nextreviewdate}
                          onChange={handleInputChange}
                          disabled={!isEditing || !canEditPlans}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-400 mb-2">QIDP Notes</label>
                        <textarea
                          name="qidpnotes"
                          value={formData.qidpnotes}
                          onChange={handleInputChange}
                          disabled={!isEditing || !canEditPlans}
                          rows="4"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* HCBS Domains */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">HCBS Compliance Domains</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['Community Integration', 'Choice & Control', 'Rights', 'Privacy', 'Dignity & Respect', 'Person-Centered'].map(domain => (
                        <div
                          key={domain}
                          className={`p-4 border-2 rounded-lg transition-all ${
                            formData.hcbsdomains?.includes(domain)
                              ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                              : 'bg-slate-700/30 border-slate-600 text-slate-400'
                          } ${(isEditing && canEditPlans) ? 'cursor-pointer hover:border-slate-500' : 'cursor-not-allowed opacity-70'}`}
                          onClick={() => {
                            if (!isEditing || !canEditPlans) return;
                            setFormData(prev => ({
                              ...prev,
                              hcbsdomains: prev.hcbsdomains?.includes(domain)
                                ? prev.hcbsdomains.filter(d => d !== domain)
                                : [...(prev.hcbsdomains || []), domain]
                            }));
                          }}
                        >
                          <p className="text-sm font-semibold text-center">{domain}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Goals & Outcomes Tab */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              {!canViewPlans ? (
                <div className="text-center py-16">
                  <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-400 mb-2">Access Restricted</h3>
                  <p className="text-slate-500">You do not have permission to view goals and outcomes.</p>
                </div>
              ) : (
                <>
                  {/* Outcomes Section */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Award className="text-purple-400" size={24} />
                        Outcomes
                      </h3>
                      {isEditing && canEditPlans && (
                        <button
                          onClick={addOutcome}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
                        >
                          <Plus size={16} />
                          Add Outcome
                        </button>
                      )}
                    </div>

                    {formData.outcomes?.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Award className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                        <p>No outcomes defined yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.outcomes?.map((outcome) => (
                          <div key={outcome.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                                <textarea
                                  value={outcome.description}
                                  onChange={(e) => updateOutcome(outcome.id, 'description', e.target.value)}
                                  disabled={!isEditing || !canEditPlans}
                                  rows="2"
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all resize-none"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Target Date</label>
                                <input
                                  type="date"
                                  value={outcome.targetdate}
                                  onChange={(e) => updateOutcome(outcome.id, 'targetdate', e.target.value)}
                                  disabled={!isEditing || !canEditPlans}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                                <select
                                  value={outcome.status}
                                  onChange={(e) => updateOutcome(outcome.id, 'status', e.target.value)}
                                  disabled={!isEditing || !canEditPlans}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all"
                                >
                                  <option value="In Progress">In Progress</option>
                                  <option value="Achieved">Achieved</option>
                                  <option value="On Hold">On Hold</option>
                                  <option value="Discontinued">Discontinued</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">HCBS Domain</label>
                                <select
                                  value={outcome.hcbsdomain}
                                  onChange={(e) => updateOutcome(outcome.id, 'hcbsdomain', e.target.value)}
                                  disabled={!isEditing || !canEditPlans}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all"
                                >
                                  <option value="">Select Domain</option>
                                  <option value="Community Integration">Community Integration</option>
                                  <option value="Choice & Control">Choice & Control</option>
                                  <option value="Rights">Rights</option>
                                  <option value="Privacy">Privacy</option>
                                  <option value="Dignity & Respect">Dignity & Respect</option>
                                  <option value="Person-Centered">Person-Centered</option>
                                </select>
                              </div>
                              {isEditing && canEditPlans && (
                                <div className="flex items-end">
                                  <button
                                    onClick={() => deleteOutcome(outcome.id)}
                                    className="w-full px-4 py-3Continue12:31bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
>
<Trash2 size={16} />
Delete
</button>
</div>
)}
</div>
</div>
))}
</div>
)}
</div>
                  {/* Goals Section */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Target className="text-blue-400" size={24} />
                        Goals
                      </h3>
                      {isEditing && canEditPlans && (
                        <button
                          onClick={addGoal}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
                        >
                          <Plus size={16} />
                          Add Goal
                        </button>
                      )}
                    </div>

                    {formData.goals?.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Target className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                        <p>No goals defined yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.goals?.map((goal) => (
                          <div key={goal.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-400 mb-2">Goal Description</label>
                                <textarea
                                  value={goal.description}
                                  onChange={(e) => updateGoal(goal.id, 'description', e.target.value)}
                                  disabled={!isEditing || !canEditPlans}
                                  rows="2"
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all resize-none"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Frequency</label>
                                <select
                                  value={goal.frequency}
                                  onChange={(e) => updateGoal(goal.id, 'frequency', e.target.value)}
                                  disabled={!isEditing || !canEditPlans}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                                >
                                  <option value="Daily">Daily</option>
                                  <option value="Weekly">Weekly</option>
                                  <option value="Monthly">Monthly</option>
                                  <option value="As Needed">As Needed</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Target Date</label>
                                <input
                                  type="date"
                                  value={goal.targetdate}
                                  onChange={(e) => updateGoal(goal.id, 'targetdate', e.target.value)}
                                  disabled={!isEditing || !canEditPlans}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                                <select
                                  value={goal.status}
                                  onChange={(e) => updateGoal(goal.id, 'status', e.target.value)}
                                  disabled={!isEditing || !canEditPlans}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                                >
                                  <option value="Active">Active</option>
                                  <option value="Completed">Completed</option>
                                  <option value="On Hold">On Hold</option>
                                  <option value="Discontinued">Discontinued</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Progress (%)</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={goal.progress}
                                  onChange={(e) => updateGoal(goal.id, 'progress', parseInt(e.target.value))}
                                  disabled={!isEditing || !canEditPlans}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                                />
                              </div>
                              {isEditing && canEditPlans && (
                                <div className="flex items-end">
                                  <button
                                    onClick={() => deleteGoal(goal.id)}
                                    className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                                  >
                                    <Trash2 size={16} />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="mt-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">Progress</span>
                                <span className="text-sm font-bold text-white">{goal.progress}%</span>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-2">
                                <div 
                                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300"
                                  style={{ width: `${goal.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Risk Management Tab */}
          {activeTab === 'risks' && (
            <div className="space-y-6">
              {!canManageRisks && !canViewPlans ? (
                <div className="text-center py-16">
                  <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-400 mb-2">Access Restricted</h3>
                  <p className="text-slate-500">You do not have permission to view risk management.</p>
                </div>
              ) : (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Shield className="text-orange-400" size={24} />
                      Risk Plans
                    </h3>
                    {isEditing && canManageRisks && (
                      <button
                        onClick={addRiskPlan}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-all"
                      >
                        <Plus size={16} />
                        Add Risk Plan
                      </button>
                    )}
                  </div>

                  {formData.riskplans?.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <Shield className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                      <p>No risk plans defined yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.riskplans?.map((risk) => (
                        <div key={risk.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-400 mb-2">Risk Type</label>
                              <input
                                type="text"
                                value={risk.risktype}
                                onChange={(e) => updateRiskPlan(risk.id, 'risktype', e.target.value)}
                                disabled={!isEditing || !canManageRisks}
                                placeholder="e.g., Elopement, Self-Harm, Medical"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 disabled:opacity-50 transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                              <select
                                value={risk.status}
                                onChange={(e) => updateRiskPlan(risk.id, 'status', e.target.value)}
                                disabled={!isEditing || !canManageRisks}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 disabled:opacity-50 transition-all"
                              >
                                <option value="Active">Active</option>
                                <option value="Under Review">Under Review</option>
                                <option value="Resolved">Resolved</option>
                              </select>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                              <textarea
                                value={risk.description}
                                onChange={(e) => updateRiskPlan(risk.id, 'description', e.target.value)}
                                disabled={!isEditing || !canManageRisks}
                                rows="2"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 disabled:opacity-50 transition-all resize-none"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-slate-400 mb-2">Interventions</label>
                              <textarea
                                value={risk.interventions}
                                onChange={(e) => updateRiskPlan(risk.id, 'interventions', e.target.value)}
                                disabled={!isEditing || !canManageRisks}
                                rows="2"
                                placeholder="List interventions and strategies..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 disabled:opacity-50 transition-all resize-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-400 mb-2">Responsible Staff</label>
                              <input
                                type="text"
                                value={risk.responsiblestaff}
                                onChange={(e) => updateRiskPlan(risk.id, 'responsiblestaff', e.target.value)}
                                disabled={!isEditing || !canManageRisks}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 disabled:opacity-50 transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-400 mb-2">Review Date</label>
                              <input
                                type="date"
                                value={risk.reviewdate}
                                onChange={(e) => updateRiskPlan(risk.id, 'reviewdate', e.target.value)}
                                disabled={!isEditing || !canManageRisks}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 disabled:opacity-50 transition-all"
                              />
                            </div>
                            {isEditing && canManageRisks && (
                              <div className="md:col-span-2">
                                <button
                                  onClick={() => deleteRiskPlan(risk.id)}
                                  className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                                >
                                  <Trash2 size={16} />
                                  Delete Risk Plan
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Alerts & Restrictions Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              {!canManageAlerts && !canViewPlans ? (
                <div className="text-center py-16">
                  <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-400 mb-2">Access Restricted</h3>
                  <p className="text-slate-500">You do not have permission to view alerts.</p>
                </div>
              ) : (
                <>
                  {/* Medical Alerts */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Heart className="text-red-400" size={24} />
                        Medical Alerts
                      </h3>
                      {isEditing && canManageAlerts && (
                        <button
                          onClick={() => addAlert('medical')}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
                        >
                          <Plus size={16} />
                          Add Alert
                        </button>
                      )}
                    </div>

                    {formData.medicalalerts?.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Heart className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                        <p>No medical alerts</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formData.medicalalerts?.map((alert) => (
                          <div key={alert.id} className="bg-slate-900/50 border border-red-500/30 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-400 mb-2">Alert Description</label>
                                <input
                                  type="text"
                                  value={alert.description}
                                  onChange={(e) => updateAlert('medical', alert.id, 'description', e.target.value)}
                                  disabled={!isEditing || !canManageAlerts}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 disabled:opacity-50 transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Severity</label>
                                <select
                                  value={alert.severity}
                                  onChange={(e) => updateAlert('medical', alert.id, 'severity', e.target.value)}
                                  disabled={!isEditing || !canManageAlerts}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 disabled:opacity-50 transition-all"
                                >
                                  <option value="Low">Low</option>
                                  <option value="Medium">Medium</option>
                                  <option value="High">High</option>
                                  <option value="Critical">Critical</option>
                                </select>
                              </div>
                              {isEditing && canManageAlerts && (
                                <div className="md:col-span-3">
                                  <button
                                    onClick={() => deleteAlert('medical', alert.id)}
                                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-semibold transition-all flex items-center gap-2"
                                  >
                                    <Trash2 size={16} />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Behavioral Alerts */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Activity className="text-yellow-400" size={24} />
                        Behavioral Alerts
                      </h3>
                      {isEditing && canManageAlerts && (
                        <button
                          onClick={() => addAlert('behavioral')}
                          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-all"
                        >
                          <Plus size={16} />
                          Add Alert
                        </button>
                      )}
                    </div>

                    {formData.behavioralalerts?.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Activity className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                        <p>No behavioral alerts</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formData.behavioralalerts?.map((alert) => (
                          <div key={alert.id} className="bg-slate-900/50 border border-yellow-500/30 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-400 mb-2">Alert Description</label>
                                <input
                                  type="text"
                                  value={alert.description}
                                  onChange={(e) => updateAlert('behavioral', alert.id, 'description', e.target.value)}
                                  disabled={!isEditing || !canManageAlerts}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 disabled:opacity-50 transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Severity</label>
                                <select
                                  value={alert.severity}
                                  onChange={(e) => updateAlert('behavioral', alert.id, 'severity', e.target.value)}
                                  disabled={!isEditing || !canManageAlerts}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 disabled:opacity-50 transition-all"
                                >
                                  <option value="Low">Low</option>
                                  <option value="Medium">Medium</option>
                                  <option value="High">High</option>
                                  <option value="Critical">Critical</option>
                                </select>
                              </div>
                              {isEditing && canManageAlerts && (
                                <div className="md:col-span-3">
                                  <button
                                    onClick={() => deleteAlert('behavioral', alert.id)}
                                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-semibold transition-all flex items-center gap-2"
                                  >
                                    <Trash2 size={16} />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Rights & Agreements Tab - NEW TAB */}
          {activeTab === 'rights-agreements' && (
            <div className="space-y-6">
              {!canViewPlans ? (
                <div className="text-center py-16">
                  <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-400 mb-2">Access Restricted</h3>
                  <p className="text-slate-500">You do not have permission to view rights and agreements documents.</p>
                </div>
              ) : (
                <>
                  {/* Saved Documents Section */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileText className="text-indigo-400" size={24} />
                        Saved Documents
                      </h3>
                    </div>

                    {loadingDocuments ? (
                      <div className="text-center py-12">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                        <p className="text-slate-400">Loading documents...</p>
                      </div>
                    ) : savedDocuments.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                        <p className="text-lg mb-2">No documents saved yet</p>
                        <p className="text-sm text-slate-500">Upload and sign a document below to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {savedDocuments.map((doc) => (
                          <div key={doc.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-indigo-500/50 transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="text-white font-semibold mb-1">{doc.document_name}</h4>
                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <User size={14} />
                                    {doc.uploaded_by}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {new Date(doc.uploaded_at).toLocaleDateString()} {new Date(doc.uploaded_at).toLocaleTimeString()}

                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Type size={14} />
                                    {doc.signatures_count} signature{doc.signatures_count !== 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => viewDocument(doc.file_url)}
                                  className="p-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-lg transition-all"
                                  title="View Document"
                                >
                                  <Eye size={18} />
                                </button>
                                {canManageDocuments && (
                                  <button
                                    onClick={() => deleteDocument(doc.id, doc.file_path)}
                                    className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all"
                                    title="Delete Document"
                                  >
                                    <Trash size={18} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* PDF Upload and Signature Section */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Upload className="text-emerald-400" size={24} />
                      Upload & Sign New Document
                    </h3>

                    {!pdfFile ? (
                      <div
                        onClick={() => canManageDocuments && fileInputRef.current?.click()}
                        className={`border-4 border-dashed border-slate-600 rounded-xl p-12 text-center ${
                          canManageDocuments 
                            ? 'cursor-pointer hover:border-indigo-500 hover:bg-slate-700/30' 
                            : 'cursor-not-allowed opacity-50'
                        } transition-all`}
                      >
                        <Upload className="mx-auto mb-4 text-slate-500" size={48} />
                        <p className="text-lg text-slate-300 mb-2">
                          {canManageDocuments 
                            ? 'Click to upload your PDF document' 
                            : 'You do not have permission to upload documents'}
                        </p>
                        <p className="text-sm text-slate-500">
                          PDF files only
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={!canManageDocuments}
                        />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* PDF Preview and Signature Tools */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* PDF Preview */}
                          <div className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-semibold text-white">Document Preview</h4>
                              <button
                                onClick={() => {
                                  setPdfFile(null);
                                  setPdfPages([]);
                                  setSignatures([]);
                                  setPdfLoaded(false);
                                }}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <X size={20} />
                              </button>
                            </div>

                            <div
                              ref={previewRef}
                              className="bg-slate-900 rounded-lg overflow-auto border border-slate-700"
                              style={{ maxHeight: '600px' }}
                            >
                              {!pdfLoaded ? (
                                <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
                                  <div className="text-center">
                                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                                    <p className="text-slate-400">Loading PDF...</p>
                                  </div>
                                </div>
                              ) : (
                                pdfPages.map((page, pageIndex) => (
                                  <div 
                                    key={pageIndex} 
                                    className="relative mb-4 p-4"
                                    ref={el => pageRefs.current[pageIndex] = el}
                                    onDragOver={handleDragOver}
onDrop={(e) => handleDrop(e, pageIndex)}
>
<img
src={page.dataUrl}
alt={`test`}
className="w-full h-auto shadow-lg pointer-events-none"
draggable="false"
/>
<div className="absolute top-6 right-6 bg-slate-800 text-white px-3 py-1 rounded text-sm pointer-events-none">
Page {pageIndex + 1} of {pdfPages.length}
</div>
                                    {/* Render signatures for this page */}
                                    {signatures.filter(sig => sig.page === pageIndex).map(signature => (
                                      <div
                                        key={signature.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, signature)}
                                        style={{
                                          position: 'absolute',
                                          left: `${signature.x}px`,
                                          top: `${signature.y}px`,
                                          fontFamily: getFontFamily(signature.font),
                                          fontSize: '48px',
                                          cursor: 'move',
                                          userSelect: 'none',
                                          zIndex: 10,
                                          pointerEvents: 'auto'
                                        }}
                                        className="text-black hover:opacity-75 group"
                                      >
                                        {signature.text}
                                        <button
                                          onClick={() => removeSignature(signature.id)}
                                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <X size={16} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                ))
                              )}
                            </div>

                            <canvas ref={canvasRef} className="hidden" />
                          </div>

                          {/* Signature Tools */}
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-lg font-semibold text-white mb-4">Signature Tools</h4>
                              
                              <button
                                onClick={() => setShowSignatureModal(true)}
                                disabled={!pdfLoaded}
                                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:bg-slate-600 disabled:cursor-not-allowed mb-4"
                              >
                                <Type size={20} />
                                Add Text Signature
                              </button>

                              <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                  <Move size={20} className="text-indigo-400 mt-1 flex-shrink-0" />
                                  <p className="text-sm text-slate-300">
                                    Drag signatures to position them on your document. You can move them between pages.
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Active Signatures */}
                            <div>
                              <h4 className="text-sm font-semibold text-slate-400 mb-3">
                                Active Signatures ({signatures.length})
                              </h4>
                              
                              {signatures.length === 0 ? (
                                <div className="text-center py-6 bg-slate-900/50 rounded-lg border border-slate-700">
                                  <Type className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                                  <p className="text-sm text-slate-500">No signatures added yet</p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {signatures.map(sig => (
                                    <div
                                      key={sig.id}
                                      className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-700"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <span
                                          style={{ fontFamily: getFontFamily(sig.font) }}
                                          className="text-base text-white block truncate"
                                        >
                                          {sig.text}
                                        </span>
                                        <p className="text-xs text-slate-500 mt-1">
                                          Page {sig.page + 1}
                                        </p>
                                      </div>
                                      <button
                                        onClick={() => removeSignature(sig.id)}
                                        className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Save Button */}
                            {signatures.length > 0 && pdfLoaded && (
                              <button
                                onClick={saveSignedPDF}
                                disabled={uploadingPdf || !canManageDocuments}
                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 px-4 rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {uploadingPdf ? (
                                  <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Saving Document...
                                  </>
                                ) : (
                                  <>
                                    <Save size={20} />
                                    Save Signed Document
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            
          )}

        </div>
      </ScrollArea>
    </div>
  </div>

  {/* Signature Modal */}
  {showSignatureModal && (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            Create Text Signature
          </h2>
          <button
            onClick={() => setShowSignatureModal(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Signature Style
            </label>
            <div className="grid grid-cols-2 gap-3">
              {fonts.map(font => (
                <button
                  key={font.value}
                  onClick={() => setSelectedFont(font.value)}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedFont === font.value
                      ? 'border-indigo-500 bg-indigo-600/20'
                      : 'border-slate-600 hover:border-slate-500 bg-slate-900/50'
                  }`}
                >
                  <p
                    style={{ fontFamily: getFontFamily(font.value) }}
                    className="text-2xl text-center text-white"
                  >
                    {signatureName || font.name}
                  </p>
                  <p className="text-xs text-slate-400 text-center mt-2">
                    {font.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {signatureName && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
              <p className="text-sm text-slate-400 mb-3 text-center">
                Preview
              </p>
              <p
                style={{ fontFamily: getFontFamily(selectedFont) }}
                className="text-5xl text-center text-white"
              >
                {signatureName}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowSignatureModal(false)}
              className="flex-1 px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={createSignature}
              disabled={!signatureName.trim()}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Add Signature
            </button>
          </div>
        </div>
      </div>
    </div>
  )}
</div>
);
};
export default IndividualProfilePage;
