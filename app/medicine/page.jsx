'use client'

import React, { useState, useEffect , useRef} from 'react';
import { 
  Pill, Plus, Search, Filter, Edit2, Trash2, Save, X, CheckCircle, XCircle, 
  Clock, AlertCircle, Calendar, User, Activity, TrendingUp, Download, ArrowLeft,
  ChevronRight, ChevronDown, Loader2, AlertTriangle, FileText, PlusCircle,CreditCard,
  MinusCircle, RotateCcw, History, BarChart3, Settings, Eye,NetworkIcon,
  Users, FileText as FileTextIcon, Home, MapPin, Brain, Zap, Sparkles, Award,
  ChevronLeft, Bell, Menu, Shield, BookOpen, ClipboardCheck, Stethoscope,Trash,
  Thermometer, Heart, BrainCircuit, Activity as ActivityIcon, Pill as PillIcon,
  Droplets, Wind, HeartPulse
} from 'lucide-react';
import { ScrollArea } from "../../components/ui/scroll-area";
import { useUser, UserButton } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '../../contexts/userProfileContext';
import { PERMISSIONS } from '../../utils/permissions';
import { Upload,  Signature,   Move, Type } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
// Initialize Supabase client
const supabase = createClient(
  'https://bbikcxalypttfgrlxstf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWtjeGFseXB0dGZncmx4c3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODcwOCwiZXhwIjoyMDY5Mjk0NzA4fQ.4BLQyvPA0eB745Sfdn2Tl4oCDRTzNhLXrJ8Os8wOXfs'
);

// DD Residential Medication Categories
const DD_MEDICATION_CATEGORIES = {
  psychiatric: {
    name: 'Psychiatric & Behavioral Health',
    icon: Brain,
    color: 'from-purple-600 to-pink-500',
    subcategories: {
      atypicalAntipsychotics: {
        name: 'Atypical Antipsychotics',
        description: 'Used for mood stabilization, psychosis, and severe behavioral dysregulation',
        medications: [
          'Risperidone (Risperdal)',
          'Aripiprazole (Abilify)',
          'Olanzapine (Zyprexa)',
          'Quetiapine (Seroquel)',
          'Ziprasidone (Geodon)'
        ]
      },
      typicalAntipsychotics: {
        name: 'Typical Antipsychotics',
        medications: [
          'Haloperidol (Haldol)',
          'Chlorpromazine'
        ]
      },
      moodStabilizers: {
        name: 'Mood Stabilizers / Anticonvulsants',
        description: 'Used for behavior & seizures',
        medications: [
          'Divalproex Sodium (Depakote)',
          'Carbamazepine (Tegretol)',
          'Lamotrigine (Lamictal)',
          'Oxcarbazepine (Trileptal)',
          'Topiramate (Topamax)'
        ]
      },
      antidepressants: {
        name: 'Antidepressants',
        medications: [
          'Sertraline (Zoloft)',
          'Fluoxetine (Prozac)',
          'Escitalopram (Lexapro)',
          'Duloxetine (Cymbalta)',
          'Venlafaxine (Effexor)'
        ]
      },
      anxiolytics: {
        name: 'Anxiolytics / Anti-Anxiety',
        medications: [
          'Buspirone (Buspar)',
          'Hydroxyzine (Vistaril, Atarax)',
          'Lorazepam (Ativan) - Rare in DD',
          'Clonazepam (Klonopin) - Rare in DD'
        ]
      },
      adhd: {
        name: 'Stimulants / ADHD Medications',
        medications: [
          'Methylphenidate (Ritalin, Concerta)',
          'Amphetamine/Dextroamphetamine (Adderall)',
          'Lisdexamfetamine (Vyvanse)',
          'Guanfacine (Intuniv)',
          'Clonidine'
        ]
      }
    }
  },
  seizure: {
    name: 'Seizure / Neurological',
    icon: BrainCircuit,
    color: 'from-blue-600 to-cyan-500',
    description: 'Many individuals with DD have epilepsy or seizure disorders',
    medications: [
      'Levetiracetam (Keppra)',
      'Divalproex (Depakote)',
      'Carbamazepine (Tegretol)',
      'Lamotrigine (Lamictal)',
      'Topiramate (Topamax)',
      'Phenobarbital',
      'Clonazepam (Klonopin)'
    ],
    rescueMeds: {
      name: 'Emergency Seizure Rescue Medications',
      note: 'Staff must be specifically trained and delegated by the RN to use rescue meds',
      medications: [
        'Diazepam Nasal Spray (Valtoco)',
        'Midazolam Nasal Spray (Nayzilam)',
        'Rectal Diazepam (Diastat)'
      ]
    }
  },
  gastrointestinal: {
    name: 'Gastrointestinal',
    icon: ActivityIcon,
    color: 'from-green-600 to-emerald-500',
    description: 'Common due to constipation, reflux, and dietary sensitivities',
    subcategories: {
      gerd: {
        name: 'GERD / Acid Reflux',
        medications: [
          'Omeprazole (Prilosec)',
          'Pantoprazole (Protonix)',
          'Famotidine (Pepcid)'
        ]
      },
      constipation: {
        name: 'Constipation / Bowel Regimen',
        note: 'Bowel protocols must be followed and documented',
        medications: [
          'Polyethylene Glycol (MiraLAX)',
          'Senna (Senokot)',
          'Docusate (Colace)',
          'Lactulose',
          'Milk of Magnesia',
          'Bisacodyl (Dulcolax)'
        ]
      }
    }
  },
  allergy: {
    name: 'Allergy & Respiratory',
    icon: Wind,
    color: 'from-sky-600 to-blue-500',
    subcategories: {
      antihistamines: {
        name: 'Antihistamines',
        medications: [
          'Loratadine (Claritin)',
          'Cetirizine (Zyrtec)',
          'Diphenhydramine (Benadryl)'
        ]
      },
      asthma: {
        name: 'Asthma / Respiratory',
        medications: [
          'Albuterol Inhaler or Nebulizer',
          'Fluticasone (Flovent)',
          'Montelukast (Singulair)',
          'Budesonide Nebulizer'
        ]
      },
      emergency: {
        name: 'Emergency Allergy Meds',
        medications: [
          'EPINEPHrine Auto-Injector (EpiPen)'
        ]
      }
    }
  },
  pain: {
    name: 'Pain, Fever & General PRN',
    icon: Thermometer,
    color: 'from-orange-600 to-red-500',
    subcategories: {
      analgesics: {
        name: 'Analgesics / Pain Relief',
        medications: [
          'Acetaminophen (Tylenol)',
          'Ibuprofen (Advil, Motrin)',
          'Naproxen (Aleve)'
        ]
      },
      topical: {
        name: 'Topical Pain & Skin Treatments',
        medications: [
          'Hydrocortisone Cream',
          'Triple Antibiotic Ointment',
          'Antifungal cream (clotrimazole)'
        ]
      },
      prnProtocol: {
        name: 'PRN Protocol Meds',
        note: 'Require written physician orders specifying what for, how often, and when to call RN/MD',
        medications: [
          'Anti-nausea: Ondansetron (Zofran)',
          'Diarrhea: Loperamide (Imodium)',
          'Cough: Dextromethorphan syrup (if ordered)'
        ]
      }
    }
  },
  endocrine: {
    name: 'Endocrine',
    icon: Droplets,
    color: 'from-yellow-600 to-amber-500',
    subcategories: {
      diabetes: {
        name: 'Diabetes',
        note: 'Blood glucose monitoring supplies must be kept secure and documented',
        medications: [
          'Metformin',
          'Insulin (various types — requires RN delegation & training)'
        ]
      },
      thyroid: {
        name: 'Thyroid',
        medications: [
          'Levothyroxine (Synthroid)'
        ]
      }
    }
  },
  cardiovascular: {
    name: 'Cardiovascular',
    icon: HeartPulse,
    color: 'from-rose-600 to-pink-500',
    note: 'Blood pressure parameters must be included in physician orders',
    medications: [
      'Lisinopril',
      'Amlodipine',
      'Metoprolol',
      'Hydrochlorothiazide',
      'Atorvastatin or other statins'
    ]
  },
  supplements: {
    name: 'Supplements & Nutritional Support',
    icon: PillIcon,
    color: 'from-indigo-600 to-purple-500',
    description: 'Often physician-ordered for individuals with DD',
    medications: [
      'Vitamin D',
      'Multivitamin',
      'Iron (Ferrous Sulfate)',
      'Calcium',
      'Probiotics',
      'Ensure / Boost / Nutritional drinks'
    ]
  }
};

// Filter options
const INDIVIDUAL_FILTER_OPTIONS = {
  status: ['All', 'Active', 'Pending', 'Inactive', 'On Hold'],
  homeassignment: ['All Homes', 'Maple House', 'Oak House', 'Pine House', 'Cedar House', 'Willow House'],
  division: ['All', 'DD', 'MI', 'SUD'],
  medicationStatus: ['All', 'With Medications', 'Without Medications', 'PRN Only']
};

const MedicationsPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { userProfile, loading: profileLoading, hasPermission, hasAnyPermission } = useUserProfile();
  
  const [individuals, setIndividuals] = useState([]);
  const [selectedIndividual, setSelectedIndividual] = useState(null);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMARModal, setShowMARModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('medicine');
  const [showMedGuide, setShowMedGuide] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    status: 'All',
    homeassignment: 'All Homes',
    division: 'All',
    medicationStatus: 'All',
    searchTerm: ''
  });
  const [filteredIndividuals, setFilteredIndividuals] = useState([]);
  const [marHistory, setMarHistory] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statsFilter, setStatsFilter] = useState(null); // 'active', 'missed', 'high', 'review'
  const [medicationStats, setMedicationStats] = useState({
    totalActiveMedications: 0,
    missedDosesToday: 0,
    highComplianceCount: 0,
    reviewRequiredCount: 0
  });

  const [showWellnessModal, setShowWellnessModal] = useState(false);
