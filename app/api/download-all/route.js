
import { NextResponse } from 'next/server';
import AdmZip from 'adm-zip';
import { readdirSync } from 'fs';
import { join } from 'path';

export async function GET() {
  const tempDir = join(process.cwd(), 'temp');
  const files = readdirSync(tempDir).filter(f => f.endsWith('.pdf'));
  
  const zip = new AdmZip();
  files.forEach(file => {
    zip.addLocalFile(join(tempDir, file));
  });
  
  const buffer = zip.toBuffer();
  
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="converted-pdfs.zip"',
    },
  });
}