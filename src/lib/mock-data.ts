import type {
  AccessChangeLogEntry,
  AppAnalyticsSnapshot,
  ApprovalRequest,
  BreachLogEntry,
  CommsMessage,
  EnquiryReply,
  FinanceSnapshot,
  HelpdeskAgent,
  HelpdeskTicket,
  InvoiceRecord,
  LeaderboardEntry,
  MarketingSnapshot,
  OrgSubscription,
  Partner,
  PaymentMethod,
  RoleGrant,
  SecurityCampaign,
  SosEvent,
  SosLogEntry,
  SupportEnquiry,
  TeamMember,
  UserOverride,
} from "@/types";

// All demo timestamps are relative to "now" so the UI never looks stale.
const minsAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const hoursAgo = (h: number) => minsAgo(h * 60);
const daysAgo = (d: number) => hoursAgo(d * 24);

export function mockSosEvents(): SosEvent[] {
  return [
    {
      id: "sos_1",
      reference: "SOS-4471",
      status: "ACTIVE",
      title: "Panic button \u2014 Sector 7 residential",
      source: "Mobile App / Panic Button",
      latitude: -26.2041,
      longitude: 28.0473,
      address: "12 Jorissen St, Braamfontein, Johannesburg",
      responderId: "resp_2",
      responderName: "Responder Beta",
      responseTimeSeconds: 252,
      slaTargetSeconds: 300,
      createdAt: minsAgo(4),
      updatedAt: minsAgo(1),
    },
    {
      id: "sos_2",
      reference: "SOS-4470",
      status: "ACTIVE",
      title: "Facility offline \u2014 Denver depot",
      source: "System / Facility Sensor",
      latitude: -26.1849,
      longitude: 28.1029,
      address: "Denver Industrial, Johannesburg",
      responderId: null,
      responderName: null,
      responseTimeSeconds: null,
      slaTargetSeconds: 600,
      createdAt: minsAgo(11),
      updatedAt: minsAgo(11),
    },
    {
      id: "sos_3",
      reference: "SOS-4468",
      status: "PENDING",
      title: "Maintenance: cooling system \u2014 server room 2B",
      source: "System / Infra Monitoring",
      latitude: -26.195,
      longitude: 28.034,
      address: "Havenly Ops Centre, Johannesburg",
      responderId: null,
      responderName: null,
      responseTimeSeconds: null,
      slaTargetSeconds: 1800,
      createdAt: minsAgo(38),
      updatedAt: minsAgo(38),
    },
    {
      id: "sos_4",
      reference: "SOS-4462",
      status: "RESOLVED",
      title: "Panic button \u2014 Sandton CBD",
      source: "Mobile App / Panic Button",
      latitude: -26.1076,
      longitude: 28.0567,
      address: "Rivonia Rd, Sandton",
      responderId: "resp_1",
      responderName: "Responder Alpha",
      responseTimeSeconds: 187,
      slaTargetSeconds: 300,
      createdAt: hoursAgo(3),
      updatedAt: hoursAgo(2.6),
    },
  ];
}

export function mockSosLog(): SosLogEntry[] {
  return [
    { id: "log_1", sosEventId: "sos_1", channel: "RESPONDER", message: "Responder Beta en route, ETA 3 min.", createdAt: minsAgo(1) },
    { id: "log_2", sosEventId: "sos_2", channel: "SYSTEM", message: "Routine firewall update complete. Performance optimized.", createdAt: minsAgo(6) },
    { id: "log_3", sosEventId: null, channel: "SYSTEM", message: "Scheduled hardware replacement in server room 2B.", createdAt: minsAgo(20) },
    { id: "log_4", sosEventId: "sos_1", channel: "DISPATCH", message: "Dispatch confirmed \u2014 unit assigned, within target SLA.", createdAt: minsAgo(3) },
    { id: "log_5", sosEventId: "sos_4", channel: "RESPONDER", message: "Scene secured, resident safe. Closing case.", createdAt: hoursAgo(2.6) },
  ];
}

