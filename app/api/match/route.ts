import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MatchResult = {
  matchScore: number;
  goodSkills: string[];
  missingSkills: string[];
  suggestions: string[];
};

function stripJsonFences(s: string) {
  if (!s) return s;
  return s.replace(/^\s*```(?:json)?/i, "").replace(/```\s*$/i, "").trim();
}

function coerceResult(obj: any): MatchResult {
  const scoreNum =
    typeof obj?.matchScore === "number"
      ? obj.matchScore
      : typeof obj?.matchScore === "string"
      ? Number(obj.matchScore)
      : 0;

  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  return {
    matchScore: clamp(isFinite(scoreNum) ? scoreNum : 0),
    goodSkills: Array.isArray(obj?.goodSkills) ? obj.goodSkills.map(String) : [],
    missingSkills: Array.isArray(obj?.missingSkills) ? obj.missingSkills.map(String) : [],
    suggestions: Array.isArray(obj?.suggestions) ? obj.suggestions.map(String) : [],
  };
}

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "Resume text and job description are required." },
        { status: 400 }
      );
    }

    
    const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  return NextResponse.json({ error: "Server misconfiguration: GEMINI_API_KEY is not set." }, { status: 500 });
}
    const apiUrl =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an expert career advisor and job match analyst. Compare the resume to the job description and RETURN ONLY VALID JSON with this exact shape:
{
  "matchScore": <integer 0-100>,
  "goodSkills": [<strings>],
  "missingSkills": [<strings>],
  "suggestions": [<strings>]
}

Resume:
${resumeText}

Job Description:
${jobDescription}`,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            matchScore: { type: "NUMBER" },
            goodSkills: { type: "ARRAY", items: { type: "STRING" } },
            missingSkills: { type: "ARRAY", items: { type: "STRING" } },
            suggestions: { type: "ARRAY", items: { type: "STRING" } },
          },
          required: ["matchScore", "goodSkills", "missingSkills", "suggestions"],
        },
      },
    };

    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    }).finally(() => clearTimeout(to));

    if (!response.ok) {
      let errMsg = `${response.status} ${response.statusText}`;
      try {
        const errBody = await response.json();
        errMsg += ` | ${JSON.stringify(errBody)}`;
      } catch {}
      console.error("Gemini API error:", errMsg);
      return NextResponse.json({ error: `Gemini API error: ${errMsg}` }, { status: 502 });
    }

    const result = await response.json();

    const partText =
      result?.candidates?.[0]?.content?.parts?.[0]?.text ??
      result?.candidates?.[0]?.content?.parts?.[0]?.inlineData ??
      "";

    if (!partText || typeof partText !== "string") {
      console.error("Unexpected Gemini response shape:", JSON.stringify(result).slice(0, 1000));
      return NextResponse.json(
        { error: "AI did not return a valid JSON body." },
        { status: 500 }
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(stripJsonFences(partText));
    } catch {
      console.error("Failed to parse AI JSON:", partText);
      return NextResponse.json(
        { error: "Failed to parse AI response as JSON." },
        { status: 500 }
      );
    }

    return NextResponse.json(coerceResult(parsed));
  } catch (error: any) {
    const msg =
      error?.name === "AbortError"
        ? "AI request timed out."
        : error?.message || "Unknown error";
    console.error("Match route error:", error);
    return NextResponse.json(
      { error: `Failed to analyze match: ${msg}` },
      { status: 500 }
    );
  }
}
