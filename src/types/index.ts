export type ProjectStatus = 'planned' | 'ongoing' | 'delayed' | 'completed' | 'suspended';

export type FundSource =
  | 'NTA'
  | '20% Dev Fund'
  | 'SEF'
  | 'LDRRMF'
  | 'GAD'
  | 'Provincial General Fund'
  | 'Loan/Grant';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type WorkflowStatus =
  | 'draft'
  | 'pending_ppdo'
  | 'pending_peo'
  | 'pending_budget'
  | 'approved'
  | 'rejected';

export type WorkflowRole = 'PPDO' | 'PEO' | 'Budget Office';

export interface WorkflowApproval {
  role: WorkflowRole;
  status: 'pending' | 'approved' | 'rejected' | 'revision';
  remarks?: string;
  actionedBy?: string;
  actionedAt?: string;
}

export interface DuplicateFlag {
  matchId: string;
  matchName: string;
  locationSimilarity: number;
  scopeSimilarity: number;
  overallScore: number;
}

export interface AIClassification {
  sector: string;
  fundSource: FundSource;
  aipIndicator: string;
  confidence: number;
}

export interface DraftProject {
  id: string;
  title: string;
  description: string;
  sector: string;
  municipalityId: string;
  barangayId?: string;
  coords?: [number, number];
  fundSource: FundSource;
  contractAmount: number;
  aipIndicator: string;
  implementingOffice: string;
  contractorId?: string;
  startDate: string;
  endDate: string;
  workflowStatus: WorkflowStatus;
  createdBy: string;
  createdAt: string;
  approvals: WorkflowApproval[];
  attachments: { name: string; type: 'POW' | 'Contract' | 'Other' }[];
  duplicateFlags: DuplicateFlag[];
  aiClassification?: AIClassification;
}

export interface EditHistoryEntry {
  id: string;
  projectId: string;
  timestamp: string;
  user: string;
  role: string;
  field: string;
  oldValue: string;
  newValue: string;
  reason: string;
  category: 'Financial' | 'Timeline' | 'Scope' | 'Personnel' | 'Status';
}

export interface ClosureItem {
  id: string;
  label: string;
  category: 'Inspection' | 'Financial' | 'Documentation';
  required: boolean;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
  attachmentName?: string;
  notes?: string;
}

export interface Municipality {
  id: string;
  name: string;
  barangayCount: number;
}

export interface Barangay {
  id: string;
  name: string;
  municipalityId: string;
}

export interface Contractor {
  id: string;
  name: string;
  performanceScore: number;
  completedProjects: number;
  delayedProjects: number;
}

export interface Milestone {
  id: string;
  name: string;
  targetDate: string;
  actualDate?: string;
  completed: boolean;
}

export interface VariationOrder {
  id: string;
  description: string;
  amount: number;
  dateApproved: string;
}

export interface SCurveDataPoint {
  month: string;
  planned: number;
  actual: number;
}

export interface Project {
  id: string;
  name: string;
  implementingOffice: string;
  contractorId: string;
  fundSource: FundSource;
  contractAmount: number;
  municipalityId: string;
  barangayId?: string;
  status: ProjectStatus;
  startDate: string;
  targetEndDate: string;
  actualEndDate?: string;
  plannedProgress: number;
  actualProgress: number;
  milestones: Milestone[];
  variationOrders: VariationOrder[];
  sCurve: SCurveDataPoint[];
  riskLevel: RiskLevel;
  riskScore: number;
  isGhostFlagged: boolean;
  lastUpdateDate: string;
  sector: string;
  description: string;
}

export interface FundLedger {
  fundSource: FundSource;
  appropriation: number;
  allotment: number;
  obligation: number;
  disbursement: number;
  municipalityId?: string;
}

export interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  title: string;
  message: string;
  projectId?: string;
  date: string;
}

export interface KPISummary {
  totalProjects: number;
  completedProjects: number;
  ongoingProjects: number;
  delayedProjects: number;
  suspendedProjects: number;
  plannedProjects: number;
  totalBudget: number;
  totalObligated: number;
  totalDisbursed: number;
  overallAccomplishment: number;
  budgetUtilizationRate: number;
  atRiskProjects: number;
}

export interface DrillLevel {
  level: 'province' | 'municipality' | 'barangay' | 'project';
  id?: string;
  name?: string;
}

// Intake form shape (used in ProjectIntakeModal)
export interface IntakeFormData {
  title: string;
  description: string;
  sector: string;
  municipalityId: string;
  barangayId: string;
  fundSource: FundSource | '';
  contractAmount: string;
  aipIndicator: string;
  implementingOffice: string;
  contractorId: string;
  startDate: string;
  endDate: string;
  coords: [number, number] | null;
  attachments: { name: string; size: string; type: 'POW' | 'Contract' | 'Other' }[];
}
