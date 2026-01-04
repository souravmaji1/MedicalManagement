
import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get('file');
  
  if (!fileName) {
    return NextResponse.json({ error: 'No file specified' }, { status: 400 });
  }
  
  const filePath = join(process.cwd(), 'temp', fileName);
  const buffer = readFileSync(filePath);
  
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}
