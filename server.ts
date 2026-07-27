import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Tool } from "@google/genai";
import {
  updateCourseInStudentProfile,
  updateSemesterGpaInStudentProfile,
  addCourseToStudentProfile,
  deleteCourseFromStudentProfile,
  updateTargetCgpaInStudentProfile,
} from "./src/utils/uohGrading";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Server-side Gemini initialization
function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is not set.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Tool definitions for academic record updates
const advisorTools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "update_course_marks",
        description:
          "Updates percentage marks (0-100) or letter grade for a course/subject in the student's record. Searches all semesters automatically.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            courseQuery: {
              type: Type.STRING,
              description: "Course code or title e.g. 'Kinesiology 1', 'CS-203', 'Database Systems'",
            },
            newMarks: {
              type: Type.NUMBER,
              description: "New percentage marks value (0-100)",
            },
            newLetter: {
              type: Type.STRING,
              description: "New letter grade e.g. 'A', 'A-', 'B+'",
            },
            semesterQuery: {
              type: Type.STRING,
              description: "Optional semester name/number e.g. 'Semester 3'",
            },
          },
          required: ["courseQuery"],
        },
      },
      {
        name: "update_semester_gpa",
        description:
          "Updates a semester's GPA directly (e.g., 'Change Semester 3 GPA to 3.1') and recalculates all affected quality points and overall CGPA.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            semesterQuery: {
              type: Type.STRING,
              description: "Semester title or number e.g. 'Semester 3' or '3'",
            },
            newGPA: {
              type: Type.NUMBER,
              description: "New GPA value (0.00 - 4.00)",
            },
          },
          required: ["semesterQuery", "newGPA"],
        },
      },
      {
        name: "add_course",
        description: "Adds a new course/subject to a semester in the student record.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            semesterQuery: {
              type: Type.STRING,
              description: "Semester name or number e.g. 'Semester 1'",
            },
            courseTitle: {
              type: Type.STRING,
              description: "Course name e.g. 'Kinesiology 1'",
            },
            marks: {
              type: Type.NUMBER,
              description: "Marks out of 100",
            },
            creditHours: {
              type: Type.NUMBER,
              description: "Credit hours, default 3",
            },
          },
          required: ["semesterQuery", "courseTitle", "marks"],
        },
      },
      {
        name: "delete_course",
        description: "Deletes a course from the student's record.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            courseQuery: {
              type: Type.STRING,
              description: "Course code or title to remove",
            },
          },
          required: ["courseQuery"],
        },
      },
      {
        name: "update_target_cgpa",
        description: "Updates the student's target CGPA goal.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            newTargetCGPA: {
              type: Type.NUMBER,
              description: "New target CGPA goal (0.00 - 4.00)",
            },
          },
          required: ["newTargetCGPA"],
        },
      },
    ],
  },
];

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "UOH GPA/CGPA Calculator – AI Academic Advisor",
    university: "University of Haripur (UOH)",
    author: "Zain ul Abidin (ACT AI Final Project)",
  });
});