export function mockHelpdeskTickets(): HelpdeskTicket[] {
  const cats: HelpdeskTicket["category"][] = ["TECHNICAL", "BILLING", "SECURITY", "GENERAL"];
  const names = ["Naledi Khumalo", "Sipho Dlamini", "Amahle Mokoena", "Johan van der Merwe", "Thandiwe Ngcobo", "Rethabile Mokoena"];
  return Array.from({ length: 12 }).map((_, i) => ({
    id: `tkt_${i + 1}`,
    ticketNumber: `HD-${1042 + i}`,
    subject: [
      "App not receiving panic alerts",
      "Invoice discrepancy for October",
      "Suspicious login on my account",
      "How do I add a family member?",
      "Responder location not updating",
      "Refund request \u2014 duplicate charge",
    ][i % 6]!,
    requesterName: names[i % names.length]!,
    requesterEmail: `${names[i % names.length]!.toLowerCase().replace(/ /g, ".")}@example.co.za`,
    category: cats[i % cats.length]!,
    priority: (["CRITICAL", "HIGH", "NORMAL", "LOW"] as const)[i % 4]!,
    status: (["UNASSIGNED", "IN_PROGRESS", "PENDING", "RESOLVED"] as const)[i % 4]!,
    assignedAgentId: i % 4 === 0 ? null : `agent_${(i % 3) + 1}`,
    assignedAgentName: i % 4 === 0 ? null : ["Alex Miller", "Jordan Wu", "Sarah Linn"][i % 3]!,
    slaTargetMinutes: 60,
    firstResponseMinutes: i % 4 === 3 ? 4 + i : null,
    createdAt: hoursAgo(i + 1),
    updatedAt: minsAgo(i * 7 + 2),
  }));
}

export function mockHelpdeskAgents(): HelpdeskAgent[] {
  return [
    { id: "agent_1", name: "Alex Miller", activeTickets: 6, avgResponseMinutes: 4.2, rating: "EXCELLENT" },
    { id: "agent_2", name: "Jordan Wu", activeTickets: 4, avgResponseMinutes: 6.8, rating: "GOOD" },
    { id: "agent_3", name: "Sarah Linn", activeTickets: 8, avgResponseMinutes: 11.4, rating: "NEEDS_ATTENTION" },
  ];
}

export function mockEnquiries(): SupportEnquiry[] {
  return [
    {
      id: "enq_1",
      customerName: "David Chen",
      customerEmail: "david.chen@example.com",
      plan: "ENTERPRISE",
      subject: "API Documentation Request",
      message: "Can you point me to the latest webhooks reference for SOS event callbacks?",
      sentiment: "NEUTRAL",
      status: "OPEN",
      rating: null,
      createdAt: hoursAgo(2),
    },
    {
      id: "enq_2",
      customerName: "Elena Rossi",
      customerEmail: "elena.rossi@example.com",
      plan: "ADVANCED",
      subject: "Technical Issue: Data Export",
      message: "Exports are timing out for our organization's full audit log. Can you help?",
      sentiment: "NEGATIVE",
      status: "FLAGGED",
      rating: 2,
      createdAt: hoursAgo(5),
    },
    {
      id: "enq_3",
      customerName: "Julian Pierce",
      customerEmail: "julian.pierce@example.com",
      plan: "STARTER",
      subject: "Pricing for Non-Profits",
      message: "Do you offer discounted pricing for registered NGOs operating in rural areas?",
      sentiment: "POSITIVE",
      status: "REPLIED",
      rating: 5,
      createdAt: daysAgo(1),
    },
    {
      id: "enq_4",
      customerName: "Lisa Wu",
      customerEmail: "lisa.wu@example.com",
      plan: "ENTERPRISE",
      subject: "Partnership Inquiry",
      message: "We're interested in the enterprise plan for our municipal safety programme.",
      sentiment: "POSITIVE",
      status: "OPEN",
      rating: null,
      createdAt: daysAgo(1.4),
    },
  ];
}

export function mockEnquiryReplies(enquiryId: string): EnquiryReply[] {
  return [
    {
      id: `rep_${enquiryId}_1`,
      enquiryId,
      body: "Thanks for flagging this \u2014 looking into it now and will follow up within the hour.",
      authorName: "Havenly Support",
      createdAt: hoursAgo(1),
    },
  ];
}

export function mockMarketingSnapshot(): MarketingSnapshot {
  return {
    rangeLabel: "Last 30 days",
    visitors: 48210,
    visitorsDelta: 12.4,
    signups: 1862,
    signupsDelta: 8.1,
    conversionRate: 3.86,
    conversionRateDelta: -0.4,
    avgSessionSeconds: 154,
    topSources: [
      { source: "Organic Search", visitors: 19420, share: 40.3 },
      { source: "Direct", visitors: 11890, share: 24.7 },
      { source: "Social \u2014 Instagram", visitors: 6720, share: 13.9 },
      { source: "Referral \u2014 NGO Partners", visitors: 5210, share: 10.8 },
      { source: "Paid \u2014 Google Ads", visitors: 4970, share: 10.3 },
    ],
    funnel: [
      { stage: "Site visitors", count: 48210 },
      { stage: "Pricing page views", count: 14320 },
      { stage: "Signup started", count: 3980 },
      { stage: "Signup completed", count: 1862 },
      { stage: "Paid conversion", count: 412 },
    ],
    trend: Array.from({ length: 8 }).map((_, i) => ({
      label: `Wk ${i + 1}`,
      visitors: 4800 + Math.round(Math.sin(i) * 900) + i * 220,
      signups: 180 + Math.round(Math.cos(i) * 40) + i * 9,
    })),
    topPages: [
      { path: "/", views: 22040, avgTimeSeconds: 48 },
      { path: "/pricing", views: 14320, avgTimeSeconds: 96 },
      { path: "/safety-for-families", views: 8120, avgTimeSeconds: 132 },
      { path: "/ngo-partners", views: 5310, avgTimeSeconds: 88 },
      { path: "/blog/community-response-times", views: 3960, avgTimeSeconds: 210 },
    ],
  };
}

