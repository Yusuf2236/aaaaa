import React, { useState } from 'react';
import { CONTRACT_LAB_CASES } from './data/contracts';
import { ContractLabCase, Severity, DeployedContractRecord } from './types';
import { Web3Provider } from './context/Web3Context';
import { Navbar } from './components/Navbar';
import { ContractSelector } from './components/ContractSelector';
import { LabProgressTracker } from './components/LabProgressTracker';
import { LabHeroHeader } from './components/LabHeroHeader';
import { LoginGateBanner } from './components/LoginGateBanner';
import { ManualAuditTab } from './components/ManualAuditTab';
import { StaticAnalysisTab } from './components/StaticAnalysisTab';
import { ExploitTestRunnerTab } from './components/ExploitTestRunnerTab';
import { SeverityClassificationTab } from './components/SeverityClassificationTab';
import { FixAndVerifyTab } from './components/FixAndVerifyTab';
import { AIAuditReviewTab } from './components/AIAuditReviewTab';
import { BlockchainDeployTab } from './components/BlockchainDeployTab';
import { AuditReportTab } from './components/AuditReportTab';

function AuditLabContent() {
  const [contracts, setContracts] = useState<ContractLabCase[]>(CONTRACT_LAB_CASES);
  const [selectedContractId, setSelectedContractId] = useState<string>(CONTRACT_LAB_CASES[0].id);
  const [activeTab, setActiveTab] = useState<string>('manual');

  // Completed tasks across the lab (task-1 to task-7)
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    'task-1': true, // initial manual check active
    'task-2': false,
    'task-3': false,
    'task-4': false,
    'task-5': false,
    'task-6': false,
    'task-7': false,
  });

  // Student auditor notes per contract
  const [studentNotes, setStudentNotes] = useState<Record<string, string>>({
    'case-reentrancy-dao': 'withdraw() ichida balances[msg.sender]=0 tashqi chaqiruvdan keyin qolgan. Checks-Effects-Interactions buzilgan.',
    'case-access-control-parity': 'initWallet public qolgan, istalgan odam owner bo‘lib oladi.',
    'case-oracle-manipulation': 'getReserves() spot narx olingan, flash-loan bilan oson manipulyatsiya qilinadi.',
    'case-integer-overflow': 'Solidity 0.7.6 da ko‘paytirish amali SafeMath-siz toshib 0 ga aylanadi.'
  });

  const activeContract =
    contracts.find((c) => c.id === selectedContractId) || contracts[0];

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
    setCompletedTasks((prev) => ({ ...prev, 'task-1': true }));
  };

  const handleSaveNotes = (contractId: string, notes: string) => {
    setStudentNotes((prev) => ({ ...prev, [contractId]: notes }));
    setCompletedTasks((prev) => ({ ...prev, 'task-1': true }));
  };

  const handleScanCompleted = (contractId: string) => {
    setCompletedTasks((prev) => ({ ...prev, 'task-2': true }));
  };

  const handleExploitVerified = (contractId: string) => {
    setCompletedTasks((prev) => ({ ...prev, 'task-3': true }));
  };

  const handleSeverityClassified = (contractId: string, severity: Severity) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === contractId ? { ...c, severity } : c))
    );
    setCompletedTasks((prev) => ({ ...prev, 'task-4': true }));
  };

  const handleFixVerified = (contractId: string) => {
    setCompletedTasks((prev) => ({ ...prev, 'task-5': true }));
  };

  const handleAIReviewCompleted = (contractId: string) => {
    setCompletedTasks((prev) => ({ ...prev, 'task-6': true }));
  };

  const handleDeploySuccess = (record: DeployedContractRecord) => {
    setCompletedTasks((prev) => ({ ...prev, 'task-7': true }));
  };

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 7) * 100);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col antialiased">
      {/* Main Navbar with Auth (Kirish / Chiqish) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        progressPercent={progressPercent}
        completedTasksCount={completedCount}
      />

      {/* Contract Selector */}
      <ContractSelector
        contracts={contracts}
        selectedContractId={selectedContractId}
        onSelectContract={(id) => setSelectedContractId(id)}
      />

      {/* Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Lab Hero Header (Academic Context & Problem/Solution) */}
        <LabHeroHeader />

        {/* Web3 / Auditor Login Gate Banner (MetaMask-siz yoki MetaMask bilan) */}
        <LoginGateBanner />

        {/* Lab Roadmap Progress */}
        <LabProgressTracker
          completedTasks={completedTasks}
          onSelectTask={(tabId) => setActiveTab(tabId)}
        />

        {/* Tab Views */}
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
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-[#060a12] py-4 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Smart-Kontrakt Xavfsizlik Auditi Laboratoriyasi Platformasi</span>
          <span className="font-mono text-cyan-400 font-bold">
            A23, A16, A8 · TN2, TN4 · MetaMasksiz Kirish / On-Chain Deployment / Foundry / Remix
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
