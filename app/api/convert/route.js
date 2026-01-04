

import { NextResponse } from 'next/server';
import AdmZip from 'adm-zip';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const TEMP_DIR = join(process.cwd(), 'temp');

export async function POST(request) {
  try {
    if (!existsSync(TEMP_DIR)) {
      mkdirSync(TEMP_DIR, { recursive: true });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const results = [];
    const isZipFile = file.name.endsWith('.zip');
    
    if (isZipFile) {
      const zip = new AdmZip(buffer);
      const entries = zip.getEntries();
      
      for (const entry of entries) {
        if (entry.entryName.endsWith('.pages') && !entry.isDirectory) {
          try {
            const pagesData = entry.getData();
            const pagesZip = new AdmZip(pagesData);
            const pdfBuffer = extractPdfFromPages(pagesZip, entry.entryName);
            
            if (pdfBuffer) {
              const pdfName = entry.entryName.replace('.pages', '.pdf').split('/').pop();
              const pdfPath = join(TEMP_DIR, pdfName);
              writeFileSync(pdfPath, pdfBuffer);
              results.push({ name: pdfName, size: pdfBuffer.length });
            }
          } catch (e) {
            results.push({ name: entry.entryName, error: e.message });
          }
        }
      }
    } else {
      const pagesZip = new AdmZip(buffer);
      const pdfBuffer = extractPdfFromPages(pagesZip, file.name);
      
      if (pdfBuffer) {
        const pdfName = file.name.replace('.pages', '.pdf');
        const pdfPath = join(TEMP_DIR, pdfName);
        writeFileSync(pdfPath, pdfBuffer);
        results.push({ name: pdfName, size: pdfBuffer.length });
      }
    }
    
    if (results.length === 0) {
      return NextResponse.json({ error: 'No valid .pages files found' }, { status: 400 });
    }
    
    return NextResponse.json({ files: results });
  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function extractPdfFromPages(pagesZip, fileName) {
  const possiblePaths = [
    'QuickLook/Preview.pdf',
    'preview.pdf',
    'Preview.pdf',
    'Data/Preview.pdf'
  ];
  
  const entries = pagesZip.getEntries();
  for (const path of possiblePaths) {
    const entry = entries.find(e => e.entryName === path);
    if (entry) {
      return entry.getData();
    }
  }
  
  throw new Error(`No PDF preview found in ${fileName}`);
}




