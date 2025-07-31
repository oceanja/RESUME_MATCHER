// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import * as pdfToText from 'pdf-to-text';

// Define a temporary directory for file uploads
const UPLOAD_DIR = path.resolve(process.cwd(), 'tmp_uploads');

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
  }

  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Only PDF files are allowed.' }, { status: 400 });
  }

  let filePath = '';

  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    filePath = path.join(UPLOAD_DIR, file.name);
    await fs.writeFile(filePath, buffer);

    // --- Using pdf-to-text here ---
    const extractedText: string = await new Promise((resolve, reject) => {
      // *** IMPORTANT FIX HERE: Change 'toText' to 'pdfToText' ***
      pdfToText.pdfToText(filePath, (err: Error | null, data: string | undefined) => {
        if (err) {
          reject(err);
        } else if (data === undefined) {
          reject(new Error('PDF to text conversion returned no data.'));
        }
        else {
          resolve(data);
        }
      });
    });
    // --- End pdf-to-text usage ---

    return NextResponse.json({ resumeText: extractedText }, { status: 200 });
  } catch (error) {
    console.error('Error processing PDF:', error);
    // This part of your error handling is excellent!
    if (error instanceof Error && error.message.includes('Command failed') && error.message.includes('pdftotext')) {
       return NextResponse.json({ error: 'PDF conversion failed. Is pdftotext installed and in your PATH?' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to process PDF.' }, { status: 500 });
  } finally {
    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        console.error('Error deleting temporary file:', cleanupError);
      }
    }
  }
}