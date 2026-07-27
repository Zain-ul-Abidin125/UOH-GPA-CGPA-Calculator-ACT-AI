import React, { useState, useRef, useEffect } from 'react';
import { StudentProfile, AdvisorMessage } from '../types';
import { calculateOverallCGPA, safeFixed } from '../utils/uohGrading';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Target,
  Calculator,
  BookOpen,
  Award,
  Lightbulb,
  HelpCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AiAdvisorProps {
  profile: StudentProfile;
  setProfile?: React.Dispatch<React.SetStateAction<StudentProfile>>;
}

export const AiAdvisor: React.FC<AiAdvisorProps> = ({ profile, setProfile }) => {
  const overall = calculateOverallCGPA(profile.semesters);

  const [messages, setMessages] = useState<AdvisorMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `### Welcome to the UOH AI Academic Advisor! 🎓

I am your personalized University of Haripur academic advisor. I have analyzed your current record:

- **Current Cumulative CGPA:** **${safeFixed(overall?.cgpa, 2)}** / 4.00
- **Completed Credit Hours:** **${overall.earnedCredits}** hrs
- **Target CGPA Goal:** **${safeFixed(profile?.targetCGPA, 2)}**

How can I assist you today? You can choose one of the quick options below or ask any question about exam marks required, target GPAs, or study strategies!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Interactive Exam Estimator Tool State
  const [examSubject, setExamSubject] = useState('DPT-206 Physical Therapy Assessment');
  const [midtermMarks, setMidtermMarks] = useState<number | string>(20); // out of 25
  const [assignmentMarks, setAssignmentMarks] = useState<number | string>(20); // out of 25
  const [targetGrade, setTargetGrade] = useState('A'); // 85%
  const [estimatedResult, setEstimatedResult] = useState<string | null>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Send message to Express Gemini API
  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputPrompt;
    if (!promptToSend.trim() || loading) return;

    const userMsg: AdvisorMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputPrompt('');
    setLoading(true);

    try {
      const studentContext = {
        name: profile.name,
        rollNumber: profile.rollNumber,
        department: profile.department,
        degreeProgram: profile.degreeProgram,
        currentCGPA: overall.cgpa,
        earnedCredits: overall.earnedCredits,
        totalDegreeCredits: profile.totalDegreeCredits,
        targetCGPA: profile.targetCGPA,
        semesters: profile.semesters.map((s) => ({
          title: s.title,
          gpa: s.gpa,
          courses: s.courses.map((c) => ({
            code: c.code,
            title: c.title,
            creditHours: c.creditHours,
            marks: c.marks,
            letterGrade: c.letterGrade,
            ng: c.numericalGrade,
          })),
        })),
      };

      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          studentContext,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (data.updatedProfile && setProfile) {
        setProfile(data.updatedProfile);
      }

      if (data.advice) {
        const aiMsg: AdvisorMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.advice,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || 'No response from advisor.');
      }
    } catch (err: any) {
      console.error('AI Advisor error:', err);
      const errorMsg: AdvisorMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Notice:** ${err.message || 'Unable to connect to AI Academic Advisor. Please try again.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Exam Marks Interactive Estimator Calculation
  const handleCalculateExamMarks = () => {
    // Standard UOH 100 Marks Breakdown: Midterm (25) + Sessional (25) + Final Exam (50)
    const currentObtained = (Number(midtermMarks) || 0) + (Number(assignmentMarks) || 0); // out of 50
    let targetMinMarks = 85; // Default 'A'
    if (targetGrade === 'A-') targetMinMarks = 80;
    else if (targetGrade === 'B+') targetMinMarks = 75;
    else if (targetGrade === 'B') targetMinMarks = 71;
    else if (targetGrade === 'B-') targetMinMarks = 68;
    else if (targetGrade === 'C+') targetMinMarks = 64;
    else if (targetGrade === 'C') targetMinMarks = 61;

    const neededInFinal = targetMinMarks - currentObtained;

    if (neededInFinal > 50) {
      setEstimatedResult(
        `To get grade ${targetGrade} (${targetMinMarks}% total), you would need ${neededInFinal} marks out of 50 in Final Exam. Since maximum is 50, grade ${targetGrade} is mathematically unachievable. Highest possible grade with 50/50 in finals is ${currentObtained + 50}%.`
      );
    } else if (neededInFinal <= 0) {
      setEstimatedResult(
        `Great news! You already have ${currentObtained} marks out of 50 (Midterm + Sessional), which satisfies the ${targetMinMarks}% requirement for grade ${targetGrade} even with 0 in finals!`
      );
    } else {
      setEstimatedResult(
        `To achieve grade ${targetGrade} (${targetMinMarks}% total score in ${examSubject}), you need at least ${neededInFinal} marks out of 50 (${((neededInFinal / 50) * 100).toFixed(0)}%) in your Final Exam!`
      );
    }
  };

  const quickPrompts = [
    {
      icon: Target,
      label: `How to reach ${profile.targetCGPA} CGPA?`,
      prompt: `Calculate the exact semester GPA I need in remaining credit hours to achieve my target CGPA of ${profile.targetCGPA}. Give me a realistic semester-by-semester roadmap.`,
    },
    {
      icon: BookOpen,
      label: 'Analyze Weak Subjects',
      prompt: 'Review my complete grade history and identify my weakest subjects. Recommend which subjects I should prioritize or consider repeating to boost my CGPA.',
    },
    {
      icon: Lightbulb,
      label: 'Study Strategies for UOH',
      prompt: 'Suggest realistic, actionable study strategies tailored to my course load to help me improve my GPA this semester.',
    },
    {
      icon: HelpCircle,
      label: 'UOH Probation Rules',
      prompt: 'Explain the official University of Haripur academic standing policies, minimum CGPA required for degree award, and probation rules.',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#001F3F] via-[#0B2545] to-[#134074] text-white p-6 rounded-3xl shadow-xl border border-blue-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-900">
            <Sparkles className="w-3.5 h-3.5 fill-slate-900" />
            <span>Powered by Gemini 3.6 Flash</span>
          </div>
          <h2 className="text-2xl font-extrabold font-serif text-white">
            UOH AI Academic Advisor
          </h2>
          <p className="text-xs text-blue-200">
            Personalized academic guidance, target GPA calculations, and exam score estimation.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-xs text-blue-100 flex items-center gap-4">
          <div>
            <span className="block text-blue-300 text-[10px] uppercase font-bold">Current CGPA</span>
            <span className="text-lg font-bold font-mono text-white">{safeFixed(overall?.cgpa, 2)}</span>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div>
            <span className="block text-blue-300 text-[10px] uppercase font-bold">Target CGPA</span>
            <span className="text-lg font-bold font-mono text-amber-300">{safeFixed(profile?.targetCGPA, 2)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Interface */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0B132B] rounded-3xl border border-blue-100 dark:border-blue-900/40 shadow-sm flex flex-col h-[650px] overflow-hidden">
          {/* Chat Messages Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={msg.id ? `msg-${msg.id}-${idx}` : `msg-${idx}`}
                className={`flex items-start gap-3 ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`p-2 rounded-2xl shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-amber-400 text-slate-950 font-bold'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="prose dark:prose-invert text-xs sm:text-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  <span
                    className={`block text-[10px] mt-2 opacity-70 ${
                      msg.role === 'user' ? 'text-right text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-amber-400 text-slate-950">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>AI Advisor is analyzing your grades...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Bar */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
            {quickPrompts.map((qp, idx) => {
              const Icon = qp.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp.prompt)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 shrink-0 transition-colors flex items-center gap-1.5"
                >
                  <Icon className="w-3.5 h-3.5 text-blue-600" />
                  <span>{qp.label}</span>
                </button>
              );
            })}
          </div>

          {/* Prompt Input Box */}
          <div className="p-4 bg-white dark:bg-[#0B132B] border-t border-slate-100 dark:border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask your academic advisor anything (e.g. 'How can I get an A in Kinesiology or Anatomy?')"
                className="flex-1 px-4 py-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={loading || !inputPrompt.trim()}
                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl shadow-md transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar: Interactive Exam Marks Estimator Tool */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0B132B] p-6 rounded-3xl border border-blue-100 dark:border-blue-900/40 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600" />
                Exam Marks Estimator
              </h3>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                UOH 100 Marks System
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calculate the minimum marks you need in your Final Exam (50 Marks) to get your target letter grade!
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Subject Name:
                </label>
                <input
                  type="text"
                  value={examSubject}
                  onChange={(e) => setExamSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Midterm (Out of 25):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={midtermMarks}
                    onChange={(e) => setMidtermMarks(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-bold font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Sessional (Out of 25):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={assignmentMarks}
                    onChange={(e) => setAssignmentMarks(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-bold font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Grade Goal:
                </label>
                <select
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="A">Grade A (85%+ Marks)</option>
                  <option value="A-">Grade A- (80%+ Marks)</option>
                  <option value="B+">Grade B+ (75%+ Marks)</option>
                  <option value="B">Grade B (71%+ Marks)</option>
                  <option value="B-">Grade B- (68%+ Marks)</option>
                  <option value="C+">Grade C+ (64%+ Marks)</option>
                  <option value="C">Grade C (61%+ Marks)</option>
                </select>
              </div>

              <button
                onClick={handleCalculateExamMarks}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Calculate Final Exam Marks Needed
              </button>

              {estimatedResult && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Calculation Result:</span>
                  </div>
                  <p className="leading-relaxed">{estimatedResult}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
