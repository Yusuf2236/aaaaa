import React, { useState } from 'react';
import { CONTRACT_LAB_CASES } from './data/contracts';
import { ContractLabCase, Severity, DeployedContractRecord } from './types';
import { Web3Provider } from './context/Web3Context';
import { Navbar } from './components/Navbar';
import { AuditStepperHeader } from './components/AuditStepperHeader';
import { AuditStepperFooter } from './components/AuditStepperFooter';
import { IntroOverviewTab } from './components/IntroOverviewTab';
import { ManualAuditTab } from './components/ManualAuditTab';
import { StaticAnalysisTab } from './components/StaticAnalysisTab';
import { ExploitTestRunnerTab } from './components/ExploitTestRunnerTab';
import { SeverityClassificationTab } from './components/SeverityClassificationTab';
import { FixAndVerifyTab } from './components/FixAndVerifyTab';
import { AIAuditReviewTab } from './components/AIAuditReviewTab';
import { BlockchainDeployTab } from './components/BlockchainDeployTab';
import { AuditReportTab } from './components/AuditReportTab';
import { ErrorBoundary } from './components/ErrorBoundary';

function AuditLabContent() {
  const [contracts, setContracts] = useState<ContractLabCase[]>(CONTRACT_LAB_CASES);
  const [selectedContractId, setSelectedContractId] = useState<string>(CONTRACT_LAB_CASES[0].id);

  // Read initial tab from URL hash if valid, otherwise default to 'intro'
  const getInitialTab = (): string => {
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['intro', 'manual', 'static', 'exploit', 'severity', 'fix', 'ai-review', 'deploy', 'report'];
    return validTabs.includes(hash) ? hash : 'intro';
  };

  const [activeTab, setActiveTabState] = useState<string>(getInitialTab);

  const setActiveTab = (tabId: string) => {
    setActiveTabState(tabId);
    if (window.location.hash.replace('#', '') !== tabId) {
      window.history.pushState(null, '', `#${tabId}`);
    }
  };

  // Sync with browser native back/forward buttons
  React.useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      const validTabs = ['intro', 'manual', 'static', 'exploit', 'severity', 'fix', 'ai-review', 'deploy', 'report'];
      if (validTabs.includes(hash)) {
        setActiveTabState(hash);
      } else {
        setActiveTabState('intro');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dynamic Completed tasks across the lab (synced with backend)
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    'task-1': true,
    'task-2': false,
    'task-3': false,
    'task-4': false,
    'task-5': false,
    'task-6': false,
    'task-7': false,
  });

  // Dynamic Student auditor notes (synced with backend)
  const [studentNotes, setStudentNotes] = useState<Record<string, string>>({});

  // Fetch dynamic contracts from disk, notes and progress on mount
  React.useEffect(() => {
    fetch('/api/contracts')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.contracts?.length) {
          setContracts(data.contracts);
        }
      })
      .catch(() => {});

    fetch('/api/notes')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          setStudentNotes(data);
        }
      })
      .catch(() => {});

    fetch('/api/progress')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          setCompletedTasks(data);
        }
      })
      .catch(() => {});
  }, []);

  const activeContract =
    contracts.find((c) => c.id === selectedContractId) || contracts[0];

  const updateProgress = (newTasks: Record<string, boolean>) => {
    setCompletedTasks(newTasks);
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTasks)
    }).catch(() => {});
  };

  // Handlers for student interactions
  const handleCompleteChecklist = (contractId: string, checkId: string) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id === contractId) {
          const updated = c.manualAuditChecklist.map((item) =>
            item.id === checkId ? { ...item, completed: !item.completed } : item
          );
          return { ...c, manualAuditChecklist: updated };
        }
        return c;
      })
    );
    updateProgress({ ...completedTasks, 'task-1': true });
  };

  const handleSaveNotes = (contractId: string, notes: string) => {
    const updated = { ...studentNotes, [contractId]: notes };
    setStudentNotes(updated);
    fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).catch(() => {});
    updateProgress({ ...completedTasks, 'task-1': true });
  };

  const handleScanCompleted = (contractId: string) => {
    updateProgress({ ...completedTasks, 'task-2': true });
  };

  const handleExploitVerified = (contractId: string) => {
    updateProgress({ ...completedTasks, 'task-3': true });
  };

  const handleSeverityClassified = (contractId: string, severity: Severity) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === contractId ? { ...c, severity } : c))
    );
    updateProgress({ ...completedTasks, 'task-4': true });
  };

  const handleFixVerified = (contractId: string) => {
    updateProgress({ ...completedTasks, 'task-5': true });
  };

  const handleAIReviewCompleted = (contractId: string) => {
    updateProgress({ ...completedTasks, 'task-6': true });
  };

  const handleDeploySuccess = (record: DeployedContractRecord) => {
    updateProgress({ ...completedTasks, 'task-7': true });
  };

  const handleStartAudit = (tabId: string, contractId?: string) => {
    if (contractId) {
      setSelectedContractId(contractId);
    }
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 7) * 100);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col antialiased">
      {/* Sleek Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        progressPercent={progressPercent}
        completedTasksCount={completedCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ErrorBoundary>
        {activeTab === 'intro' ? (
          /* Guided Landing / Overview View */
          <IntroOverviewTab
            contracts={contracts}
            onStartAudit={handleStartAudit}
            completedTasksCount={completedCount}
          />
        ) : (
          /* Step-by-Step Guided Workspace View */
          <div>
            <AuditStepperHeader
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              contracts={contracts}
              selectedContractId={selectedContractId}
              onSelectContract={(id) => setSelectedContractId(id)}
              completedTasks={completedTasks}
            />

            {/* Focused Active Tab Content */}
            <div className="animate-fadeIn">
              {activeTab === 'manual' && (
                <ManualAuditTab
                  contract={activeContract}
                  onCompleteChecklist={handleCompleteChecklist}
                  studentNotes={studentNotes}
                  onSaveNotes={handleSaveNotes}
                />
              )}

              {activeTab === 'static' && (
                <StaticAnalysisTab
                  contract={activeContract}
                  onScanCompleted={handleScanCompleted}
                  isScanned={completedTasks['task-2']}
                />
              )}

              {activeTab === 'exploit' && (
                <ExploitTestRunnerTab
                  contract={activeContract}
                  onExploitVerified={handleExploitVerified}
                  isVerified={completedTasks['task-3']}
                />
              )}

              {activeTab === 'severity' && (
                <SeverityClassificationTab
                  contract={activeContract}
                  onClassified={handleSeverityClassified}
                  isClassified={completedTasks['task-4']}
                />
              )}

              {activeTab === 'fix' && (
                <FixAndVerifyTab
                  contract={activeContract}
                  onFixVerified={handleFixVerified}
                  isVerified={completedTasks['task-5']}
                  onDeploySuccess={handleDeploySuccess}
                />
              )}

              {activeTab === 'ai-review' && (
                <AIAuditReviewTab
                  contract={activeContract}
                  onReviewCompleted={handleAIReviewCompleted}
                  isReviewed={completedTasks['task-6']}
                />
              )}

              {activeTab === 'deploy' && (
                <BlockchainDeployTab
                  contract={activeContract}
                  onDeploySuccess={handleDeploySuccess}
                />
              )}

              {activeTab === 'report' && (
                <AuditReportTab
                  contracts={contracts}
                  studentNotes={studentNotes}
                  completedTasks={completedTasks}
                />
              )}
            </div>

            {/* Guided Stepper Bottom Navigation */}
            <AuditStepperFooter
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              contractName={activeContract.fileName}
            />
          </div>
        )}
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#060a12] py-4 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Smart-Kontrakt Xavfsizlik Auditi Laboratoriyasi Platformasi</span>
          <span className="font-mono text-cyan-400 font-bold">
            A23, A16, A8 · TN2, TN4 · Guided Stepper Edition · Foundry / Remix / Slither
          </span>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <Web3Provider>
      <AuditLabContent />
    </Web3Provider>
  );
}

export default App;
