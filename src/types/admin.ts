export type UserRole = 
  | 'admin_org'
  | 'manager' 
  | 'tech_lead'
  | 'senior_dev'
  | 'junior_dev'
  | 'security_expert'
  | 'security_analyst'
  | 'ciso'
  | 'project_manager'
  | 'director'
  | 'user';

export type UserStatus = 'active' | 'inactive' | 'pending';

export interface AdminUser {
  id: string;
  organization_id?: string;
  department_id?: string;
  team_id?: string;
  email: string;
  nom: string;
  role: UserRole;
  status: UserStatus;
  last_login?: string;
  created_at: string;
  permissions: string[];
  niveau?: string;
  points?: number;
  score_securite?: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalAnalyses: number;
  totalVulnerabilities: number;
  averageSecurityScore: number;
  monthlyTrend: string;
}

export interface AdminAnalysis {
  id: string;
  user_id: string;
  user_name: string;
  nom_fichier: string;
  nombre_vulnerabilites: number;
  score_analyse: number;
  language: string;
  created_at: string;
  ai_analysis_used: boolean;
}

export interface LearningModule {
  id?: string;
  title: string;
  description: string;
  content: any;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  status?: 'draft' | 'review' | 'published' | 'archived';
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SecurityRule {
  id?: string;
  name: string;
  description: string;
  language: string;
  pattern: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  customMessage?: string;
  fixSuggestion?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AIPromptTemplate {
  id?: string;
  name: string;
  description: string;
  language: string;
  prompt: string;
  variables?: string[];
  modelConfig?: any;
  isActive: boolean;
  usageCount?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  managerName?: string;
  memberCount?: number;
  teamCount?: number;
}

export interface Team {
  id: string;
  departmentId: string;
  name: string;
  description?: string;
  leadId?: string;
  leadName?: string;
  memberCount?: number;
}

export interface OrganizationMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  teamId?: string;
  teamName?: string;
}