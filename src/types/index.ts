// ---------------------------------------------------------------------------
// Domain types. These mirror the Prisma schema described in the backend
// audit (User, SOSEvent, AuditLog, Organization, PortalConfig) plus the
// additional resources this dashboard needs (helpdesk tickets, support
// enquiries, marketing/app analytics). Keep this file in sync with
// havenly-backend/src/dashboard DTOs as routes are wired up.
// ---------------------------------------------------------------------------

export type Role =
  | "FOUNDER"
  | "CO_FOUNDER"
  | "MANAGER"
  | "MANAGER_VIDEOGRAPHER"
  | "MANAGER_CONTENT_CREATOR"
  | "DEVELOPER"
  | "CYBERSECURITY"
  | "MEDIA"
  | "NGO_PARTNER"
  | "INVESTOR";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
  organizationId?: string | null;
  organizationName?: string | null;
  mustChangePassword?: boolean;
  onboardingCompletedAt?: string | null;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  accessTokenExpiresAt: string; // ISO timestamp
}

export type SosStatus = "PENDING" | "ACTIVE" | "RESOLVED" | "FALSE_ALARM";

export interface SosEvent {
  id: string;
  reference: string; // e.g. "SOS-4471"
  status: SosStatus;
  title: string;
  source: string; // device / responder / system that raised it
  latitude: number;
  longitude: number;
  address?: string | null;
  responderId?: string | null;
  responderName?: string | null;
  responseTimeSeconds?: number | null;
  slaTargetSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface SosLogEntry {
  id: string;
  sosEventId?: string | null;
  channel: "VOICE" | "SYSTEM" | "RESPONDER" | "DISPATCH";
  message: string;
  createdAt: string;
}

export type TicketStatus = "UNASSIGNED" | "IN_PROGRESS" | "PENDING" | "RESOLVED";
export type TicketPriority = "CRITICAL" | "HIGH" | "NORMAL" | "LOW";
export type TicketCategory = "TECHNICAL" | "BILLING" | "SECURITY" | "GENERAL";

export interface HelpdeskTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  requesterName: string;
  requesterEmail: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedAgentId?: string | null;
  assignedAgentName?: string | null;
  slaTargetMinutes: number;
  firstResponseMinutes?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface HelpdeskAgent {
  id: string;
  name: string;
  avatarUrl?: string | null;
  activeTickets: number;
  avgResponseMinutes: number;
  rating: "EXCELLENT" | "GOOD" | "NEEDS_ATTENTION";
}

export type EnquirySentiment = "POSITIVE" | "NEUTRAL" | "NEGATIVE";
export type EnquiryStatus = "OPEN" | "REPLIED" | "ARCHIVED" | "FLAGGED";

export interface SupportEnquiry {
  id: string;
  customerName: string;
  customerEmail: string;
  plan: "STARTER" | "ADVANCED" | "ENTERPRISE" | "NONE";
  subject: string;
  message: string;
  sentiment: EnquirySentiment;
  status: EnquiryStatus;
  rating?: number | null; // 1-5 stars, optional
  createdAt: string;
}

export interface EnquiryReply {
  id: string;
  enquiryId: string;
  body: string;
  authorName: string;
  createdAt: string;
}

export interface MarketingSnapshot {
  rangeLabel: string;
  visitors: number;
  visitorsDelta: number; // percent
  signups: number;
  signupsDelta: number;
  conversionRate: number; // percent
  conversionRateDelta: number;
  avgSessionSeconds: number;
  topSources: { source: string; visitors: number; share: number }[];
  funnel: { stage: string; count: number }[];
  trend: { label: string; visitors: number; signups: number }[];
  topPages: { path: string; views: number; avgTimeSeconds: number }[];
}

export interface AppAnalyticsSnapshot {
  rangeLabel: string;
  dau: number;
  dauDelta: number;
  mau: number;
  wau: number;
  activeInstalls: number;
  installsDelta: number;
  crashFreeRate: number;
  avgSessionMinutes: number;
  panicButtonActivations: number;
  gsmUptime: number;
  satelliteUptime: number;
  platformSplit: { platform: "iOS" | "Android"; share: number }[];
  trend: { label: string; dau: number; installs: number }[];
  deviceHealth: { label: string; status: "STABLE" | "DEGRADED" | "OFFLINE"; detail: string }[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "ACTIVE" | "INVITED" | "PENDING_APPROVAL" | "SUSPENDED";
  organizationName?: string | null;
  lastActiveAt?: string | null;
  invitedAt?: string | null;
}

export interface ApprovalRequest {
  id: string;
  applicantName: string;
  applicantEmail: string;
  requestedRole: Role;
  requestedAt: string;
  note?: string | null;
}

export interface SecurityCampaign {
  id: string;
  name: string;
  type: "PHISHING_SIMULATION" | "CREDENTIAL_TEST";
  status: "DRAFT" | "RUNNING" | "COMPLETED";
  targeted: number;
  opened: number;
  submitted: number;
  reportedSuspicious: number;
  startedAt?: string | null;
  endsAt?: string | null;
}

export interface SecurityTrainingModule {
  id: string;
  title: string;
  provider: string;
  challenges: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatarUrl?: string | null;
  points: number;
  challengesSolved: number;
  rank: number;
}

export interface BreachLogEntry {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  summary: string;
  system: string;
  detectedAt: string;
  resolvedAt?: string | null;
}

export interface FinanceSnapshot {
  mrr: number;
  mrrDelta: number;
  arr: number;
  outstandingInvoices: number;
  churnRate: number;
  revenueBySource: { source: string; amount: number }[];
  trend: { label: string; revenue: number }[];
}

export interface Partner {
  id: string;
  name: string;
  type: "NGO" | "MUNICIPAL" | "CORPORATE";
  region: string;
  activeCases: number;
  contactName: string;
  contactEmail: string;
  status: "ACTIVE" | "PENDING" | "INACTIVE";
}

export interface CommsMessage {
  id: string;
  channel: "EMAIL" | "IN_APP";
  fromName: string;
  toName: string;
  subject?: string | null;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface RoleGrant {
  role: Role;
  moduleKey: string;
  enabled: boolean;
}

export interface UserOverride {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  moduleKey: string;
  enabled: boolean;
  reason?: string | null;
  grantedByName: string;
  grantedAt: string;
}

export interface AccessControlState {
  roleGrants: RoleGrant[];
  userOverrides: UserOverride[];
}

export interface AccessChangeLogEntry {
  id: string;
  summary: string;
  actorName: string;
  createdAt: string;
}

export type SubscriptionTier = "STARTER" | "BRONZE" | "SILVER" | "GOLD" | "ENTERPRISE";
export type BillingStatus = "PAID" | "PENDING" | "OVERDUE";

export interface OrgSubscription {
  id: string;
  organizationName: string;
  tier: SubscriptionTier;
  billingCycle: "MONTHLY" | "ANNUAL";
  status: BillingStatus;
  mrr: number;
  renewsAt: string;
  seatsUsed: number;
  seatsAllowed: number;
}

export type PaymentProvider = "STRIPE" | "PAYSTACK" | "YOCO" | "PADDLE";

export interface PaymentMethod {
  id: string;
  provider: PaymentProvider;
  brand: string; // "Visa", "Mastercard", ...
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface InvoiceRecord {
  id: string;
  number: string;
  amount: number;
  status: "PAID" | "PENDING" | "OVERDUE";
  issuedAt: string;
  pdfUrl?: string | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
