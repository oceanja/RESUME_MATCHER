import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { resumeText, jobDescription } = await req.json();

  if (!resumeText || !jobDescription) {
    return NextResponse.json({ error: "Resume text and job description are required." }, { status: 400 });
  }

  try {
    const chatHistory = [];
    chatHistory.push({
      role: "user",
      parts: [
        {
          text: `You are an expert career advisor and job match analyst. Your task is to compare a candidate's resume with a given job description.

          Analyze the resume and job description thoroughly to identify:
          1.  A "matchScore" (an integer percentage from 0 to 100) indicating how well the resume aligns with the job description.
          2.  "goodSkills": A list of specific skills, technologies, or experiences from the resume that are highly relevant and match the job description.
          3.  "missingSkills": A list of specific skills, technologies, or experiences explicitly mentioned or strongly implied in the job description that are either absent from the resume or not clearly highlighted.
          4.  "suggestions": A list of actionable advice points for the candidate to improve their resume, gain relevant experience, or prepare for an interview, based on the comparison.

          Consider both explicit keywords and implicit capabilities. For example, if a job requires "leadership" and the resume mentions "managed a team of 5 engineers," that's a good match.

          Resume:
          ${resumeText}

          Job Description:
          ${jobDescription}

          Provide the output in a JSON format. Ensure all skill lists are arrays of strings.

          JSON Format Example:
          {
            "matchScore": 75,
            "goodSkills": ["Project Management", "Team Leadership", "Software Development", "React.js"],
            "missingSkills": ["Cloud Architecture (AWS)", "DevOps Practices"],
            "suggestions": [
              "Elaborate on specific project outcomes and impact.",
              "Consider gaining experience in cloud platforms to align with industry trends.",
              "Tailor your resume's summary to directly address the job's core requirements."
            ]
          }`
        },
      ],
    });

    const payload = {
      contents: chatHistory,
      generationConfig: {
        responseMimeType: "application/json", // Explicitly request JSON
        responseSchema: {
          type: "OBJECT",
          properties: {
            matchScore: { type: "NUMBER" },
            goodSkills: { type: "ARRAY", items: { type: "STRING" } },
            missingSkills: { type: "ARRAY", items: { type: "STRING" } },
            suggestions: { type: "ARRAY", items: { type: "STRING" } }, // Ensure suggestions is an array
          },
          required: ["matchScore", "goodSkills", "missingSkills", "suggestions"],
        },
      },
    };

    // Your Gemini API key has been added here
    const apiKey = "AIzaSyCnYXul2AXwy9v8eSOIsikqAhhWA8gnEjc"; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API error response:", errorData);
        throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();

    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
      const jsonString = result.candidates[0].content.parts[0].text;
      let parsedResult;
      try {
        parsedResult = JSON.parse(jsonString);
      } catch (parseError) {
        console.error("Failed to parse Gemini API JSON response:", jsonString, parseError);
        throw new Error("Failed to parse AI response as JSON.");
      }

      // Ensure the structure matches the frontend interface, even if AI deviates slightly
      const finalResult = {
        matchScore: typeof parsedResult.matchScore === 'number' ? parsedResult.matchScore : 0,
        goodSkills: Array.isArray(parsedResult.goodSkills) ? parsedResult.goodSkills : [],
        missingSkills: Array.isArray(parsedResult.missingSkills) ? parsedResult.missingSkills : [],
        suggestions: Array.isArray(parsedResult.suggestions) ? parsedResult.suggestions : [],
      };

      return NextResponse.json(finalResult);
    } else {
      console.error("Gemini API response structure unexpected or empty:", result);
      return NextResponse.json(
        { error: "AI did not return a valid response for matching." },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("Error in Gemini API call:", error);
    return NextResponse.json(
      { error: `Failed to analyze match: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