export function mockAppAnalyticsSnapshot(): AppAnalyticsSnapshot {
  return {
    rangeLabel: "Last 30 days",
    dau: 9840,
    dauDelta: 6.2,
    mau: 41200,
    wau: 22110,
    activeInstalls: 58430,
    installsDelta: 4.8,
    crashFreeRate: 99.31,
    avgSessionMinutes: 5.4,
    panicButtonActivations: 214,
    gsmUptime: 99.94,
    satelliteUptime: 99.71,
    platformSplit: [
      { platform: "Android", share: 71 },
      { platform: "iOS", share: 29 },
    ],
    trend: Array.from({ length: 8 }).map((_, i) => ({
      label: `Wk ${i + 1}`,
      dau: 8200 + Math.round(Math.sin(i / 1.3) * 700) + i * 180,
      installs: 51000 + i * 900,
    })),
    deviceHealth: [
      { label: "GSM Network", status: "STABLE", detail: "99.94% uptime, 24 towers reporting" },
      { label: "Satellite Fallback", status: "STABLE", detail: "99.71% uptime, last check 2m ago" },
      { label: "Push Notification Service", status: "DEGRADED", detail: "Elevated latency on Android FCM, investigating" },
      { label: "Panic Button Hardware Sync", status: "STABLE", detail: "312 devices reporting, all green" },
    ],
  };
}

export function mockTeamMembers(): TeamMember[] {
  const roles: TeamMember["role"][] = ["CO_FOUNDER", "MANAGER", "PA", "DEVELOPER", "NGO_PARTNER", "INVESTOR"];
  const names = ["Elara Vance", "Marcus Thorne", "Li Na Wei", "Julian Deeks", "Naledi Khumalo", "Sipho Dlamini"];
  return names.map((name, i) => ({
    id: `member_${i + 1}`,
    name,
    email: `${name.toLowerCase().replace(/ /g, ".")}@havenly.io`,
    role: roles[i % roles.length]!,
    status: (["ACTIVE", "ACTIVE", "INVITED", "ACTIVE", "ACTIVE", "SUSPENDED"] as const)[i]!,
    organizationName: i === 4 ? "Global Relief NGO" : null,
    lastActiveAt: i === 5 ? null : minsAgo(i * 40 + 5),
    invitedAt: i === 2 ? daysAgo(2) : null,
  }));
}

export function mockApprovalRequests(): ApprovalRequest[] {
  return [
    { id: "app_1", applicantName: "Rethabile Mokoena", applicantEmail: "rethabile.m@example.com", requestedRole: "MANAGER", requestedAt: hoursAgo(6), note: "Regional coordinator, Gauteng South" },
    { id: "app_2", applicantName: "Johan van der Merwe", applicantEmail: "johan.vdm@example.com", requestedRole: "DEVELOPER", requestedAt: hoursAgo(20), note: "Referred by Marcus Thorne" },
  ];
}

export function mockSecurityCampaigns(): SecurityCampaign[] {
  return [
    { id: "camp_1", name: "Q4 Urgency Simulation", type: "PHISHING_SIMULATION", status: "RUNNING", targeted: 312, opened: 118, submitted: 22, reportedSuspicious: 74, startedAt: daysAgo(3), endsAt: daysAgo(-4) },
    { id: "camp_2", name: "Engineering Credential Test", type: "CREDENTIAL_TEST", status: "COMPLETED", targeted: 48, opened: 41, submitted: 6, reportedSuspicious: 30, startedAt: daysAgo(14), endsAt: daysAgo(9) },
  ];
}

export function mockLeaderboard(): LeaderboardEntry[] {
  return ["Li Na Wei", "Julian Deeks", "Sipho Dlamini", "Marcus Thorne", "Naledi Khumalo"].map((name, i) => ({
    id: `lb_${i + 1}`,
    name,
    points: 4200 - i * 380,
    challengesSolved: 22 - i * 3,
    rank: i + 1,
  }));
}

export function mockBreachLogs(): BreachLogEntry[] {
  return [
    { id: "brc_1", severity: "LOW", summary: "Repeated failed logins from single IP, auto-blocked.", system: "Auth Service", detectedAt: hoursAgo(9), resolvedAt: hoursAgo(8.7) },
    { id: "brc_2", severity: "MEDIUM", summary: "Unusual export volume flagged for review.", system: "Data Export API", detectedAt: daysAgo(2), resolvedAt: daysAgo(1.9) },
  ];
}