const [wellnessData, setWellnessData] = useState([]);
const [wellnessForm, setWellnessForm] = useState({
  type: '', // 'appointment', 'medical_history', 'vital_signs'
  date: '',
  title: '',
  provider: '',
  location: '',
  notes: '',
  status: 'Scheduled', // For appointments
  // Vital signs fields
  bloodPressure: '',
  heartRate: '',
  temperature: '',
  weight: '',
  height: '',
  oxygenSaturation: ''
});

  // Permission checks
  const canViewMedications = hasAnyPermission([
    PERMISSIONS.MAR_CREATE,
    PERMISSIONS.MAR_APPROVE,
    PERMISSIONS.MAR_FULL,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canAddMedications = hasAnyPermission([
    PERMISSIONS.MAR_FULL,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canEditMedications = hasAnyPermission([
    PERMISSIONS.MAR_FULL,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canDeleteMedications = hasAnyPermission([
    PERMISSIONS.MAR_FULL,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canCreateMAREntries = hasAnyPermission([
    PERMISSIONS.MAR_CREATE,
    PERMISSIONS.MAR_FULL,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canApproveMAREntries = hasAnyPermission([
    PERMISSIONS.MAR_APPROVE,
    PERMISSIONS.MAR_FULL,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canViewPlans = hasAnyPermission([
      PERMISSIONS.PLANS_VIEW,
      PERMISSIONS.PLANS_CREATE,
      PERMISSIONS.PLANS_EDIT,
      PERMISSIONS.FULL_ACCESS
    ]);
  
    const canManageDocuments = hasAnyPermission([
        PERMISSIONS.PLANS_CREATE,
        PERMISSIONS.PLANS_EDIT,
        PERMISSIONS.ADMIN,
        PERMISSIONS.FULL_ACCESS
      ]);
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
  // Medication form state
  const [medicationForm, setMedicationForm] = useState({
    medicationname: '',
    dosage: '',
    route: '',
    frequency: '',
    startdate: '',
    enddate: '',
    prescribedby: '',
    pharmacy: '',
    indication: '',
    specialinstructions: '',
    times: [],
    prn: false,
    prnreason: '',
    category: '',
    subcategory: ''
  });

  // MAR entry form state
  const [marEntry, setMarEntry] = useState({
    medicationid: '',
    time: '',
    status: '',
    notes: '',
    givenby: '',
    refusedreason: '',
    heldreason: '',
    lateminutes: ''
  });

  // Time blocks for MAR
  const timeBlocks = [
    '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
  ];

  const routes = ['PO', 'IM', 'IV', 'SubQ', 'Topical', 'Inhalation', 'Rectal', 'Sublingual', 'Nasal'];
  const frequencies = ['Daily', 'BID', 'TID', 'QID', 'QHS', 'QAM', 'PRN', 'Weekly', 'Monthly'];


   const menuItems = [
      { id: 'dashboard', icon: Home, label: 'Dashboard', badge: null },
      { id: 'individual', icon: Users, label: 'Individuals', badge: null },
      { id: 'medicine', icon: Pill, label: 'Medications', badge: null },
      { id: 'incident', icon: AlertTriangle, label: 'Incidents', badge: '3' },
  //    { id: 'privacy', icon: Shield, label: 'Data Privacy', badge: 'NEW' },
      { id: 'report', icon: FileText, label: 'Report', badge: 'NEW' },
   //   { id: 'engine', icon: Pill, label: 'Foresight Engine', badge: 'NEW' },
      { id: 'intelligence', icon: NetworkIcon, label: 'User Foresight', badge: 'NEW' },
      { id: 'billing', icon: CreditCard, label: 'Billing', badge: null },
      { id: 'analytics', icon: TrendingUp, label: 'Analytics', badge: null }
    ];
  // Parse JSON data from Supabase
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


  const fetchWellnessData = async (individualId) => {
  try {
    const { data, error } = await supabase
      .from('individuals')
      .select('wellness_data')
      .eq('id', individualId)
      .single();
    
    if (error) throw error;
    
    const wellness = parseJSONData(data?.wellness_data) || [];
    setWellnessData(wellness);
    
    // Update local state
    setIndividuals(prev => prev.map(ind => 
      ind.id === individualId 
        ? { ...ind, wellness_data: wellness } 
        : ind
    ));
  } catch (error) {
    console.error('Error fetching wellness data:', error);
    setWellnessData([]);
  }
};


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


      useEffect(() => {
        if (pdfFile && window.pdfjsLib) {
          renderPDF();
        }
      }, [pdfFile]);
    
      // Load saved documents when tab is accessed
      useEffect(() => {
  if (selectedIndividual) {
    loadSavedDocuments();
  }
}, [selectedIndividual]);
    
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
      const fileName = `${selectedIndividual.id}/rights-agreements/${Date.now()}_signed_document.pdf`;
      
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
          individual_id: selectedIndividual.id,
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
    
    if (!selectedIndividual) {
      console.warn('No individual selected');
      setSavedDocuments([]);
      return;
    }
    
    const { data, error } = await supabase
      .from('individual_documents')
      .select('*')
      .eq('individual_id', selectedIndividual.id)
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
  

  // Calculate statistics for all individuals
  const calculateAllStats = (individualsData) => {
    let totalActiveMedications = 0;
    let missedDosesToday = 0;
    let highComplianceCount = 0;
    let reviewRequiredCount = 0;
    const today = new Date().toDateString();

    individualsData.forEach(individual => {
      const meds = individual.medications || [];
      const marHistory = individual.marhistory || [];
      
      // Count active medications
      totalActiveMedications += meds.filter(med => med.status === 'Active').length;
      
      // Count high compliance individuals (average compliance > 90%)
      if (meds.length > 0) {
        const avgCompliance = meds.reduce((sum, med) => sum + (med.compliance || 0), 0) / meds.length;
        if (avgCompliance > 90) {
          highComplianceCount++;
        }
        if (avgCompliance < 70) {
          reviewRequiredCount++;
        }
      }
      
      // Calculate missed doses for today
      meds.forEach(med => {
        if (med.times) {
          med.times.forEach(time => {
            const [hours, minutes] = time.split(':').map(Number);
            const doseTime = new Date();
            doseTime.setHours(hours, minutes, 0, 0);
            
            if (new Date() > doseTime) {
              const doseAdministered = marHistory.some(entry => 
                entry.medicationid === med.id && 
                entry.time === time && 
                new Date(entry.date).toDateString() === today &&
                entry.status === 'Given'
              );
              
              if (!doseAdministered) {
                missedDosesToday++;
              }
            }
          });
        }
      });
    });

    return {
      totalActiveMedications,
      missedDosesToday,
      highComplianceCount,
      reviewRequiredCount
    };
  };

  // Filter individuals based on stats filter
  const filterIndividualsByStats = (individualsData, filterType) => {
    if (!filterType) return individualsData;

    const today = new Date().toDateString();
    
    return individualsData.filter(individual => {
      const meds = individual.medications || [];
      const marHistory = individual.marhistory || [];
      
      switch (filterType) {
        case 'active':
          return meds.filter(med => med.status === 'Active').length > 0;
        
        case 'missed':
          let hasMissedDoses = false;
          meds.forEach(med => {
            if (med.times) {
              med.times.forEach(time => {
                const [hours, minutes] = time.split(':').map(Number);
                const doseTime = new Date();
                doseTime.setHours(hours, minutes, 0, 0);
                
                if (new Date() > doseTime) {
                  const doseAdministered = marHistory.some(entry => 
                    entry.medicationid === med.id && 
                    entry.time === time && 
                    new Date(entry.date).toDateString() === today &&
                    entry.status === 'Given'
                  );
                  
                  if (!doseAdministered) {
                    hasMissedDoses = true;
                  }
                }
              });
            }
          });
          return hasMissedDoses;
        
        case 'high':
          if (meds.length === 0) return false;
          const avgCompliance = meds.reduce((sum, med) => sum + (med.compliance || 0), 0) / meds.length;
          return avgCompliance > 90;
        
        case 'review':
          if (meds.length === 0) return false;
          const avgComplianceReview = meds.reduce((sum, med) => sum + (med.compliance || 0), 0) / meds.length;
          return avgComplianceReview < 70;
        
        default:
          return true;
      }
    });
  };

  useEffect(() => {
    if (isLoaded && user && !profileLoading && userProfile) {
      if (canViewMedications) {
        fetchIndividuals();
      } else {
        setLoading(false);
      }
    }
  }, [isLoaded, user, profileLoading, userProfile]);

  useEffect(() => {
    if (selectedIndividual) {
      fetchMedications(selectedIndividual.id);
      fetchMARHistory(selectedIndividual.id);
      fetchWellnessData(selectedIndividual.id);
    }
  }, [selectedIndividual]);

  useEffect(() => {
    applyFilters();
  }, [individuals, activeFilters, statsFilter]);

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
      
      // Parse medications and marhistory from JSON strings
      const parsedData = (data || []).map(individual => ({
        ...individual,
        medications: parseJSONData(individual.medications) || [],
        marhistory: parseJSONData(individual.marhistory) || []
      }));
      
      setIndividuals(parsedData);
      
      // Calculate stats for all individuals
      const stats = calculateAllStats(parsedData);
      setMedicationStats(stats);
      
      // Apply initial filters
      applyFiltersWithData(parsedData);
    } catch (error) {
      console.error('Error fetching individuals:', error);
    } finally {
      setLoading(false);
    }
  };


const handleWellnessEntry = async (e) => {
  e.preventDefault();
  
  try {
    const newWellnessEntry = {
      id: Date.now().toString(),
      ...wellnessForm,
      created_date: new Date().toISOString(),
      created_by: userProfile.fullname,
      created_by_role: userProfile.role_name
    };

    const updatedWellness = [...wellnessData, newWellnessEntry];
    
    // Update in Supabase
    const { error } = await supabase
      .from('individuals')
      .update({ 
        wellness_data: updatedWellness,
        last_activity: new Date().toISOString()
      })
      .eq('id', selectedIndividual.id);

    if (error) throw error;

    // Update local state immediately
    setWellnessData(updatedWellness);
    
    // Update the individual in the individuals array
    setIndividuals(prev => prev.map(ind => 
      ind.id === selectedIndividual.id 
        ? { ...ind, wellness_data: updatedWellness } 
        : ind
    ));
    
    setShowWellnessModal(false);
    resetWellnessForm();
    alert('Wellness entry added successfully!');
  } catch (error) {
    console.error('Error adding wellness entry:', error);
    alert('Error adding wellness entry. Please try again.');
  }
};

const resetWellnessForm = () => {
  setWellnessForm({
    type: '',
    date: '',
    title: '',
    provider: '',
    location: '',
    notes: '',
    status: 'Scheduled',
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    oxygenSaturation: ''
  });
};


  const applyFiltersWithData = (data) => {
    let filtered = [...data];

    // Apply active filters first
    if (activeFilters.status !== 'All') {
      filtered = filtered.filter(ind => 
        ind.status?.toLowerCase() === activeFilters.status.toLowerCase()
      );
    }

    if (activeFilters.homeassignment !== 'All Homes') {
      filtered = filtered.filter(ind => 
        ind.homeassignment === activeFilters.homeassignment
      );
    }

    if (activeFilters.division !== 'All') {
      filtered = filtered.filter(ind => 
        ind.division === activeFilters.division
      );
    }

    if (activeFilters.medicationStatus !== 'All') {
      switch (activeFilters.medicationStatus) {
        case 'With Medications':
          filtered = filtered.filter(ind => 
            ind.medications && ind.medications.length > 0
          );
          break;
        case 'Without Medications':
          filtered = filtered.filter(ind => 
            !ind.medications || ind.medications.length === 0
          );
          break;
        case 'PRN Only':
          filtered = filtered.filter(ind => 
            ind.medications && ind.medications.some(med => med.prn)
          );
          break;
      }
    }

    if (activeFilters.searchTerm) {
      const searchLower = activeFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(ind => 
        ind.firstname?.toLowerCase().includes(searchLower) ||
        ind.lastname?.toLowerCase().includes(searchLower) ||
        ind.individualid?.toLowerCase().includes(searchLower) ||
        ind.homeassignment?.toLowerCase().includes(searchLower)
      );
    }

    // Apply stats filter if selected
    if (statsFilter) {
      filtered = filterIndividualsByStats(filtered, statsFilter);
    }

    setFilteredIndividuals(filtered);
  };

  const applyFilters = () => {
    applyFiltersWithData(individuals);
  };

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      status: 'All',
      homeassignment: 'All Homes',
      division: 'All',
      medicationStatus: 'All',
      searchTerm: ''
    });
    setStatsFilter(null);
    setSearchTerm('');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.status !== 'All') count++;
    if (activeFilters.homeassignment !== 'All Homes') count++;
    if (activeFilters.division !== 'All') count++;
    if (activeFilters.medicationStatus !== 'All') count++;
    if (activeFilters.searchTerm) count++;
    if (statsFilter) count++;
    return count;
  };

  const handleStatsFilterClick = (filterType) => {
    if (statsFilter === filterType) {
      setStatsFilter(null);
    } else {
      setStatsFilter(filterType);
    }
  };

  const fetchMedications = async (individualId) => {
    try {
      // Fetch from Supabase to get latest data
      const { data, error } = await supabase
        .from('individuals')
        .select('medications')
        .eq('id', individualId)
        .single();
      
      if (error) throw error;
      
      const medications = parseJSONData(data?.medications) || [];
      
      setMedications(medications);
      
      // Update local state
      setIndividuals(prev => prev.map(ind => 
        ind.id === individualId 
          ? { ...ind, medications } 
          : ind
      ));
    } catch (error) {
      console.error('Error fetching medications:', error);
      setMedications([]);
    }
  };

  const fetchMARHistory = async (individualId) => {
    try {
      const { data, error } = await supabase
        .from('individuals')
        .select('marhistory')
        .eq('id', individualId)
        .single();
      
      if (error) throw error;
      
      const marHistory = parseJSONData(data?.marhistory) || [];
      
      setMarHistory(marHistory);
      
      // Update local state
      setIndividuals(prev => prev.map(ind => 
        ind.id === individualId 
          ? { ...ind, marhistory: marHistory } 
          : ind
      ));
    } catch (error) {
      console.error('Error fetching MAR history:', error);
      setMarHistory([]);
    }
  };

  const handleAddMedication = async (e) => {
    e.preventDefault();
    
    if (!canAddMedications) {
      alert('You do not have permission to add medications.');
      return;
    }

    try {
      const newMedication = {
        id: Date.now().toString(),
        ...medicationForm,
        createddate: new Date().toISOString(),
        status: 'Active',
        compliance: 0,
        created_by: userProfile.fullname,
        created_by_role: userProfile.role_name
      };

      const updatedMedications = [...medications, newMedication];
      
      // Update in Supabase
      const { error } = await supabase
        .from('individuals')
        .update({ 
          medications: updatedMedications,
          last_activity: new Date().toISOString()
        })
        .eq('id', selectedIndividual.id);

      if (error) throw error;

      // Update local state immediately
      setMedications(updatedMedications);
      
      // Update the individual in the individuals array
      const updatedIndividuals = individuals.map(ind => 
        ind.id === selectedIndividual.id 
          ? { ...ind, medications: updatedMedications } 
          : ind
      );
      setIndividuals(updatedIndividuals);
      
      // Recalculate stats
      const stats = calculateAllStats(updatedIndividuals);
      setMedicationStats(stats);
      
      setShowAddModal(false);
      resetMedicationForm();
      alert('Medication added successfully!');
    } catch (error) {
      console.error('Error adding medication:', error);
      alert('Error adding medication. Please try again.');
    }
  };

  const handleDeleteMedication = async (medicationId) => {
    if (!canDeleteMedications) {
      alert('You do not have permission to delete medications.');
      return;
    }

    if (!confirm('Are you sure you want to delete this medication? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      
      // Filter out the medication to be deleted
      const updatedMedications = medications.filter(med => med.id !== medicationId);
      
      // Update in Supabase
      const { error } = await supabase
        .from('individuals')
        .update({ 
          medications: updatedMedications,
          last_activity: new Date().toISOString()
        })
        .eq('id', selectedIndividual.id);

      if (error) throw error;

      // Update local state
      setMedications(updatedMedications);
      
      // Update the individual in the individuals array
      const updatedIndividuals = individuals.map(ind => 
        ind.id === selectedIndividual.id 
          ? { ...ind, medications: updatedMedications } 
          : ind
      );
      setIndividuals(updatedIndividuals);
      
      // Recalculate stats
      const stats = calculateAllStats(updatedIndividuals);
      setMedicationStats(stats);
      
      alert('Medication deleted successfully!');
    } catch (error) {
      console.error('Error deleting medication:', error);
      alert('Error deleting medication. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectMedicationFromGuide = (medicationName) => {
    setMedicationForm({
      ...medicationForm,
      medicationname: medicationName
    });
    setShowMedGuide(false);
    setShowAddModal(true);
  };

  const handleMARentry = async (e) => {
    e.preventDefault();
    
    if (!canCreateMAREntries) {
      alert('You do not have permission to create MAR entries.');
      return;
    }

    try {
      const newMAREntry = {
        id: Date.now().toString(),
        ...marEntry,
        date: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        given_by: userProfile.fullname,
        given_by_role: userProfile.role_name,
        approved: canApproveMAREntries,
        approved_by: canApproveMAREntries ? userProfile.fullname : null,
        medication_name: medications.find(m => m.id === marEntry.medicationid)?.medicationname || ''
      };

      const updatedHistory = [...marHistory, newMAREntry];
      
      // Calculate updated compliance for the medication
      const updatedMedications = medications.map(med => {
        if (med.id === marEntry.medicationid) {
          const medHistory = [...marHistory, newMAREntry].filter(entry => 
            entry.medicationid === med.id && entry.status === 'Given'
          );
          const expectedDoses = 30; // Adjust based on your logic
          const compliance = Math.round((medHistory.length / expectedDoses) * 100);
          
          return { 
            ...med, 
            lastadministered: newMAREntry.date, 
            compliance: compliance > 100 ? 100 : compliance
          };
        }
        return med;
      });

      // Update in Supabase
      const { error } = await supabase
        .from('individuals')
        .update({ 
          medications: updatedMedications,
          marhistory: updatedHistory,
          last_activity: new Date().toISOString()
        })
        .eq('id', selectedIndividual.id);

      if (error) throw error;

      // Update local state immediately
      setMedications(updatedMedications);
      setMarHistory(updatedHistory);
      
      // Update the individual in the individuals array
      const updatedIndividuals = individuals.map(ind => 
        ind.id === selectedIndividual.id 
          ? { 
              ...ind, 
              medications: updatedMedications,
              marhistory: updatedHistory 
            } 
          : ind
      );
      setIndividuals(updatedIndividuals);
      
      // Recalculate stats
      const stats = calculateAllStats(updatedIndividuals);
      setMedicationStats(stats);
      
      setShowMARModal(false);
      resetMARForm();
      alert('MAR entry recorded successfully!');
    } catch (error) {
      console.error('Error recording MAR entry:', error);
      alert('Error recording MAR entry. Please try again.');
    }
  };

  const calculateCompliance = (medicationId) => {
    const medHistory = marHistory.filter(entry => 
      entry.medicationid === medicationId && 
      entry.status === 'Given'
    );
    const expectedDoses = 30;
    const compliance = Math.round((medHistory.length / expectedDoses) * 100);
    return compliance > 100 ? 100 : compliance;
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

  const resetMedicationForm = () => {
    setMedicationForm({
      medicationname: '',
      dosage: '',
      route: '',
      frequency: '',
      startdate: '',
      enddate: '',
      prescribedby: '',
      pharmacy: '',
      indication: '',
      specialinstructions: '',
      times: [],
      prn: false,
      prnreason: '',
      category: '',
      subcategory: ''
    });
  };

  const resetMARForm = () => {
    setMarEntry({
      medicationid: '',
      time: '',
      status: '',
      notes: '',
      givenby: '',
      refusedreason: '',
      heldreason: '',
      lateminutes: ''
    });
  };

  // Helper function to get all medication names from categories
  const getAllMedicationNames = () => {
    const allMeds = [];
    
    Object.values(DD_MEDICATION_CATEGORIES).forEach(category => {
      if (category.medications) {
        category.medications.forEach(med => allMeds.push(med));
      }
      
      if (category.subcategories) {
        Object.values(category.subcategories).forEach(subcat => {
          if (subcat.medications) {
            subcat.medications.forEach(med => allMeds.push(med));
          }
        });
      }
      
      if (category.rescueMeds?.medications) {
        category.rescueMeds.medications.forEach(med => allMeds.push(med));
      }
    });
    
    return [...new Set(allMeds)]; // Remove duplicates
  };

  // Filter Menu Component
  const FilterMenu = () => (
    <div className="absolute right-0 top-full mt-2 w-80 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white">Filter Individuals</h3>
          <button
            onClick={() => setShowFilterMenu(false)}
            className="p-1 hover:bg-slate-700 rounded-lg"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1">
            <input
              type="text"
              value={activeFilters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              placeholder="Search individuals..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          {getActiveFilterCount() > 0 && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg font-semibold transition-all"
            >
              Clear All
            </button>
          )}
        </div>
        {getActiveFilterCount() > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.status !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                Status: {activeFilters.status}
                <button onClick={() => handleFilterChange('status', 'All')}>
                  <X size={12} />
                </button>
              </span>
            )}
            {activeFilters.homeassignment !== 'All Homes' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                Home: {activeFilters.homeassignment}
                <button onClick={() => handleFilterChange('homeassignment', 'All Homes')}>
                  <X size={12} />
                </button>
              </span>
            )}
            {activeFilters.division !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                Division: {activeFilters.division}
                <button onClick={() => handleFilterChange('division', 'All')}>
                  <X size={12} />
                </button>
              </span>
            )}
            {activeFilters.medicationStatus !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                Meds: {activeFilters.medicationStatus}
                <button onClick={() => handleFilterChange('medicationStatus', 'All')}>
                  <X size={12} />
                </button>
              </span>
            )}
            {statsFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                Stats: {statsFilter === 'active' ? 'Active Meds' : 
                        statsFilter === 'missed' ? 'Missed Today' : 
                        statsFilter === 'high' ? 'High Compliance' : 'Review Required'}
                <button onClick={() => setStatsFilter(null)}>
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
      
      <ScrollArea className="max-h-96">
        <div className="p-4 space-y-6">
          {/* Status Filter */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <Activity size={14} />
              Status
            </h4>
            <div className="flex flex-wrap gap-2">
              {INDIVIDUAL_FILTER_OPTIONS.status.map(status => (
                <button
                  key={status}
                  onClick={() => handleFilterChange('status', status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeFilters.status === status
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/50'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Home Assignment Filter */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <Home size={14} />
              Home Assignment
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {INDIVIDUAL_FILTER_OPTIONS.homeassignment.map(home => (
                <button
                  key={home}
                  onClick={() => handleFilterChange('homeassignment', home)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium text-left transition-all ${
                    activeFilters.homeassignment === home
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {home}
                </button>
              ))}
            </div>
          </div>

          {/* Division Filter */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <Users size={14} />
              Division
            </h4>
            <div className="flex flex-wrap gap-2">
              {INDIVIDUAL_FILTER_OPTIONS.division.map(division => (
                <button
                  key={division}
                  onClick={() => handleFilterChange('division', division)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeFilters.division === division
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {division}
                </button>
              ))}
            </div>
          </div>

          {/* Medication Status Filter */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <Pill size={14} />
              Medication Status
            </h4>
            <div className="flex flex-wrap gap-2">
              {INDIVIDUAL_FILTER_OPTIONS.medicationStatus.map(status => (
                <button
                  key={status}
                  onClick={() => handleFilterChange('medicationStatus', status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeFilters.medicationStatus === status
                      ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/50'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">
            Showing {filteredIndividuals.length} of {individuals.length} individuals
          </span>
          <button
            onClick={() => setShowFilterMenu(false)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-all"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );

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
            placeholder="Search medications..." 
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
        
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Active Medications</span>
            <span className="text-xs text-blue-400 font-bold">
              {medicationStats.totalActiveMedications}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-1000" 
              style={{width: `${Math.min(100, (medicationStats.totalActiveMedications / (individuals.length * 5)) * 100)}%`}}>
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
                if (item.id !== 'medications') {
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

  // Medication Guide Modal Component
  const MedicationGuideModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
              <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">DD Residential Medication Guide</h3>
              <p className="text-slate-400 text-sm">Commonly prescribed medication categories for individuals with ID/DD</p>
              <p className="text-xs text-slate-500 mt-1">
                Note: This list represents commonly prescribed medication categories found in DD residential settings.
                It is not exhaustive and does not replace physician orders, MAR sheets, or pharmacy labels.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowMedGuide(false)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-all"
          >
            <X className="text-slate-400" size={24} />
          </button>
        </div>

        <ScrollArea className="h-[calc(90vh-180px)]">
          <div className="p-6">
            {/* Disclaimer Banner */}
            <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-red-400 mt-0.5" size={20} />
                <div>
                  <h4 className="text-white font-bold mb-1">Important Disclaimer</h4>
                  <p className="text-sm text-slate-300">
                    This list represents commonly prescribed medication categories found in DD residential settings.
                    It is not exhaustive and does not replace physician orders, MAR sheets, or pharmacy labels.
                    All medication administration must follow ADMH, HCBS, and facility-specific medication policies.
                  </p>
                </div>
              </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(DD_MEDICATION_CATEGORIES).map(([key, category]) => {
                const Icon = category.icon;
                return (
                  <div 
                    key={key}
                    className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl p-5 hover:border-${category.color.split('-')[1]}/50 transition-all duration-300 cursor-pointer hover:scale-105`}
                    onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-bold text-lg">{category.name}</h4>
                        {category.description && (
                          <p className="text-sm text-slate-400">{category.description}</p>
                        )}
                      </div>
                      <ChevronDown className={`text-slate-400 transition-transform ${selectedCategory === key ? 'rotate-180' : ''}`} />
                    </div>

                    {selectedCategory === key && (
                      <div className="mt-4 space-y-4 animate-in fade-in">
                        {/* Medications List */}
                        {category.medications && (
                          <div>
                            <h5 className="text-white font-semibold mb-2 flex items-center gap-2">
                              <PillIcon size={16} />
                              Common Medications
                            </h5>
                            <div className="grid grid-cols-1 gap-2">
                              {category.medications.map((med, idx) => (
                                <button
                                  key={idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectMedicationFromGuide(med);
                                  }}
                                  className="text-left bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 hover:text-white transition-all hover:border-emerald-500/50"
                                >
                                  {med}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Subcategories */}
                        {category.subcategories && Object.entries(category.subcategories).map(([subKey, subcat]) => (
                          <div key={subKey} className="border-t border-slate-700 pt-4">
                            <h5 className="text-white font-semibold mb-2">{subcat.name}</h5>
                            {subcat.description && (
                              <p className="text-sm text-slate-400 mb-2">{subcat.description}</p>
                            )}
                            {subcat.note && (
                              <p className="text-xs text-yellow-400 mb-2">{subcat.note}</p>
                            )}
                            <div className="grid grid-cols-1 gap-2">
                              {subcat.medications.map((med, idx) => (
                                <button
                                  key={idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectMedicationFromGuide(med);
                                  }}
                                  className="text-left bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 hover:text-white transition-all hover:border-emerald-500/50"
                                >
                                  {med}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* Rescue Medications */}
                        {category.rescueMeds && (
                          <div className="border-t border-slate-700 pt-4">
                            <h5 className="text-white font-semibold mb-2">{category.rescueMeds.name}</h5>
                            {category.rescueMeds.note && (
                              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-2">
                                <p className="text-xs text-red-400">{category.rescueMeds.note}</p>
                              </div>
                            )}
                            <div className="grid grid-cols-1 gap-2">
                              {category.rescueMeds.medications.map((med, idx) => (
                                <button
                                  key={idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectMedicationFromGuide(med);
                                  }}
                                  className="text-left bg-red-900/20 hover:bg-red-900/30 border border-red-500/30 rounded-lg p-3 text-sm text-red-300 hover:text-red-200 transition-all"
                                >
                                  <span className="font-semibold">⚠️ EMERGENCY:</span> {med}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Category Note */}
                        {category.note && (
                          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                            <p className="text-xs text-yellow-400">{category.note}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Add Section */}
            <div className="mt-8 p-5 bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/30 rounded-xl">
              <h4 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <ClipboardCheck size={20} />
                Quick Medication Select
              </h4>
              <p className="text-slate-400 text-sm mb-4">Select a medication to quickly add it to the current individual:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {getAllMedicationNames().slice(0, 12).map((med, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectMedicationFromGuide(med)}
                    className="bg-slate-800/50 hover:bg-emerald-900/30 border border-slate-700 hover:border-emerald-500/50 rounded-lg p-3 text-sm text-slate-300 hover:text-white transition-all text-left"
                  >
                    {med}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  // Permission Check - No Access Screen
  if (!profileLoading && !canViewMedications) {
    return (
      <div className="h-screen flex flex-col bg-slate-950 text-white">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
            <p className="text-slate-400 mb-6">
              You do not have permission to view medications. Please contact your administrator if you believe this is an error.
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
          <p className="text-slate-400 text-lg">Loading medications...</p>
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
                        Medication Management
                      </h2>
                      <div className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full">
                        <span className="text-blue-400 text-xs font-bold flex items-center gap-1">
                          <Pill size={12} /> MAR
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-lg">
                      MAR Module • IPMS Aligned Medication Tracking • DD Residential Guide
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => router.push('/')}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-slate-700"
                    >
                      <ChevronLeft size={18} />
                      Back to Home
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Active Medications */}
                  <div 
                    onClick={() => handleStatsFilterClick('active')}
                    className="group relative bg-gradient-to-br from-blue-600/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden cursor-pointer"
                  >
                    {statsFilter === 'active' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-cyan-500/10 animate-pulse rounded-2xl"></div>
                    )}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600 to-cyan-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                          <Pill className="text-white" size={26} />
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="text-blue-400" size={18} />
                          <span className="text-sm font-bold text-blue-400">
                            +{medicationStats.totalActiveMedications > 0 ? '5%' : '0%'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Active Medications</p>
                        <div className="flex items-end gap-2">
                          <p className="text-4xl font-black text-white">{medicationStats.totalActiveMedications}</p>
                          <Pill className="text-blue-400 mb-2" size={20} />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Across all {individuals.length} individuals
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* High Compliance */}
                  <div 
                    onClick={() => handleStatsFilterClick('high')}
                    className="group relative bg-gradient-to-br from-green-600/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 overflow-hidden cursor-pointer"
                  >
                    {statsFilter === 'high' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-500/10 animate-pulse rounded-2xl"></div>
                    )}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-600 to-emerald-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                          <CheckCircle className="text-white" size={26} />
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="text-green-400" size={18} />
                          <span className="text-sm font-bold text-green-400">
                            +{medicationStats.highComplianceCount > 0 ? '3%' : '0%'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">High Compliance</p>
                        <div className="flex items-end gap-2">
                          <p className="text-4xl font-black text-white">
                            {medicationStats.highComplianceCount}
                          </p>
                          <span className="text-lg font-bold text-green-400 mb-2">≥90%</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Individuals with excellent compliance
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Missed Today */}
                  <div 
                    onClick={() => handleStatsFilterClick('missed')}
                    className="group relative bg-gradient-to-br from-orange-600/20 to-red-500/20 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 overflow-hidden cursor-pointer"
                  >
                    {statsFilter === 'missed' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-500/10 animate-pulse rounded-2xl"></div>
                    )}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-600 to-red-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                          <AlertTriangle className="text-white" size={26} />
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="text-orange-400" size={18} />
                          <span className="text-sm font-bold text-orange-400">
                            +{medicationStats.missedDosesToday > 0 ? '8%' : '0%'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Missed Today</p>
                        <div className="flex items-end gap-2">
                          <p className="text-4xl font-black text-white">{medicationStats.missedDosesToday}</p>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Total missed doses across all individuals
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Review Required */}
                  <div 
                    onClick={() => handleStatsFilterClick('review')}
                    className="group relative bg-gradient-to-br from-purple-600/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden cursor-pointer"
                  >
                    {statsFilter === 'review' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-500/10 animate-pulse rounded-2xl"></div>
                    )}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                          <Eye className="text-white" size={26} />
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="text-purple-400" size={18} />
                          <span className="text-sm font-bold text-purple-400">
                            +{medicationStats.reviewRequiredCount > 0 ? '2%' : '0%'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Review Required</p>
                        <div className="flex items-end gap-2">
                          <p className="text-4xl font-black text-white">
                            {medicationStats.reviewRequiredCount}
                          </p>
                          <span className="text-lg font-bold text-purple-400 mb-2">≤70%</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Individuals needing compliance review
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Filter Status */}
                {statsFilter && (
                  <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-500/30 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center">
                          <Filter className="text-white" size={20} />
                        </div>
                        <div>
                          <h4 className="text-white font-bold">
                            Showing {statsFilter === 'active' ? 'Individuals with Active Medications' : 
                                     statsFilter === 'missed' ? 'Individuals with Missed Doses Today' : 
                                     statsFilter === 'high' ? 'Individuals with High Compliance (≥90%)' : 
                                     'Individuals Needing Review (≤70%)'}
                          </h4>
                          <p className="text-slate-400 text-sm">
                            {filteredIndividuals.length} individuals match this criteria
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setStatsFilter(null)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-semibold transition-all duration-300"
                      >
                        <X size={16} />
                        Clear Filter
                      </button>
                    </div>
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
                          <p className="text-slate-400">Choose an individual to manage their medications</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* Search and Filter Container */}
                          <div className="flex items-center gap-3">
                            <div className="relative flex items-center gap-3 bg-slate-900/50 rounded-xl px-5 py-3 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 group">
                              <Search size={20} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                              <input 
                                type="text"
                                value={activeFilters.searchTerm}
                                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                                placeholder="Search individuals..." 
                                className="bg-transparent border-none outline-none text-sm text-white w-64 placeholder:text-slate-500"
                              />
                            </div>
                            
                            {/* Filter Button */}
                            <div className="relative">
                              <button
                                onClick={() => setShowFilterMenu(!showFilterMenu)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                                  getActiveFilterCount() > 0
                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/50'
                                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                                }`}
                              >
                                <Filter size={18} />
                                Filter
                                {getActiveFilterCount() > 0 && (
                                  <span className="ml-1 px-1.5 py-0.5 bg-white text-emerald-600 text-xs rounded-full font-bold">
                                    {getActiveFilterCount()}
                                  </span>
                                )}
                              </button>
                              
                              {/* Filter Menu */}
                              {showFilterMenu && <FilterMenu />}
                            </div>
                            
                            {/* Clear Filters Button (visible when filters are active) */}
                            {getActiveFilterCount() > 0 && (
                              <button
                                onClick={clearAllFilters}
                                className="flex items-center gap-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-red-500/30"
                              >
                                <X size={18} />
                                Clear Filters
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Filter Summary */}
                      {getActiveFilterCount() > 0 && (
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-slate-400">
                              Showing {filteredIndividuals.length} of {individuals.length} individuals
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-emerald-400 font-semibold">
                                Active Filters:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {activeFilters.status !== 'All' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                                    Status: {activeFilters.status}
                                  </span>
                                )}
                                {activeFilters.homeassignment !== 'All Homes' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                                    Home: {activeFilters.homeassignment}
                                  </span>
                                )}
                                {activeFilters.division !== 'All' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                                    Division: {activeFilters.division}
                                  </span>
                                )}
                                {activeFilters.medicationStatus !== 'All' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                    Meds: {activeFilters.medicationStatus}
                                  </span>
                                )}
                                {statsFilter && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                                    Stats: {statsFilter === 'active' ? 'Active Meds' : 
                                            statsFilter === 'missed' ? 'Missed Today' : 
                                            statsFilter === 'high' ? 'High Compliance' : 'Review Required'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-500"
                              style={{ width: `${(filteredIndividuals.length / individuals.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <ScrollArea className="h-[400px]">
                        {filteredIndividuals.length === 0 ? (
                          <div className="text-center py-16">
                            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h4 className="text-xl font-bold text-slate-400 mb-2">No individuals found</h4>
                            <p className="text-slate-500 mb-4">Try adjusting your search or filters</p>
                            <button
                              onClick={clearAllFilters}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all"
                            >
                              Clear All Filters
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredIndividuals.map((individual, idx) => {
                              const individualMeds = individual.medications || [];
                              const individualMarHistory = individual.marhistory || [];
                              const today = new Date().toDateString();
                              
                              // Calculate individual stats
                              const activeMedCount = individualMeds.filter(med => med.status === 'Active').length;
                              let missedDoses = 0;
                              let avgCompliance = 0;
                              
                              if (individualMeds.length > 0) {
                                // Calculate missed doses for today
                                individualMeds.forEach(med => {
                                  if (med.times) {
                                    med.times.forEach(time => {
                                      const [hours, minutes] = time.split(':').map(Number);
                                      const doseTime = new Date();
                                      doseTime.setHours(hours, minutes, 0, 0);
                                      
                                      if (new Date() > doseTime) {
                                        const doseAdministered = individualMarHistory.some(entry => 
                                          entry.medicationid === med.id && 
                                          entry.time === time && 
                                          new Date(entry.date).toDateString() === today &&
                                          entry.status === 'Given'
                                        );
                                        
                                        if (!doseAdministered) {
                                          missedDoses++;
                                        }
                                      }
                                    });
                                  }
                                });
                                
                                // Calculate average compliance
                                avgCompliance = individualMeds.reduce((sum, med) => sum + (med.compliance || 0), 0) / individualMeds.length;
                              }
                              
                              return (
                                <div
                                  key={individual.id}
                                  onClick={() => {
                                    setSelectedIndividual(individual);
                                  }}
                                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 cursor-pointer hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 group"
                                >
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${getColorClass(idx)} rounded-xl flex items-center justify-center text-white font-bold`}>
                                      {getInitials(individual.firstname, individual.lastname)}
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="text-white font-semibold group-hover:text-emerald-400 transition-colors">
                                        {individual.firstname} {individual.lastname}
                                      </h3>
                                      <p className="text-slate-400 text-sm">ID: {individual.individualid}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                          individual.status === 'Active' ? 'bg-green-900/30 text-green-400' : 
                                          individual.status === 'Pending' ? 'bg-yellow-900/30 text-yellow-400' :
                                          individual.status === 'Inactive' ? 'bg-red-900/30 text-red-400' :
                                          'bg-blue-900/30 text-blue-400'
                                        }`}>
                                          {individual.status}
                                        </span>
                                        <span className="px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded-full">
                                          {individual.homeassignment}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Individual Stats */}
                                  <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="bg-slate-900/50 rounded-lg p-2">
                                      <p className="text-xs text-slate-400">Active Meds</p>
                                      <p className="text-white font-bold">{activeMedCount}</p>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-lg p-2">
                                      <p className="text-xs text-slate-400">Missed Today</p>
                                      <p className={`font-bold ${missedDoses > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                        {missedDoses}
                                      </p>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-lg p-2">
                                      <p className="text-xs text-slate-400">Compliance</p>
                                      <p className={`font-bold ${
                                        avgCompliance >= 90 ? 'text-green-400' :
                                        avgCompliance >= 70 ? 'text-yellow-400' : 'text-red-400'
                                      }`}>
                                        {Math.round(avgCompliance)}%
                                      </p>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-lg p-2">
                                      <p className="text-xs text-slate-400">PRN</p>
                                      <p className="text-white font-bold">
                                        {individualMeds.filter(med => med.prn).length}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      <Pill size={14} className="text-slate-500" />
                                      <span className="text-slate-400">
                                        {individualMeds.length} total medications
                                      </span>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                      individual.division === 'DD' ? 'bg-purple-900/30 text-purple-400' :
                                      individual.division === 'MI' ? 'bg-blue-900/30 text-blue-400' :
                                      'bg-orange-900/30 text-orange-400'
                                    }`}>
                                      {individual.division}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </ScrollArea>
                    </>
                  ) : (
                    <>
                      {/* Selected Individual Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                            {getInitials(selectedIndividual.firstname, selectedIndividual.lastname)}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white">
                              {selectedIndividual.firstname} {selectedIndividual.lastname}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-slate-400">ID: {selectedIndividual.individualid}</p>
                              <span className="text-slate-600">•</span>
                              <p className="text-slate-400">{selectedIndividual.homeassignment}</p>
                              <span className="text-slate-600">•</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                selectedIndividual.status === 'Active' ? 'bg-green-900/30 text-green-400' : 
                                selectedIndividual.status === 'Pending' ? 'bg-yellow-900/30 text-yellow-400' :
                                selectedIndividual.status === 'Inactive' ? 'bg-red-900/30 text-red-400' :
                                'bg-blue-900/30 text-blue-400'
                              }`}>
                                {selectedIndividual.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedIndividual(null)}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all duration-300"
                          >
                            Change Individual
                          </button>
                          
                          {/* Medication Guide Button */}
                          <button
                            onClick={() => setShowMedGuide(true)}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
                          >
                            <BookOpen size={18} />
                            Medication Guide
                          </button>
                          
                          {canAddMedications && (
                            <button
                              onClick={() => setShowAddModal(true)}
                              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300"
                            >
                              <Plus size={18} />
                              Add Medication
                            </button>
                          )}

                           <button
      onClick={() => setShowWellnessModal(true)}
      className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-2xl hover:shadow-pink-500/50 transition-all duration-300"
    >
      <Plus size={18} />
      Add Wellness
    </button>
                        </div>
                      </div>

                      {/* Medications List */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-white">Active Medications</h3>
                            <p className="text-slate-400">Manage medication schedules and MAR entries</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {canCreateMAREntries && (
                              <button
                                onClick={() => setShowMARModal(true)}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105"
                              >
                                <FileText size={18} />
                                MAR Entry
                              </button>
                            )}
                          </div>
                        </div>

                        {medications.length === 0 ? (
                          <div className="text-center py-16">
                            <Pill className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h4 className="text-xl font-bold text-slate-400 mb-2">No medications found</h4>
                            <p className="text-slate-500">Add the first medication to get started</p>
                          </div>
                        ) : (
                          <ScrollArea className="h-[500px]">
                            <div className="space-y-4">
                              {medications.map((medication) => {
                                // Check if this dose was administered today
                                const today = new Date().toDateString();
                                const isDoseAdministeredToday = (time) => {
                                  return marHistory.some(entry => 
                                    entry.medicationid === medication.id && 
                                    entry.time === time && 
                                    new Date(entry.date).toDateString() === today &&
                                    entry.status === 'Given'
                                  );
                                };
                                
                                return (
                                  <div key={medication.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-emerald-500/30 transition-all duration-300">
                                    <div className="flex items-start justify-between mb-4">
                                      <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                                          <Pill className="text-white" size={24} />
                                        </div>
                                        <div>
                                          <h4 className="text-white font-bold text-lg">{medication.medicationname}</h4>
                                          <p className="text-slate-400">{medication.dosage} • {medication.route} • {medication.frequency}</p>
                                          {medication.category && (
                                            <div className="flex items-center gap-2 mt-1">
                                              <span className="px-2 py-0.5 bg-purple-900/30 text-purple-400 text-xs rounded-full">
                                                {medication.category}
                                              </span>
                                              {medication.prn && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-900/30 text-yellow-400 text-xs rounded-full">
                                                  <AlertCircle size={12} />
                                                  PRN
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="text-right">
                                          <p className="text-sm text-slate-400">Compliance</p>
                                          <p className={`text-lg font-bold ${
                                            medication.compliance >= 90 ? 'text-green-400' :
                                            medication.compliance >= 70 ? 'text-yellow-400' : 'text-red-400'
                                          }`}>
                                            {medication.compliance || 0}%
                                          </p>
                                        </div>
                                        {canDeleteMedications && (
                                          <button
                                            onClick={() => handleDeleteMedication(medication.id)}
                                            disabled={isDeleting}
                                            className="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            {isDeleting ? (
                                              <Loader2 size={16} className="text-red-400 animate-spin" />
                                            ) : (
                                              <Trash2 size={16} className="text-red-400" />
                                            )}
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                      <div>
                                        <p className="text-slate-400 text-sm">Indication</p>
                                        <p className="text-white text-sm">{medication.indication || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <p className="text-slate-400 text-sm">Prescribed By</p>
                                        <p className="text-white text-sm">{medication.prescribedby || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <p className="text-slate-400 text-sm">Start Date</p>
                                        <p className="text-white text-sm">{medication.startdate ? new Date(medication.startdate).toLocaleDateString() : 'N/A'}</p>
                                      </div>
                                      <div>
                                        <p className="text-slate-400 text-sm">Status</p>
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                                          medication.status === 'Active' ? 'bg-green-900/30 text-green-400' :
                                          medication.status === 'On Hold' ? 'bg-yellow-900/30 text-yellow-400' :
                                          'bg-red-900/30 text-red-400'
                                        }`}>
                                          {medication.status || 'Active'}
                                        </span>
                                      </div>
                                    </div>

                                    {medication.specialinstructions && (
                                      <div className="mb-4">
                                        <p className="text-slate-400 text-sm mb-1">Special Instructions</p>
                                        <p className="text-white text-sm bg-slate-800 rounded-lg p-2">{medication.specialinstructions}</p>
                                      </div>
                                    )}

                                    {/* Time Block MAR */}
                                    <div className="border-t border-slate-700 pt-4">
                                      <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                                        <Clock size={16} />
                                        Today's MAR Schedule
                                      </h5>
                                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                        {timeBlocks.map(time => {
                                          const isAdministered = isDoseAdministeredToday(time);
                                          const isScheduled = medication.times?.includes(time);
                                          
                                          if (!isScheduled) return null;
                                          
                                          return (
                                            <div
                                              key={time}
                                              className={`p-3 rounded-lg border text-center transition-all duration-300 ${
                                                isAdministered
                                                  ? 'bg-green-900/30 border-green-500/50 text-green-400'
                                                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-emerald-500/50 cursor-pointer hover:scale-105'
                                              }`}
                                              onClick={() => {
                                                if (!isAdministered && canCreateMAREntries) {
                                                  setMarEntry({
                                                    ...marEntry,
                                                    medicationid: medication.id,
                                                    time: time
                                                  });
                                                  setShowMARModal(true);
                                                }
                                              }}
                                            >
                                              <p className="text-sm font-semibold">{time}</p>
                                              <p className="text-xs mt-1">
                                                {isAdministered ? 'Given' : 'Due'}
                                              </p>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </ScrollArea>
                        )}
                      </div>



{/* Wellness Monitoring Section */}
<div className="mt-2">
  <div className="flex items-center justify-between mb-6">
    <div>
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        <Stethoscope size={24} className="text-pink-400" />
        Wellness Monitoring
      </h3>
      <p className="text-slate-400">Track appointments, medical history, and vital signs</p>
    </div>
  </div>

  {/* Wellness Stats Cards */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div className="bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <Calendar className="text-blue-400" size={24} />
        <div>
          <p className="text-slate-400 text-sm">Upcoming Appointments</p>
          <p className="text-white text-2xl font-bold">
            {wellnessData.filter(w => w.type === 'appointment' && w.status === 'Scheduled').length}
          </p>
        </div>
      </div>
    </div>
    
    <div className="bg-gradient-to-br from-green-600/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <FileText className="text-green-400" size={24} />
        <div>
          <p className="text-slate-400 text-sm">Medical History Records</p>
          <p className="text-white text-2xl font-bold">
            {wellnessData.filter(w => w.type === 'medical_history').length}
          </p>
        </div>
      </div>
    </div>
    
    <div className="bg-gradient-to-br from-purple-600/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <HeartPulse className="text-purple-400" size={24} />
        <div>
          <p className="text-slate-400 text-sm">Vital Signs Recorded</p>
          <p className="text-white text-2xl font-bold">
            {wellnessData.filter(w => w.type === 'vital_signs').length}
          </p>
        </div>
      </div>
    </div>
  </div>

  {/* Wellness Entries List */}
  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
    {wellnessData.length === 0 ? (
      <div className="text-center py-12">
        <Stethoscope className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h4 className="text-xl font-bold text-slate-400 mb-2">No wellness records found</h4>
        <p className="text-slate-500">Add appointments, medical history, or vital signs</p>
      </div>
    ) : (
      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {wellnessData
            .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
            .map((entry) => (
              <div key={entry.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-pink-500/30 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      entry.type === 'appointment' ? 'bg-blue-600/20' :
                      entry.type === 'medical_history' ? 'bg-green-600/20' :
                      'bg-purple-600/20'
                    }`}>
                      {entry.type === 'appointment' && <Calendar className="text-blue-400" size={20} />}
                      {entry.type === 'medical_history' && <FileText className="text-green-400" size={20} />}
                      {entry.type === 'vital_signs' && <HeartPulse className="text-purple-400" size={20} />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-bold">{entry.title}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          entry.type === 'appointment' ? 'bg-blue-900/30 text-blue-400' :
                          entry.type === 'medical_history' ? 'bg-green-900/30 text-green-400' :
                          'bg-purple-900/30 text-purple-400'
                        }`}>
                          {entry.type.replace('_', ' ').toUpperCase()}
                        </span>
                        {entry.status && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            entry.status === 'Scheduled' ? 'bg-yellow-900/30 text-yellow-400' :
                            entry.status === 'Completed' ? 'bg-green-900/30 text-green-400' :
                            'bg-red-900/30 text-red-400'
                          }`}>
                            {entry.status}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-2 text-sm">
                        {entry.date && (
                          <div>
                            <p className="text-slate-400">Date</p>
                            <p className="text-white">{new Date(entry.date).toLocaleDateString()}</p>
                          </div>
                        )}
                        {entry.provider && (
                          <div>
                            <p className="text-slate-400">Provider</p>
                            <p className="text-white">{entry.provider}</p>
                          </div>
                        )}
                        {entry.location && (
                          <div>
                            <p className="text-slate-400">Location</p>
                            <p className="text-white">{entry.location}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Vital Signs Display */}
                      {entry.type === 'vital_signs' && (
                        <div className="grid grid-cols-3 gap-3 mt-3 p-3 bg-slate-800 rounded-lg">
                          {entry.bloodPressure && (
                            <div>
                              <p className="text-slate-400 text-xs">Blood Pressure</p>
                              <p className="text-white font-semibold">{entry.bloodPressure}</p>
                            </div>
                          )}
                          {entry.heartRate && (
                            <div>
                              <p className="text-slate-400 text-xs">Heart Rate</p>
                              <p className="text-white font-semibold">{entry.heartRate} bpm</p>
                            </div>
                          )}
                          {entry.temperature && (
                            <div>
                              <p className="text-slate-400 text-xs">Temperature</p>
                              <p className="text-white font-semibold">{entry.temperature}°F</p>
                            </div>
                          )}
                          {entry.weight && (
                            <div>
                              <p className="text-slate-400 text-xs">Weight</p>
                              <p className="text-white font-semibold">{entry.weight} lbs</p>
                            </div>
                          )}
                          {entry.height && (
                            <div>
                              <p className="text-slate-400 text-xs">Height</p>
                              <p className="text-white font-semibold">{entry.height}</p>
                            </div>
                          )}
                          {entry.oxygenSaturation && (
                            <div>
                              <p className="text-slate-400 text-xs">O2 Saturation</p>
                              <p className="text-white font-semibold">{entry.oxygenSaturation}%</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {entry.notes && (
                        <div className="mt-2">
                          <p className="text-slate-400 text-xs mb-1">Notes</p>
                          <p className="text-slate-300 text-sm bg-slate-800 rounded p-2">{entry.notes}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                        <User size={12} />
                        <span>Added by {entry.created_by}</span>
                        <span>•</span>
                        <span>{new Date(entry.created_date).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {canDeleteMedications && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this wellness entry?')) {
                          const updated = wellnessData.filter(w => w.id !== entry.id);
                          supabase
                            .from('individuals')
                            .update({ wellness_data: updated })
                            .eq('id', selectedIndividual.id)
                            .then(() => {
                              setWellnessData(updated);
                              alert('Wellness entry deleted successfully!');
                            });
                        }
                      }}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </ScrollArea>
    )}
  </div>
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
                        </div>
                      </div>
                    )}
                  </div>



{/* Wellness Entry Modal */}
{showWellnessModal && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-rose-500 rounded-xl flex items-center justify-center">
            <Stethoscope className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Add Wellness Entry</h3>
            <p className="text-slate-400 text-sm">Track appointments, medical history, or vital signs</p>
          </div>
        </div>
        <button 
          onClick={() => setShowWellnessModal(false)}
          className="p-2 hover:bg-slate-700 rounded-lg transition-all"
        >
          <X className="text-slate-400" size={24} />
        </button>
      </div>

      <ScrollArea className="h-[calc(90vh-180px)]">
        <form onSubmit={handleWellnessEntry} className="p-6 space-y-6">
          {/* Entry Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Entry Type *</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setWellnessForm({...wellnessForm, type: 'appointment'})}
                className={`p-4 rounded-xl border-2 transition-all ${
                  wellnessForm.type === 'appointment'
                    ? 'border-blue-500 bg-blue-600/20'
                    : 'border-slate-600 hover:border-slate-500 bg-slate-900/50'
                }`}
              >
                <Calendar className={`mx-auto mb-2 ${wellnessForm.type === 'appointment' ? 'text-blue-400' : 'text-slate-400'}`} size={24} />
                <p className={`text-sm font-semibold ${wellnessForm.type === 'appointment' ? 'text-white' : 'text-slate-400'}`}>Appointment</p>
              </button>
              
              <button
                type="button"
                onClick={() => setWellnessForm({...wellnessForm, type: 'medical_history'})}
                className={`p-4 rounded-xl border-2 transition-all ${
                  wellnessForm.type === 'medical_history'
                    ? 'border-green-500 bg-green-600/20'
                    : 'border-slate-600 hover:border-slate-500 bg-slate-900/50'
                }`}
              >
                <FileText className={`mx-auto mb-2 ${wellnessForm.type === 'medical_history' ? 'text-green-400' : 'text-slate-400'}`} size={24} />
                <p className={`text-sm font-semibold ${wellnessForm.type === 'medical_history' ? 'text-white' : 'text-slate-400'}`}>Medical History</p>
              </button>
              
              <button
                type="button"
                onClick={() => setWellnessForm({...wellnessForm, type: 'vital_signs'})}
                className={`p-4 rounded-xl border-2 transition-all ${
                  wellnessForm.type === 'vital_signs'
                    ? 'border-purple-500 bg-purple-600/20'
                    : 'border-slate-600 hover:border-slate-500 bg-slate-900/50'
                }`}
              >
                <HeartPulse className={`mx-auto mb-2 ${wellnessForm.type === 'vital_signs' ? 'text-purple-400' : 'text-slate-400'}`} size={24} />
                <p className={`text-sm font-semibold ${wellnessForm.type === 'vital_signs' ? 'text-white' : 'text-slate-400'}`}>Vital Signs</p>
              </button>
            </div>
          </div>

          {wellnessForm.type && (
            <>
              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={wellnessForm.title}
                    onChange={(e) => setWellnessForm({...wellnessForm, title: e.target.value})}
                    required
                    placeholder={
                      wellnessForm.type === 'appointment' ? 'e.g., Annual Physical' :
                      wellnessForm.type === 'medical_history' ? 'e.g., Diagnosis Update' :
                      'e.g., Weekly Vitals Check'
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Date *</label>
                  <input
                    type="date"
                    value={wellnessForm.date}
                    onChange={(e) => setWellnessForm({...wellnessForm, date: e.target.value})}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-all"
                  />
                </div>

                {wellnessForm.type === 'appointment' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                    <select
                      value={wellnessForm.status}
                      onChange={(e) => setWellnessForm({...wellnessForm, status: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-all"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="No Show">No Show</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Provider/Doctor</label>
                  <input
                    type="text"
                    value={wellnessForm.provider}
                    onChange={(e) => setWellnessForm({...wellnessForm, provider: e.target.value})}
                    placeholder="e.g., Dr. Smith"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                  <input
                    type="text"
                    value={wellnessForm.location}
                    onChange={(e) => setWellnessForm({...wellnessForm, location: e.target.value})}
                    placeholder="e.g., Main Street Clinic"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-all"
                  />
                </div>
              </div>

              {/* Vital Signs Fields */}
              {wellnessForm.type === 'vital_signs' && (
                <div>
                  <h4 className="text-lg font-bold text-purple-400 mb-4">Vital Signs</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Blood Pressure</label>
                      <input
                        type="text"
                        value={wellnessForm.bloodPressure}
                        onChange={(e) => setWellnessForm({...wellnessForm, bloodPressure: e.target.value})}
                        placeholder="120/80"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Heart Rate (bpm)</label>
                      <input
                        type="number"
                        value={wellnessForm.heartRate}
                        onChange={(e) => setWellnessForm({...wellnessForm, heartRate: e.target.value})}
                        placeholder="72"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Temperature (°F)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={wellnessForm.temperature}
                        onChange={(e) => setWellnessForm({...wellnessForm, temperature: e.target.value})}
                        placeholder="98.6"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Weight (lbs)</label>
                      <input
                        type="number"
                        value={wellnessForm.weight}
                        onChange={(e) => setWellnessForm({...wellnessForm, weight: e.target.value})}
                        placeholder="150"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Height</label>
                      <input
                        type="text"
                        value={wellnessForm.height}
                        onChange={(e) => setWellnessForm({...wellnessForm, height: e.target.value})}
                        placeholder="5'8\"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">O2 Saturation (%)</label>
                      <input
                        type="number"
                        value={wellnessForm.oxygenSaturation}
                        onChange={(e) => setWellnessForm({...wellnessForm, oxygenSaturation: e.target.value})}
                        placeholder="98"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                <textarea
                  value={wellnessForm.notes}
                  onChange={(e) => setWellnessForm({...wellnessForm, notes: e.target.value})}
                  rows="4"
                  placeholder="Additional details, observations, or instructions..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-all resize-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowWellnessModal(false)}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-pink-500/50 transition-all"
                >
                  <Save size={18} />
                  Save Entry
                </button>
              </div>
            </>
          )}
        </form>
      </ScrollArea>
    </div>
  </div>
)}







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

                </>
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

      {/* Medication Guide Modal */}
      {showMedGuide && <MedicationGuideModal />}

      {/* Add Medication Modal */}
      {showAddModal && canAddMedications && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Plus className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Add New Medication</h3>
                  <p className="text-slate-400 text-sm">Enter medication information</p>
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
              <form onSubmit={handleAddMedication} className="p-6 space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <Pill size={20} />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">Medication Name *</label>
                      <input
                        type="text"
                        value={medicationForm.medicationname}
                        onChange={(e) => setMedicationForm({...medicationForm, medicationname: e.target.value})}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Dosage *</label>
                      <input
                        type="text"
                        value={medicationForm.dosage}
                        onChange={(e) => setMedicationForm({...medicationForm, dosage: e.target.value})}
                        required
                        placeholder="e.g., 10mg, 1 tablet"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Route *</label>
                      <select
                        value={medicationForm.route}
                        onChange={(e) => setMedicationForm({...medicationForm, route: e.target.value})}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      >
                        <option value="">Select Route</option>
                        {routes.map(route => (
                          <option key={route} value={route}>{route}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Frequency *</label>
                      <select
                        value={medicationForm.frequency}
                        onChange={(e) => setMedicationForm({...medicationForm, frequency: e.target.value})}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      >
                        <option value="">Select Frequency</option>
                        {frequencies.map(freq => (
                          <option key={freq} value={freq}>{freq}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                      <select
                        value={medicationForm.category}
                        onChange={(e) => setMedicationForm({...medicationForm, category: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      >
                        <option value="">Select Category</option>
                        {Object.entries(DD_MEDICATION_CATEGORIES).map(([key, category]) => (
                          <option key={key} value={key}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Subcategory</label>
                      <input
                        type="text"
                        value={medicationForm.subcategory}
                        onChange={(e) => setMedicationForm({...medicationForm, subcategory: e.target.value})}
                        placeholder="e.g., Atypical Antipsychotics"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">PRN Medication</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setMedicationForm({...medicationForm, prn: !medicationForm.prn})}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            medicationForm.prn 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {medicationForm.prn ? 'Yes' : 'No'}
                        </button>
                        {medicationForm.prn && (
                          <input
                            type="text"
                            value={medicationForm.prnreason}
                            onChange={(e) => setMedicationForm({...medicationForm, prnreason: e.target.value})}
                            placeholder="PRN reason"
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scheduling */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <Calendar size={20} />
                    Schedule
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Administration Times</label>
                      <div className="grid grid-cols-3 gap-2">
                        {timeBlocks.map(time => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => {
                              const times = medicationForm.times.includes(time)
                                ? medicationForm.times.filter(t => t !== time)
                                : [...medicationForm.times, time];
                              setMedicationForm({...medicationForm, times});
                            }}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                              medicationForm.times.includes(time)
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Start Date *</label>
                        <input
                          type="date"
                          value={medicationForm.startdate}
                          onChange={(e) => setMedicationForm({...medicationForm, startdate: e.target.value})}
                          required
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
                        <input
                          type="date"
                          value={medicationForm.enddate}
                          onChange={(e) => setMedicationForm({...medicationForm, enddate: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prescriber Information */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <User size={20} />
                    Prescriber & Pharmacy
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Prescribed By *</label>
                      <input
                        type="text"
                        value={medicationForm.prescribedby}
                        onChange={(e) => setMedicationForm({...medicationForm, prescribedby: e.target.value})}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Pharmacy</label>
                      <input
                        type="text"
                        value={medicationForm.pharmacy}
                        onChange={(e) => setMedicationForm({...medicationForm, pharmacy: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <FileText size={20} />
                    Additional Information
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Indication</label>
                      <input
                        type="text"
                        value={medicationForm.indication}
                        onChange={(e) => setMedicationForm({...medicationForm, indication: e.target.value})}
                        placeholder="Reason for medication"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Special Instructions</label>
                      <textarea
                        value={medicationForm.specialinstructions}
                        onChange={(e) => setMedicationForm({...medicationForm, specialinstructions: e.target.value})}
                        rows="3"
                        placeholder="Any special administration instructions"
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
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300"
                  >
                    <Save size={18} />
                    Save Medication
                  </button>
                </div>
              </form>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* MAR Entry Modal */}
      {showMARModal && canCreateMAREntries && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">MAR Entry</h3>
                  <p className="text-slate-400 text-sm">Medication Administration Record</p>
                </div>
              </div>
              <button 
                onClick={() => setShowMARModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="text-slate-400" size={24} />
              </button>
            </div>

            <form onSubmit={handleMARentry} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Medication</label>
                  <select
                    value={marEntry.medicationid}
                    onChange={(e) => setMarEntry({...marEntry, medicationid: e.target.value})}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="">Select Medication</option>
                    {medications.map(med => (
                      <option key={med.id} value={med.id}>{med.medicationname} - {med.dosage}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Time</label>
                  <select
                    value={marEntry.time}
                    onChange={(e) => setMarEntry({...marEntry, time: e.target.value})}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="">Select Time</option>
                    {timeBlocks.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    value={marEntry.status}
                    onChange={(e) => setMarEntry({...marEntry, status: e.target.value})}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="">Select Status</option>
                    <option value="Given">Given</option>
                    <option value="Refused">Refused</option>
                    <option value="Held">Held</option>
                    <option value="Late">Late</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Given By</label>
                  <input
                    type="text"
                    value={marEntry.givenby}
                    onChange={(e) => setMarEntry({...marEntry, givenby: e.target.value})}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                {marEntry.status === 'Refused' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Refusal Reason</label>
                    <input
                      type="text"
                      value={marEntry.refusedreason}
                      onChange={(e) => setMarEntry({...marEntry, refusedreason: e.target.value})}
                      required
                      placeholder="Reason for refusal"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                )}
                {marEntry.status === 'Held' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Hold Reason</label>
                    <input
                      type="text"
                      value={marEntry.heldreason}
                      onChange={(e) => setMarEntry({...marEntry, heldreason: e.target.value})}
                      required
                      placeholder="Reason for holding dose"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                )}
                {marEntry.status === 'Late' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Minutes Late</label>
                    <input
                      type="number"
                      value={marEntry.lateminutes}
                      onChange={(e) => setMarEntry({...marEntry, lateminutes: e.target.value})}
                      required
                      placeholder="e.g., 15"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                  <textarea
                    value={marEntry.notes}
                    onChange={(e) => setMarEntry({...marEntry, notes: e.target.value})}
                    rows="3"
                    placeholder="Additional notes..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    if (marEntry.status === 'Refused' || marEntry.status === 'Held' || marEntry.status === 'Late') {
                      alert(`Med error incident created: ${marEntry.status}\nDetails: ${marEntry.notes}`);
                    }
                    setShowMARModal(false);
                  }}
                  className="px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 rounded-lg font-semibold transition-all flex items-center gap-2"
                >
                  <AlertTriangle size={16} />
                  Create Incident
                </button>
                <button
                  type="button"
                  onClick={() => setShowMARModal(false)}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-blue-500/50 transition-all"
                >
                  <Save size={18} />
                  Record Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}





      
    </div>
  );
};

export default MedicationsPage;