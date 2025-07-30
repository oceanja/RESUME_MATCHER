// app/api/match/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Set this in .env.local
});

export async function POST(req: NextRequest) {
  const { resumeText, jobDescription } = await req.json();

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4", // Or gpt-3.5-turbo if no GPT-4 access
      messages: [
        {
          role: "system",
          content:
            "You are a professional job match assistant. Compare a resume with a job description and give a match score, good skills, missing skills, and suggestions.",
        },
        {
          role: "user",
          content: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}\n\nPlease respond in JSON format like:
{
  "matchScore": 85,
  "goodSkills": ["React", "Node.js", "API Integration"],
  "missingSkills": ["TypeScript", "AWS"],
  "suggestions": "Learn TypeScript and cloud tools like AWS to improve your match."
}`,
        },
      ],
      temperature: 0.3,
    });

    const responseText = chatCompletion.choices[0].message.content;

    const result = JSON.parse(responseText || "{}");
    return NextResponse.json(result);
  } catch (error) {
    console.error("OpenAI error:", error);
    return NextResponse.json(
      { error: "Failed to analyze match" },
      { status: 500 }
    );
  }
}