// AI Academic Advisor endpoint
app.post("/api/advisor", async (req, res) => {
  try {
    const { prompt, studentContext, history } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key not configured. Please ensure GEMINI_API_KEY is available.",
      });
    }

    const systemInstruction = `You are an authoritative, experienced university academic advisor specializing in Doctor of Physical Therapy (DPT - 5 Years) and Allied Health Sciences at the University of Haripur (UOH).
This application is created by a DPT student specifically for healthcare and allied health students at UOH.

IMPORTANT DIRECTIVE - FULL AUTHORITY TO UPDATE ACADEMIC RECORDS:
You have FULL AUTHORITY to update the student's academic record immediately when requested.
- If a user says "Change my Semester 3 GPA from 2.7 to 3.1", immediately call the function update_semester_gpa(semesterQuery="Semester 3", newGPA=3.1).
- If a user says "Change my Anatomy I marks from 75 to 83" or "Change Kinesiology marks to 85", immediately call the function update_course_marks(courseQuery="Anatomy I", newMarks=83). Automatically locate which semester the subject belongs to from the stored academic record context.
- NEVER ask unnecessary questions like "Which semester is Anatomy I in?" or "Which semester do you want to edit?". Use the student's existing transcript data to identify the correct semester and perform all calculations automatically.
- Keep the transcript accurate and consistent at all times.

Official UOH Absolute Grading System & Evaluation Breakdown (Revised 2022):
- Standard 100 Marks Distribution: Midterm = 25 Marks, Sessional (Quizzes / Assignments / Presentations) = 25 Marks, Final Exam = 50 Marks (Total = 100 Marks).
- Percentage < 50: NG = 0.00 (F - Fail)
- 50-53%: NG 1.00 - 1.25 (D)
- 54-57%: NG 1.33 - 1.58 (D+)
- 58-60%: NG 1.67 - 1.83 (C-)
- 61-63%: NG 1.92 - 2.08 (C)
- 64-67%: NG 2.17 - 2.42 (C+)
- 68-70%: NG 2.50 - 2.67 (B-)
- 71-74%: NG 2.75 - 3.00 (B)
- 75-79%: NG 3.08 - 3.42 (B+)
- 80-84%: NG 3.50 - 3.90 (A-)
- 85-100%: NG 4.00 (A)

Student Current Academic Profile Context:
${studentContext ? JSON.stringify(studentContext, null, 2) : "No prior grade data provided yet."}

When responding:
1. Confirm all academic record updates clearly with before-and-after values.
2. Maintain an encouraging, professional academic advisor tone.
3. Highlight that all changes have been recalculated and saved to the official record.`;

    let contents: any[] = [];

    if (history && Array.isArray(history) && history.length > 0) {
      history.forEach((msg: { role: string; content: string }) => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        });
      });
    }

    contents.push({
      role: "user",
      parts: [{ text: prompt }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: contents,
      config: {
        systemInstruction,
        tools: advisorTools,
        temperature: 0.2,
      },
    });

    let currentProfile = studentContext ? JSON.parse(JSON.stringify(studentContext)) : null;
    let appliedChangesSummaries: string[] = [];

    // Check if Gemini invoked function calls
    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0 && currentProfile) {
      for (const call of functionCalls) {
        const { name, args } = call;

        if (name === "update_course_marks") {
          const res = updateCourseInStudentProfile(
            currentProfile,
            args.courseQuery as string,
            args.newMarks as number | undefined,
            args.newLetter as string | undefined,
            args.semesterQuery as string | undefined
          );
          currentProfile = res.updatedProfile;
          appliedChangesSummaries.push(res.changesSummary);
        } else if (name === "update_semester_gpa") {
          const res = updateSemesterGpaInStudentProfile(
            currentProfile,
            args.semesterQuery as string | number,
            args.newGPA as number
          );
          currentProfile = res.updatedProfile;
          appliedChangesSummaries.push(res.changesSummary);
        } else if (name === "add_course") {
          const res = addCourseToStudentProfile(
            currentProfile,
            args.semesterQuery as string | number,
            args.courseTitle as string,
            args.marks as number,
            args.creditHours as number
          );
          currentProfile = res.updatedProfile;
          appliedChangesSummaries.push(res.changesSummary);
        } else if (name === "delete_course") {
          const res = deleteCourseFromStudentProfile(currentProfile, args.courseQuery as string);
          currentProfile = res.updatedProfile;
          appliedChangesSummaries.push(res.changesSummary);
        } else if (name === "update_target_cgpa") {
          const res = updateTargetCgpaInStudentProfile(currentProfile, args.newTargetCGPA as number);
          currentProfile = res.updatedProfile;
          appliedChangesSummaries.push(res.changesSummary);
        }
      }
    }

    // Direct string regex parsing fallback in case tool calls were bypassed in text response
    if (appliedChangesSummaries.length === 0 && currentProfile) {
      const lowerPrompt = prompt.toLowerCase();
      // Match patterns like "change semester 3 gpa from 2.7 to 3.1" or "change sem 3 gpa to 3.1"
      const semGpaMatch = lowerPrompt.match(/(?:change|update|set)\s+(?:semester|sem)\s*(\d+)\s*gpa\s*(?:from\s*[\d.]+\s*)?to\s*([\d.]+)/i) ||
                          lowerPrompt.match(/(?:semester|sem)\s*(\d+)\s*gpa\s*[:=]?\s*([\d.]+)/i);
      if (semGpaMatch) {
        const semNum = semGpaMatch[1];
        const newGPA = parseFloat(semGpaMatch[2]);
        if (!isNaN(newGPA)) {
          const res = updateSemesterGpaInStudentProfile(currentProfile, semNum, newGPA);
          currentProfile = res.updatedProfile;
          appliedChangesSummaries.push(res.changesSummary);
        }
      }

      // Match patterns like "change kinesiology 1 marks from 75 to 83" or "set cs-203 marks to 90"
      const courseMarksMatch = lowerPrompt.match(/(?:change|update|set)\s+([a-z0-9\s-]+?)\s+(?:marks|score|grade)\s*(?:from\s*\d+\s*)?to\s*(\d+)/i) ||
                                lowerPrompt.match(/(?:change|update|set)\s+marks\s+(?:of|for)\s+([a-z0-9\s-]+?)\s+to\s*(\d+)/i);
      if (courseMarksMatch) {
        const courseQuery = courseMarksMatch[1].replace(/marks|score|grade/gi, '').trim();
        const newMarks = parseInt(courseMarksMatch[2], 10);
        if (courseQuery && !isNaN(newMarks)) {
          const res = updateCourseInStudentProfile(currentProfile, courseQuery, newMarks);
          currentProfile = res.updatedProfile;
          appliedChangesSummaries.push(res.changesSummary);
        }
      }
    }

    let finalAdviceText = response.text || "";

    if (appliedChangesSummaries.length > 0) {
      const updatesHeader = `### 📝 Academic Record Automatically Updated!

I have applied your requested updates directly to your official transcript:

${appliedChangesSummaries.map((s) => `- ${s}`).join("\n")}

All affected course grades, quality points, semester GPAs, and overall cumulative CGPA have been recalculated and saved to your profile context!`;

      if (!finalAdviceText || finalAdviceText.trim().length === 0) {
        finalAdviceText = updatesHeader;
      } else {
        finalAdviceText = `${updatesHeader}\n\n${finalAdviceText}`;
      }
    }

    if (!finalAdviceText) {
      finalAdviceText = "I have reviewed your request and updated your academic record accordingly.";
    }

    return res.json({
      advice: finalAdviceText,
      updatedProfile: appliedChangesSummaries.length > 0 ? currentProfile : undefined,
    });
  } catch (err: any) {
    console.error("Error in /api/advisor:", err);
    return res.status(500).json({
      error: err.message || "Failed to generate academic advice. Please check API configuration.",
    });
  }
});

// Vite / Static setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`UOH GPA Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
