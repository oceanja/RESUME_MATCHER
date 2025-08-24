An AI-powered web app built with Next.js 14, TypeScript, and TailwindCSS that:

Extracts text from resumes (PDF upload or manual paste).

Compares it with a job description using Google Gemini API.

Generates a match score, highlights matched/missing skills, and provides improvement suggestions.

Live Demo: [link will go here after deploy]

🚀 Features

Resume Input Options

Upload a PDF (text-based)

Or paste your resume text directly

Job Description Input

Paste any job description into the text box

AI-Powered Analysis

Match score (0–100%)

List of matched skills

List of missing skills

AI suggestions to improve your resume

Beautiful UI with TailwindCSS + shadcn/ui components

🛠️ Tech Stack

Next.js 14 (App Router)

TypeScript

TailwindCSS

shadcn/ui

Lucide Icons

pdf-parse
for PDF text extraction

Google Gemini API

📂 Project Structure
app/
 ├── api/
 │   ├── upload/route.ts     # PDF upload + text extraction
 │   └── match/route.ts      # Gemini API integration
 ├── page.tsx                # Main frontend page (resume matcher UI)
components/ui/               # Reusable UI components (button, card, etc.)
types/                       # Custom type declarations
next.config.mjs              # Next.js config
.env.local                   # Local environment variables (not committed)