export function mockFinanceSnapshot(): FinanceSnapshot {
  return {
    mrr: 284500,
    mrrDelta: 5.6,
    arr: 3414000,
    outstandingInvoices: 6,
    churnRate: 1.8,
    revenueBySource: [
      { source: "Subscriptions", amount: 231000 },
      { source: "One-time services", amount: 53500 },
    ],
    trend: Array.from({ length: 6 }).map((_, i) => ({ label: `M${i + 1}`, revenue: 210000 + i * 14500 })),
  };
}

export function mockPartners(): Partner[] {
  return [
    { id: "org_1", name: "Global Relief NGO", type: "NGO", region: "Gauteng", activeCases: 14, contactName: "Naledi Khumalo", contactEmail: "naledi@globalrelief.org", status: "ACTIVE" },
    { id: "org_2", name: "City of Johannesburg \u2014 Public Safety", type: "MUNICIPAL", region: "Johannesburg", activeCases: 31, contactName: "Thandiwe Ngcobo", contactEmail: "t.ngcobo@joburg.gov.za", status: "ACTIVE" },
    { id: "org_3", name: "SafeStreets Foundation", type: "NGO", region: "Western Cape", activeCases: 5, contactName: "Johan van der Merwe", contactEmail: "johan@safestreets.org.za", status: "PENDING" },
  ];
}

export function mockCommsMessages(): CommsMessage[] {
  return [
    { id: "cm_1", channel: "EMAIL", fromName: "Havenly Support", toName: "David Chen", subject: "Re: API Documentation Request", body: "Attached the updated webhooks reference.", createdAt: hoursAgo(1), read: true },
    { id: "cm_2", channel: "IN_APP", fromName: "System", toName: "Founder Command Center", subject: null, body: "Weekly digest ready for review.", createdAt: hoursAgo(5), read: false },
  ];
}

export function mockRoleGrants(): RoleGrant[] {
  return [
    { role: "CO_FOUNDER", moduleKey: "app-analytics", enabled: true },
    { role: "MANAGER", moduleKey: "finance", enabled: false },
  ];
}

export function mockUserOverrides(): UserOverride[] {
  return [
    {
      id: "ov_1",
      userId: "member_2",
      userName: "Marcus Thorne",
      userRole: "MANAGER",
      moduleKey: "security",
      enabled: true,
      reason: "Covering for security lead during leave",
      grantedByName: "You",
      grantedAt: daysAgo(3),
    },
  ];
}

export function mockAccessChangeLog(): AccessChangeLogEntry[] {
  return [
    { id: "log_1", summary: "Granted Marcus Thorne (Manager) access to Security Suite", actorName: "You", createdAt: daysAgo(3) },
    { id: "log_2", summary: "Enabled App & System Analytics for all Co-Founders", actorName: "You", createdAt: daysAgo(6) },
    { id: "log_3", summary: "Disabled Finance Hub for all Managers", actorName: "You", createdAt: daysAgo(10) },
  ];
}

export function mockOrgSubscriptions(): OrgSubscription[] {
  return [
    { id: "sub_1", organizationName: "Apex Global", tier: "GOLD", billingCycle: "ANNUAL", status: "PAID", mrr: 42000, renewsAt: daysAgo(-40), seatsUsed: 34, seatsAllowed: 50 },
    { id: "sub_2", organizationName: "Echo Media", tier: "SILVER", billingCycle: "MONTHLY", status: "PENDING", mrr: 18500, renewsAt: daysAgo(-6), seatsUsed: 12, seatsAllowed: 20 },
    { id: "sub_3", organizationName: "Lumina Labs", tier: "BRONZE", billingCycle: "MONTHLY", status: "OVERDUE", mrr: 6200, renewsAt: daysAgo(-2), seatsUsed: 5, seatsAllowed: 10 },
    { id: "sub_4", organizationName: "Global Relief NGO", tier: "ENTERPRISE", billingCycle: "ANNUAL", status: "PAID", mrr: 0, renewsAt: daysAgo(-120), seatsUsed: 18, seatsAllowed: 100 },
  ];
}

export function mockPaymentMethods(): PaymentMethod[] {
  return [
    { id: "pm_1", provider: "STRIPE", brand: "Visa", last4: "4242", expMonth: 8, expYear: 2027, isDefault: true },
  ];
}

export function mockInvoices(): InvoiceRecord[] {
  return [
    { id: "inv_1", number: "INV-2026-0091", amount: 4500, status: "PAID", issuedAt: daysAgo(28), pdfUrl: null },
    { id: "inv_2", number: "INV-2026-0064", amount: 4500, status: "PAID", issuedAt: daysAgo(58), pdfUrl: null },
  ];
}
