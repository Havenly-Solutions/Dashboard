export enum Role {
  GUEST = "GUEST",
  FREE = "FREE",
  PRO = "PRO",
  NGO_GOLD = "NGO_GOLD",
  ADMIN = "ADMIN",
  FOUNDER = "FOUNDER",
  PA = "PA",
  MANAGER = "MANAGER",
  DEVELOPER = "DEVELOPER",
  INVESTOR = "INVESTOR",
  NGO_PARTNER = "NGO_PARTNER",
  CHIEF_OFFICER = "CHIEF_OFFICER"
}

export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  createdAt?: string;
  lastLogin?: string;
  avatar?: string;
  status?: string;
}

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [Role.GUEST]: ["/dashboard", "/dashboard/settings", "/dashboard/resource-centre"],
  [Role.FREE]: ["/dashboard", "/dashboard/settings", "/dashboard/resource-centre"],
  [Role.PRO]: ["/dashboard", "/dashboard/incidents", "/dashboard/settings", "/dashboard/resource-centre"],
  [Role.NGO_GOLD]: ["/dashboard", "/dashboard/sos-alerts", "/dashboard/ngo-portal", "/dashboard/settings"],
  [Role.ADMIN]: ["/dashboard", "/dashboard/sos-alerts", "/dashboard/mesh-topology", "/dashboard/safety-logs", "/dashboard/ngo-portal", "/dashboard/pre-registrations", "/dashboard/analytics", "/dashboard/broadcast", "/dashboard/settings"],
  [Role.FOUNDER]: ["*"],
  [Role.CHIEF_OFFICER]: ["*"],
  [Role.PA]: ["/dashboard", "/dashboard/sos-alerts", "/dashboard/analytics", "/dashboard/team", "/dashboard/pre-registrations", "/dashboard/incidents", "/dashboard/approvals", "/dashboard/settings"],
  [Role.MANAGER]: ["/dashboard", "/dashboard/analytics", "/dashboard/team", "/dashboard/pre-registrations", "/dashboard/incidents", "/dashboard/settings"],
  [Role.DEVELOPER]: ["/dashboard", "/dashboard/mesh-topology", "/dashboard/analytics", "/dashboard/settings"],
  [Role.INVESTOR]: ["/dashboard", "/dashboard/analytics", "/dashboard/settings"],
  [Role.NGO_PARTNER]: ["/dashboard/ngo-portal", "/dashboard/settings"],
}

export const ROLE_LABELS: Record<string, string> = {
  [Role.GUEST]: "Guest",
  [Role.FREE]: "Free User",
  [Role.PRO]: "Premium User",
  [Role.NGO_GOLD]: "NGO Partner (Gold)",
  [Role.ADMIN]: "Administrator",
  [Role.FOUNDER]: "Havenly Solutions Founder",
  [Role.CHIEF_OFFICER]: "Chief Officer",
  [Role.PA]: "Personal Assistant (Exec)",
  [Role.MANAGER]: "Regional Manager",
  [Role.DEVELOPER]: "Developer",
  [Role.INVESTOR]: "Investor",
  [Role.NGO_PARTNER]: "NGO Partner",
}

export const ROLE_BADGE_COLORS: Record<string, string> = {
  [Role.GUEST]: "bg-gray-100 text-gray-700 border-gray-200",
  [Role.FREE]: "bg-blue-100 text-blue-700 border-blue-200",
  [Role.PRO]: "bg-purple-100 text-purple-700 border-purple-200",
  [Role.NGO_GOLD]: "bg-emerald-100 text-emerald-700 border-emerald-200",
  [Role.ADMIN]: "bg-red-100 text-red-700 border-red-200",
  [Role.FOUNDER]: "bg-[#1A1A2E] text-white border-[#1A1A2E]",
  [Role.CHIEF_OFFICER]: "bg-[#C0392B] text-white border-[#C0392B]",
  [Role.PA]: "bg-slate-800 text-white border-slate-900",
  [Role.MANAGER]: "bg-zinc-100 text-zinc-900 border-zinc-300 font-bold",
  [Role.DEVELOPER]: "bg-orange-100 text-orange-700 border-orange-200",
  [Role.INVESTOR]: "bg-teal-100 text-teal-700 border-teal-200",
  [Role.NGO_PARTNER]: "bg-emerald-50 text-emerald-600 border-emerald-100",
}

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'ACTIVE' | 'RESOLVED' | 'DISMISSED';

export interface Incident {
  id: string;
  title: string;
  type: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  level?: string;
  description: string;
  location: string;
  lat?: number | null;
  lng?: number | null;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  userId?: string | null;
  userEmail?: string | null;
  module: string;
  origin: string;
  description?: string | null;
  hashSig?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  } | null;
}

export const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  LOW: 'bg-blue-100 text-blue-700 border-blue-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  CRITICAL: 'bg-red-100 text-red-700 border-red-200 animate-pulse',
};

export interface MeshNode {
  id: string;
  nodeId: string;
  name: string;
  type: string;
  status: string;
  eventType?: string | null;
  region?: string | null;
  powerStatus?: string | null;
  connections?: number | null;
  lat?: number | null;
  lng?: number | null;
  batteryLevel?: number | null;
  signalStrength?: number | null;
  latencyLocal: number;
  latencySat?: number | null;
  hopCount?: number | null;
  throughput?: number | null;
  firmware?: string | null;
  lastPing?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NGOStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface NGOPartner {
  id: string;
  orgName: string;
  liaisonName: string;
  liaisonPhone?: string | null;
  orgType: string;
  email: string;
  regNumber?: string | null;
  operatingRegion: string;
  missionStatement?: string | null;
  status: NGOStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface PreRegistration {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  region: string;
  source?: string | null;
  userType?: string | null;
  roleTitle?: string | null;
  status: string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileRequest {
  id: string;
  userId: string;
  field: string;
  oldValue: string;
  newValue: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
  };
}
