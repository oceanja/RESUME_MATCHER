import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UPLOAD_DIR = path.resolve('/tmp', 'tmp_uploads');

async function extractWithPdfParse(buffer: Buffer): Promise<string> {
  // Import the library file directly to avoid package entry side-effects
  const mod = await import('pdf-parse/lib/pdf-parse.js');
  const pdfParse: any = (mod as any).default ?? mod;
  const data = await pdfParse(buffer);
  return (data?.text || '').replace(/\s+/g, ' ').trim();
}


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const MAX_SIZE = 4.5 * 1024 * 1024;
    if (!file.name.toLowerCase().endsWith('.pdf')) return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    if (file.size === 0) return NextResponse.json({ error: 'Empty file' }, { status: 400 });
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max ~4.5MB)' }, { status: 400 });

    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const safe = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const tmp = path.join(UPLOAD_DIR, `${Date.now()}_${safe}`);

    let buf: Buffer;
    try {
      buf = Buffer.from(await file.arrayBuffer());
      if (!buf.subarray(0, 4).toString().startsWith('%PDF')) {
        return NextResponse.json({ error: 'Invalid PDF file format' }, { status: 400 });
      }

      await fs.writeFile(tmp, buf);

      const text = await extractWithPdfParse(buf);
      if (text.length < 50) {
        return NextResponse.json({
          error: 'Could not read text from this PDF. It may be image-based. Export as a text PDF or try another file.'
        }, { status: 400 });
      }

      return NextResponse.json({ resumeText: text, message: 'PDF processed successfully' });
    } finally {
      try { await fs.unlink(tmp); } catch {}
    }
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Failed to process PDF.' }, { status: 500 });
  }
}
