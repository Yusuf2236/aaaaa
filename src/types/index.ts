export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export type Category = 
  | 'reentrancy' 
  | 'access_control' 
  | 'oracle_manipulation' 
  | 'integer_overflow'
  | 'signature_replay';

export interface Finding {
  id: string;
  title: string;
  severity: Severity;
  category: Category;
  swcId: string;
  cweId: string;
  vulnerableLines: number[];
  description: string;
  impact: string;
  rootCause: string;
  recommendation: string;
  aiDetection: {
    status: 'correct' | 'missed' | 'hallucination' | 'incomplete';
    aiSummary: string;
    humanCritique: string;
  };
}

export interface SlitherIssue {
  id: string;
  check: string;
  impact: Severity;
  confidence: 'High' | 'Medium' | 'Low';
  description: string;
  lines: number[];
  recommendation: string;
}

export interface ExploitTraceStep {
  step: number;
  actor: string;
  action: string;
  gasUsed: string;
  stateDelta: string;
  status: 'reverted' | 'success' | 'hijacked';
}

export interface ExploitTestScenario {
  testFramework: 'Foundry' | 'Hardhat';
  testFileName: string;
  testCode: string;
  initialState: {
    contractBalance: string;
    attackerBalance: string;
    victimDeposit: string;
  };
  exploitTrace: ExploitTraceStep[];
  finalStateVulnerable: {
    contractBalance: string;
    attackerBalance: string;
    lossPct: string;
  };
  finalStatePatched: {
    contractBalance: string;
    attackerBalance: string;
    result: string;
  };
}

export interface ContractLabCase {
  id: string;
  title: string;
  fileName: string;
  historicalIncident: {
    name: string;
    date: string;
    stolenAmount: string;
    victim: string;
    summary: string;
  };
  category: Category;
  severity: Severity;
  summary: string;
  manualAuditChecklist: {
    id: string;
    task: string;
    hint: string;
    completed: boolean;
  }[];
  vulnerableCode: string;
  fixedCode: string;
  fixDiffNotes: string[];
  findings: Finding[];
  slitherReport: {
    summary: string;
    issues: SlitherIssue[];
  };
  exploitScenario: ExploitTestScenario;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  role: string;
  authMethod: 'metamask' | 'credentials' | 'private_key' | 'demo';
  address: string;
  avatar?: string;
  createdAt: string;
}

export interface DeployedContractRecord {
  id: string;
  contractId: string;
  contractName: string;
  deployedAddress: string;
  txHash: string;
  blockNumber: number;
  networkId: string;
  networkName: string;
  signerAddress: string;
  signature: string;
  timestamp: string;
  status: 'confirmed' | 'pending';
  gasUsed: string;
  compilerVersion: string;
  optimizationEnabled: boolean;
  isVerifiedOnChain: boolean;
  securityScore: number;
  isRealOnChain?: boolean;
}
