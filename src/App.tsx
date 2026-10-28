/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  AppMode, 
  DiagnosticResult, 
  Language, 
  PatientData, 
  LabConfig 
} from './types/parasitology';
import { INITIAL_PATIENT_RECORDS, DEFAULT_LAB_CONFIG } from './data/mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { AnalysisWorkspace } from './components/AnalysisWorkspace';
import { PatientRecordsView } from './components/PatientRecordsView';
import { SettingsView } from './components/SettingsView';
import { ModeSelectionModal } from './components/ModeSelectionModal';
import { PatientModal } from './components/PatientModal';
import { MedicalReportModal } from './components/MedicalReportModal';
import { LoginView } from './components/LoginView';

export default function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState({
    name: 'Dr. Thomas Morel',
    role: 'Biologiste Médical (RPPS: 10098421890)',
    branch: 'CHU Saint-Antoine · Pôle Biologie & Parasitologie',
  });

  // App navigation & language
  const [currentMode, setCurrentMode] = useState<AppMode>('dashboard');
  const [language, setLanguage] = useState<Language>('fr');

  // Modals state
  const [isModeModalOpen, setIsModeModalOpen] = useState<boolean>(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Active examination data
  const [currentPatient, setCurrentPatient] = useState<PatientData>({
    id: 'PAT-4405',
    fileNumber: 'IPP-893110',
    fullName: 'Alexandre Renard',
    age: 34,
    gender: 'M',
    sampleId: 'TUBE-9012-A',
    sampleType: 'stool',
    collectionDate: new Date().toISOString().substring(0, 10) + ' 08:30',
    examinationDate: new Date().toISOString().substring(0, 10) + ' 10:15',
    department: 'Gastro-entérologie & Hépatologie',
    prescribingDoctor: 'Dr. Éric Lambert',
    clinicalNotes: 'Diarrhées intermittentes au retour de séjour tropical, hyperéosinophilie.',
  });

  const [activeReportResult, setActiveReportResult] = useState<DiagnosticResult | null>(
    INITIAL_PATIENT_RECORDS[0]
  );

  // Database of records & lab settings
  const [patientRecords, setPatientRecords] = useState<DiagnosticResult[]>(INITIAL_PATIENT_RECORDS);
  const [labConfig, setLabConfig] = useState<LabConfig>(DEFAULT_LAB_CONFIG);

  // Counts for sidebar
  const positiveCount = patientRecords.filter((r) => r.infectionSeverity !== 'negative').length;

  const handleGenerateReport = (result: DiagnosticResult) => {
    setActiveReportResult(result);
    setIsReportModalOpen(true);
    // Also ensure it is present in archive
    setPatientRecords((prev) => {
      const exists = prev.some((r) => r.id === result.id);
      if (exists) return prev.map((r) => (r.id === result.id ? result : r));
      return [result, ...prev];
    });
  };

  const handleSaveToArchive = (result: DiagnosticResult) => {
    setPatientRecords((prev) => {
      const exists = prev.some((r) => r.id === result.id);
      if (exists) return prev.map((r) => (r.id === result.id ? result : r));
      return [result, ...prev];
    });
  };

  const handleOpenExistingReport = (result: DiagnosticResult) => {
    setActiveReportResult(result);
    setIsReportModalOpen(true);
  };

  // Login handler
  const handleLoginSuccess = (user: { name: string; role: string; branch: string }) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentMode('dashboard');
  };

  if (!isAuthenticated) {
    return (
      <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <LoginView
          language={language}
          onLanguageChange={setLanguage}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  return (
    <div 
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans"
    >
      {/* 1. Header (Top Bar Contract) */}
      <Header
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        language={language}
        onLanguageChange={setLanguage}
        userName={currentUser.name}
        userRole={currentUser.role}
        onLogout={() => setIsAuthenticated(false)}
      />

      {/* 2. Main Body with Sidebar & Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Rapid Navigation Sidebar */}
        <Sidebar
          currentMode={currentMode}
          onSelectMode={setCurrentMode}
          language={language}
          todayCount={patientRecords.length}
          positiveCount={positiveCount}
          onNewAnalysis={() => setIsModeModalOpen(true)}
        />

        {/* Dynamic Views */}
        <main className="flex-1 flex flex-col overflow-hidden">
          
          {currentMode === 'dashboard' && (
            <DashboardView
              onSelectMode={setCurrentMode}
              language={language}
              records={patientRecords}
              onOpenReport={handleOpenExistingReport}
              onNewAnalysis={() => setIsModeModalOpen(true)}
            />
          )}

          {(currentMode === 'live' || currentMode === 'upload') && (
            <AnalysisWorkspace
              mode={currentMode}
              language={language}
              patient={currentPatient}
              onOpenPatientModal={() => setIsPatientModalOpen(true)}
              onGenerateReport={handleGenerateReport}
              onSaveToArchive={handleSaveToArchive}
              labConfig={labConfig}
            />
          )}

          {currentMode === 'patients' && (
            <PatientRecordsView
              records={patientRecords}
              onOpenReport={handleOpenExistingReport}
              language={language}
            />
          )}

          {currentMode === 'settings' && (
            <SettingsView
              labConfig={labConfig}
              onSaveConfig={setLabConfig}
              language={language}
            />
          )}

        </main>

      </div>

      {/* 3. Interactive Modals */}
      
      {/* Mode Selection Modal (Screen 2: Live vs Upload) */}
      <ModeSelectionModal
        isOpen={isModeModalOpen}
        onClose={() => setIsModeModalOpen(false)}
        onSelectMode={(mode) => {
          setCurrentMode(mode);
          setIsModeModalOpen(false);
        }}
        language={language}
      />

      {/* Patient Information Editor Modal */}
      <PatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        patient={currentPatient}
        onSave={setCurrentPatient}
        language={language}
      />

      {/* Official A4 Printable Medical Report (Screen 4) */}
      <MedicalReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        result={activeReportResult}
        labConfig={labConfig}
        language={language}
      />

    </div>
  );
}
