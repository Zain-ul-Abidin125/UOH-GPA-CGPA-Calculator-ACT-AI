import React, { useState, useEffect } from 'react';
import { StudentProfile } from './types';
import { DEFAULT_STUDENT_PROFILE, sanitizeProfile } from './utils/uohGrading';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Dashboard } from './components/Dashboard';
import { SemesterCalculator } from './components/SemesterCalculator';
import { CgpaCalculator } from './components/CgpaCalculator';
import { AiAdvisor } from './components/AiAdvisor';
import { GradingCriteriaView } from './components/GradingCriteriaView';
import { TranscriptExport } from './components/TranscriptExport';
import { AboutView } from './components/AboutView';
import { TargetPlannerModal } from './components/TargetPlannerModal';

export default function App() {
  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('uoh_gpa_dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Target Planner Modal State
  const [targetModalOpen, setTargetModalOpen] = useState<boolean>(false);

  // Student Profile persistence
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem('uoh_student_profile');
      if (saved) return sanitizeProfile(JSON.parse(saved));
    } catch (e) {
      console.error('Error loading saved profile:', e);
    }
    return DEFAULT_STUDENT_PROFILE;
  });

  // Sync dark mode class on document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('uoh_gpa_dark_mode', String(darkMode));
  }, [darkMode]);

  // Sync profile to local storage
  useEffect(() => {
    localStorage.setItem('uoh_student_profile', JSON.stringify(profile));
  }, [profile]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            profile={profile}
            setActiveTab={setActiveTab}
            onOpenTargetModal={() => setTargetModalOpen(true)}
          />
        )}

        {activeTab === 'semester' && (
          <SemesterCalculator
            profile={profile}
            setProfile={setProfile}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'cgpa' && (
          <CgpaCalculator
            profile={profile}
            setProfile={setProfile}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'advisor' && <AiAdvisor profile={profile} setProfile={setProfile} />}

        {activeTab === 'criteria' && <GradingCriteriaView />}

        {activeTab === 'transcript' && <TranscriptExport profile={profile} />}

        {activeTab === 'about' && <AboutView />}
      </main>

      {/* Target CGPA Planner Modal Popup */}
      <TargetPlannerModal
        isOpen={targetModalOpen}
        onClose={() => setTargetModalOpen(false)}
        profile={profile}
        setProfile={setProfile}
        setActiveTab={setActiveTab}
      />

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}
