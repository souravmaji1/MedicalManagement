'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Type, X, Download, Move } from 'lucide-react';

export default function PDFSignature() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPages, setPdfPages] = useState([]);
  const [signatures, setSignatures] = useState([]);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [selectedFont, setSelectedFont] = useState('cursive');
  const [draggedSignature, setDraggedSignature] = useState(null);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
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

  useEffect(() => {
    // Load PDF.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    document.body.appendChild(script);

    // Load jsPDF from CDN
    const jsPDFScript = document.createElement('script');
    jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    jsPDFScript.async = true;
    document.body.appendChild(jsPDFScript);

    return () => {
      document.body.removeChild(script);
      if (document.body.contains(jsPDFScript)) {
        document.body.removeChild(jsPDFScript);
      }
    };
  }, []);

  useEffect(() => {
    if (pdfFile && window.pdfjsLib) {
      renderPDF();
    }
  }, [pdfFile]);

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
        // Render all pages
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

  const downloadPDF = async () => {
    if (!canvasRef.current || pdfPages.length === 0 || !window.jspdf) return;

    const { jsPDF } = window.jspdf;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Use first page dimensions for PDF setup
    const firstPage = pdfPages[0];
    const pdfWidth = firstPage.width * 0.264583; // Convert pixels to mm
    const pdfHeight = firstPage.height * 0.264583;
    
    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [pdfWidth, pdfHeight]
    });

    // Process each page
    for (let i = 0; i < pdfPages.length; i++) {
      const page = pdfPages[i];
      
      // Set canvas size for this page
      canvas.width = page.width;
      canvas.height = page.height;
      
      // Load and draw the page image
      const img = new Image();
      img.src = page.dataUrl;
      
      await new Promise((resolve) => {
        img.onload = () => {
          // Draw PDF page
          ctx.drawImage(img, 0, 0);
          
          // Get the rendered page dimensions from DOM
          const pageElement = pageRefs.current[i];
          const displayedWidth = pageElement ? pageElement.offsetWidth : page.width;
          const scaleRatio = page.width / displayedWidth;
          
          // Draw signatures only for this specific page
          const pageSignatures = signatures.filter(sig => sig.page === i);
          pageSignatures.forEach(sig => {
            ctx.font = `48px ${getFontFamily(sig.font)}`;
            ctx.fillStyle = '#000';
            // Scale the position based on the ratio between actual canvas size and displayed size
            const scaledX = sig.x * scaleRatio;
            const scaledY = sig.y * scaleRatio;
            ctx.fillText(sig.text, scaledX, scaledY);
          });
          
          // Add page to PDF
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
    
    pdf.save('signed-document.pdf');
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Great+Vibes&family=Pacifico&family=Allura&display=swap');
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            PDF E-Signature Tool
          </h1>

          {!pdfFile ? (
            <div className="bg-white rounded-2xl shadow-xl p-12">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-4 border-dashed border-gray-300 rounded-xl p-16 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <Upload className="mx-auto mb-4 text-gray-400" size={64} />
                <p className="text-xl text-gray-600 mb-2">
                  Click to upload your PDF document
                </p>
                <p className="text-sm text-gray-400">
                  Support for PDF files only
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Document Preview
                  </h2>
                  <button
                    onClick={() => {
                      setPdfFile(null);
                      setPdfPages([]);
                      setSignatures([]);
                      setPdfLoaded(false);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div
                  ref={previewRef}
                  className="bg-gray-100 rounded-lg overflow-auto"
                  style={{ minHeight: '800px' }}
                >
                  {!pdfLoaded && (
                    <div className="flex items-center justify-center" style={{ minHeight: '800px' }}>
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading PDF...</p>
                      </div>
                    </div>
                  )}

                  {pdfLoaded && pdfPages.map((page, pageIndex) => (
                    <div 
                      key={pageIndex} 
                      className="relative mb-4"
                      ref={el => pageRefs.current[pageIndex] = el}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, pageIndex)}
                    >
                      <img 
                        src={page.dataUrl} 
                        alt={`Page ${pageIndex + 1}`}
                        className="w-full h-auto shadow-lg pointer-events-none"
                        draggable="false"
                      />
                      <div className="absolute top-2 right-2 bg-gray-800 text-white px-3 py-1 rounded text-sm pointer-events-none">
                        Page {pageIndex + 1} of {pdfPages.length}
                      </div>
                      
                      {/* Render signatures for this specific page */}
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
                            transition: 'opacity 0.2s ease',
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
                  ))}
                </div>

                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Signature Tools
                </h2>

                <button
                  onClick={() => setShowSignatureModal(true)}
                  disabled={!pdfLoaded}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mb-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Type size={20} />
                  Add Text Signature
                </button>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Active Signatures ({signatures.length})
                  </h3>
                  
                  {signatures.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">
                      No signatures added yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {signatures.map(sig => (
                        <div
                          key={sig.id}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                        >
                          <div className="flex-1">
                            <span
                              style={{ fontFamily: getFontFamily(sig.font) }}
                              className="text-lg"
                            >
                              {sig.text}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              Page {sig.page + 1}
                            </p>
                          </div>
                          <button
                            onClick={() => removeSignature(sig.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {signatures.length > 0 && pdfLoaded && (
                  <button
                    onClick={downloadPDF}
                    className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    Download Signed Document
                  </button>
                )}

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Move size={20} className="text-blue-600 mt-1 flex-shrink-0" />
                    <p className="text-sm text-gray-600">
                      Drag signatures to position them on your document. You can move signatures between pages.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {showSignatureModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Create Text Signature
                </h2>
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Signature Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {fonts.map(font => (
                    <button
                      key={font.value}
                      onClick={() => setSelectedFont(font.value)}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        selectedFont === font.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p
                        style={{ fontFamily: getFontFamily(font.value) }}
                        className="text-2xl text-center"
                      >
                        {signatureName || font.name}
                      </p>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        {font.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {signatureName && (
                <div className="mb-6 p-6 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3 text-center">
                    Preview
                  </p>
                  <p
                    style={{ fontFamily: getFontFamily(selectedFont) }}
                    className="text-5xl text-center"
                  >
                    {signatureName}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createSignature}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Signature
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}