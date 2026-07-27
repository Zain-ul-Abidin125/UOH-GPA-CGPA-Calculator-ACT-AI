import React, { useRef, useState } from 'react';
import { StudentProfile } from '../types';
import { calculateOverallCGPA, getAcademicStanding, safeFixed } from '../utils/uohGrading';
import { UohLogo } from './UohLogo';
import { Download, Printer, ShieldCheck, Award, FileText, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface TranscriptExportProps {
  profile: StudentProfile;
}

export const TranscriptExport: React.FC<TranscriptExportProps> = ({ profile }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const overall = calculateOverallCGPA(profile.semesters);
  const standing = getAcademicStanding(overall.cgpa);

  // Generate & Download PDF using html2canvas + jsPDF
  const handleDownloadPdf = async () => {
    if (!printRef.current || downloading) return;
    setDownloading(true);

    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#FFFFFF',
      });

      if (!canvas || typeof canvas.getBoundingClientRect !== 'function' || typeof canvas.toDataURL !== 'function') {
        throw new Error('Canvas element missing standard canvas methods');
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`UOH_Transcript_${(profile.rollNumber || 'student').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    } catch (err) {
      console.error('Error generating PDF with html2canvas:', err);
      // Fallback to browser native print
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Bar Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0B132B] p-6 rounded-3xl border border-blue-100 dark:border-blue-900/40 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-serif">
            Export Academic Grade Summary & Transcript
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate an official-style PDF document for personal records or academic review.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Layout</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Generating PDF...' : 'Download PDF Document'}</span>
          </button>
        </div>
      </div>

      {/* Printable Document Container */}
      <div className="overflow-x-auto p-2">
        <div
          ref={printRef}
          className="w-[800px] mx-auto bg-white text-slate-900 p-10 rounded-2xl shadow-2xl border border-slate-300 space-y-6 text-xs font-sans print:w-full print:shadow-none print:border-none"
        >
          {/* Document Official Header */}
          <div className="text-center space-y-2 border-b-2 border-slate-900 pb-6">
            <div className="flex justify-center mb-2">
              <UohLogo size={72} showText={false} />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-wide font-serif text-[#001F3F]">
              THE UNIVERSITY OF HARIPUR
            </h1>
            <p className="text-xs font-semibold italic text-blue-900">
              "Restoring Hope; Building Community"
            </p>
            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              Hattar Road, Haripur, Khyber Pakhtunkhwa, Pakistan
            </p>
            <div className="inline-block mt-2 px-4 py-1 bg-[#001F3F] text-white font-bold text-xs rounded uppercase tracking-wider">
              ACADEMIC GRADE SUMMARY & TRANSCRIPT
            </div>
          </div>

          {/* Student Profile Info Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="space-y-1">
              <p>
                <strong>Student Name:</strong> {profile.name}
              </p>
              <p>
                <strong>Roll / Registration No:</strong>{' '}
                <span className="font-mono font-bold">{profile.rollNumber}</span>
              </p>
              <p>
                <strong>Department:</strong> {profile.department}
              </p>
            </div>
            <div className="space-y-1">
              <p>
                <strong>Degree Program:</strong> {profile.degreeProgram}
              </p>
              <p>
                <strong>Grading System:</strong> Absolute Grading System (2022 Revised)
              </p>
              <p>
                <strong>Date Generated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Semester-by-Semester Tables */}
          <div className="space-y-6">
            {profile.semesters.map((sem, sIdx) => (
              <div key={sem.id ? `trans-sem-${sem.id}-${sIdx}` : `trans-sem-${sIdx}`} className="space-y-2">
                <div className="flex items-center justify-between bg-slate-100 px-3 py-1.5 rounded font-bold text-xs border-l-4 border-[#001F3F]">
                  <span className="text-[#001F3F] uppercase">{sem.title}</span>
                  <span>Semester GPA: {safeFixed(sem?.gpa, 2)}</span>
                </div>

                <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                  <thead>
                    <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
                      <th className="py-1.5 px-2 border-r border-slate-300">Code</th>
                      <th className="py-1.5 px-2 border-r border-slate-300">Course Title</th>
                      <th className="py-1.5 px-2 border-r border-slate-300 text-center">Credit Hours</th>
                      <th className="py-1.5 px-2 border-r border-slate-300 text-center">Marks %</th>
                      <th className="py-1.5 px-2 border-r border-slate-300 text-center">UOH NG</th>
                      <th className="py-1.5 px-2 border-r border-slate-300 text-center">Grade</th>
                      <th className="py-1.5 px-2 text-right">Quality Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {sem.courses.map((c, cIdx) => (
                      <tr key={c.id ? `trans-course-${c.id}-${cIdx}` : `trans-course-${cIdx}`}>
                        <td className="py-1 px-2 border-r border-slate-200 font-mono font-bold">
                          {c.code}
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200 font-medium">
                          {c.title}
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200 text-center font-mono">
                          {c.creditHours}
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200 text-center font-mono">
                          {c.marks ? `${c.marks}%` : '-'}
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200 text-center font-mono">
                          {safeFixed(c?.numericalGrade, 2)}
                        </td>
                        <td className="py-1 px-2 border-r border-slate-200 text-center font-bold">
                          {c.letterGrade}
                        </td>
                        <td className="py-1 px-2 text-right font-mono font-bold">
                          {safeFixed(c?.qualityPoints, 2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          {/* Cumulative CGPA Summary Box */}
          <div className="p-4 rounded-xl bg-[#001F3F] text-white space-y-2">
            <div className="flex items-center justify-between border-b border-blue-800/80 pb-2">
              <span className="font-extrabold uppercase text-xs tracking-wider">
                Cumulative CGPA Summary
              </span>
              <span className="font-mono text-xl font-extrabold text-amber-300">
                CGPA: {safeFixed(overall?.cgpa, 2)} / 4.00
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-blue-200 block">Total Credit Hours:</span>
                <span className="font-bold font-mono text-white">{overall.earnedCredits} hrs</span>
              </div>
              <div>
                <span className="text-blue-200 block">Total Quality Points:</span>
                <span className="font-bold font-mono text-white">{safeFixed(overall?.totalQualityPoints, 2)}</span>
              </div>
              <div>
                <span className="text-blue-200 block">Standing:</span>
                <span className="font-bold text-amber-300">{standing.title}</span>
              </div>
            </div>
          </div>

          {/* Official Footnote & Disclaimer */}
          <div className="pt-6 border-t border-slate-300 space-y-2 text-[10px] text-slate-500 text-center">
            <p className="italic">
              * This transcript is generated for academic planning based on official UOH 2022 Absolute Grading Rules.
            </p>
            <p>
              <strong>Disclaimer:</strong> "This application is an independent student project and is not officially affiliated with the University of Haripur."
            </p>
            <p className="font-bold text-[#001F3F]">
              ACT AI Final Project by Zain ul Abidin • University of Haripur (2026)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
