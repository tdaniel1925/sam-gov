// =============================================================================
// DATABASE SCHEMA
// Following CodeBakers pattern 01-database.md
// =============================================================================

import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
  index,
  integer,
  decimal,
} from 'drizzle-orm/pg-core';

// Enums
export const notificationFrequencyEnum = pgEnum('notification_frequency', [
  'daily',
  'weekly',
  'realtime',
  'off',
]);

export const userTierEnum = pgEnum('user_tier', ['free', 'paid']);

export const subscriptionPlanEnum = pgEnum('subscription_plan', [
  'professional', // $499/month
  'business',     // $999/month
  'enterprise',   // $1699/month
]);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'past_due',
  'canceled',
  'trialing',
  'incomplete',
]);

export const paymentProviderEnum = pgEnum('payment_provider', [
  'stripe',
  'paypal',
]);

export const teamRoleEnum = pgEnum('team_role', [
  'admin',
  'member',
]);

export const aiTierEnum = pgEnum('ai_tier', [
  'basic',      // Professional tier
  'advanced',   // Business tier
  'predictive', // Enterprise tier
]);

// Saved Opportunities Table
export const savedOpportunities = pgTable('saved_opportunities', {
  id: uuid('id').primaryKey().defaultRandom(),
  noticeId: text('notice_id').notNull(),
  title: text('title').notNull(),
  solicitationNumber: text('solicitation_number'),
  department: text('department'),
  postedDate: text('posted_date'),
  responseDeadline: text('response_deadline'),
  naicsCode: text('naics_code'),
  opportunityData: jsonb('opportunity_data').notNull(), // Store full opportunity object
  notes: text('notes'), // User can add personal notes
  savedAt: timestamp('saved_at').defaultNow().notNull(),
}, (table) => ({
  noticeIdIdx: index('saved_opportunities_notice_id_idx').on(table.noticeId),
  naicsCodeIdx: index('saved_opportunities_naics_code_idx').on(table.naicsCode),
}));

// Notification Subscriptions Table
export const notificationSubscriptions = pgTable('notification_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  naicsCode: text('naics_code').notNull(),
  frequency: notificationFrequencyEnum('frequency').default('daily').notNull(),
  active: boolean('active').default(true).notNull(),
  lastChecked: timestamp('last_checked'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('notification_subscriptions_email_idx').on(table.email),
  naicsCodeIdx: index('notification_subscriptions_naics_code_idx').on(table.naicsCode),
  activeIdx: index('notification_subscriptions_active_idx').on(table.active),
}));

// Discovered Opportunities Table (tracks all found opportunities, not just saved)
export const discoveredOpportunities = pgTable('discovered_opportunities', {
  id: uuid('id').primaryKey().defaultRandom(),
  noticeId: text('notice_id').unique().notNull(),
  title: text('title').notNull(),
  solicitationNumber: text('solicitation_number'),
  department: text('department'),
  postedDate: text('posted_date'),
  responseDeadline: text('response_deadline'),
  naicsCode: text('naics_code'),
  opportunityData: jsonb('opportunity_data').notNull(),
  aiScore: text('ai_score'), // Will add scoring later
  discoveredAt: timestamp('discovered_at').defaultNow().notNull(),
  isNew: boolean('is_new').default(true).notNull(), // Flag for "New Today"
}, (table) => ({
  noticeIdIdx: index('discovered_opportunities_notice_id_idx').on(table.noticeId),
  naicsCodeIdx: index('discovered_opportunities_naics_code_idx').on(table.naicsCode),
  postedDateIdx: index('discovered_opportunities_posted_date_idx').on(table.postedDate),
  isNewIdx: index('discovered_opportunities_is_new_idx').on(table.isNew),
}));

// Company Profile Table (for pre-fill data)
export const companyProfile = pgTable('company_profile', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyName: text('company_name').notNull(),
  ueiNumber: text('uei_number'), // Unique Entity ID
  dunsNumber: text('duns_number'), // DUNS number
  cageCode: text('cage_code'), // Commercial and Government Entity Code
  naicsCodes: jsonb('naics_codes').$type<string[]>().notNull(), // Array of NAICS codes
  certifications: jsonb('certifications').$type<string[]>(), // 8(a), HUBZone, SDVOSB, etc.
  primaryContact: jsonb('primary_contact').$type<{
    name: string;
    title: string;
    email: string;
    phone: string;
  }>(),
  address: jsonb('address').$type<{
    street: string;
    city: string;
    state: string;
    zip: string;
  }>(),
  capabilities: text('capabilities'), // Capability statement
  pastPerformance: jsonb('past_performance').$type<Array<{
    projectName: string;
    client: string;
    value: string;
    year: string;
    description: string;
  }>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// =============================================================================
// SAAS TABLES
// =============================================================================

// Users Table (Extended from Supabase Auth)
export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // Matches Supabase auth.users.id
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  currentTeamId: uuid('current_team_id'), // Active team for multi-seat accounts
  onboardingCompleted: boolean('onboarding_completed').default(false).notNull(),

  // Freemium tier system
  tier: userTierEnum('tier').default('free').notNull(),
  dailySearchesUsed: integer('daily_searches_used').default(0).notNull(),
  lastSearchDate: timestamp('last_search_date', { mode: 'date' }),
  setupFeePaid: boolean('setup_fee_paid').default(false).notNull(),
  setupPaidAt: timestamp('setup_paid_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
  tierIdx: index('users_tier_idx').on(table.tier),
  lastSearchDateIdx: index('users_last_search_date_idx').on(table.lastSearchDate),
}));

// Subscriptions Table
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull(), // References teams.id
  plan: subscriptionPlanEnum('plan').notNull(),
  status: subscriptionStatusEnum('status').notNull(),
  provider: paymentProviderEnum('provider').notNull(),

  // Provider-specific IDs
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripeCustomerId: text('stripe_customer_id'),
  paypalSubscriptionId: text('paypal_subscription_id'),
  paypalPayerId: text('paypal_payer_id'),

  // Subscription details
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
  canceledAt: timestamp('canceled_at'),
  trialStart: timestamp('trial_start'),
  trialEnd: timestamp('trial_end'),

  // Seat limits
  seatsIncluded: integer('seats_included').notNull(), // 1, 3, or 10
  seatsUsed: integer('seats_used').default(0).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  teamIdIdx: index('subscriptions_team_id_idx').on(table.teamId),
  statusIdx: index('subscriptions_status_idx').on(table.status),
  stripeSubIdx: index('subscriptions_stripe_subscription_id_idx').on(table.stripeSubscriptionId),
  paypalSubIdx: index('subscriptions_paypal_subscription_id_idx').on(table.paypalSubscriptionId),
}));

// Teams Table
export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  ownerId: uuid('owner_id').notNull(), // References users.id
  subscriptionId: uuid('subscription_id'), // References subscriptions.id
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('teams_slug_idx').on(table.slug),
  ownerIdIdx: index('teams_owner_id_idx').on(table.ownerId),
}));

// Team Members Table (many-to-many relationship)
export const teamMembers = pgTable('team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull(), // References teams.id
  userId: uuid('user_id').notNull(), // References users.id
  role: teamRoleEnum('role').default('member').notNull(),
  invitedBy: uuid('invited_by'), // References users.id
  invitedAt: timestamp('invited_at').defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  teamIdIdx: index('team_members_team_id_idx').on(table.teamId),
  userIdIdx: index('team_members_user_id_idx').on(table.userId),
  teamUserIdx: index('team_members_team_user_idx').on(table.teamId, table.userId),
}));

// User Preferences Table (AI interview results)
export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(), // References users.id

  // AI interview results
  businessType: text('business_type'),
  industryDescription: text('industry_description'),
  naicsCodes: jsonb('naics_codes').$type<string[]>(),
  keywords: jsonb('keywords').$type<string[]>(),
  contractSizeMin: integer('contract_size_min'),
  contractSizeMax: integer('contract_size_max'),
  setAsides: jsonb('set_asides').$type<string[]>(),
  preferredAgencies: jsonb('preferred_agencies').$type<string[]>(),
  excludedAgencies: jsonb('excluded_agencies').$type<string[]>(),

  // Email preferences
  emailFrequency: notificationFrequencyEnum('email_frequency').default('daily').notNull(),
  emailEnabled: boolean('email_enabled').default(true).notNull(),

  // Conversation history
  onboardingConversation: jsonb('onboarding_conversation').$type<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>>(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_preferences_user_id_idx').on(table.userId),
}));

// AI Analysis Table
export const aiAnalysis = pgTable('ai_analysis', {
  id: uuid('id').primaryKey().defaultRandom(),
  opportunityId: uuid('opportunity_id').notNull(), // References discoveredOpportunities.id
  userId: uuid('user_id').notNull(), // References users.id
  tier: aiTierEnum('tier').notNull(),

  // Scoring (all tiers)
  matchScore: integer('match_score').notNull(), // 0-100
  matchReasoning: text('match_reasoning'),
  bidNoBidRecommendation: text('bid_no_bid_recommendation'),
  bidNoBidReasoning: text('bid_no_bid_reasoning'),

  // Competitor analysis (all tiers)
  likelyCompetitors: jsonb('likely_competitors').$type<Array<{
    name: string;
    pastWins: number;
    confidence: string;
  }>>(),

  // Advanced features (business+ tiers)
  strategicRecommendations: text('strategic_recommendations'),
  riskFactors: jsonb('risk_factors').$type<string[]>(),

  // Predictive features (enterprise tier)
  winProbability: integer('win_probability'), // 0-100, only for enterprise
  competitorIntelligence: jsonb('competitor_intelligence'),
  proposalOutline: text('proposal_outline'),

  analyzedAt: timestamp('analyzed_at').defaultNow().notNull(),
}, (table) => ({
  opportunityIdIdx: index('ai_analysis_opportunity_id_idx').on(table.opportunityId),
  userIdIdx: index('ai_analysis_user_id_idx').on(table.userId),
}));

// Email Logs Table
export const emailLogs = pgTable('email_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // References users.id
  recipientEmail: text('recipient_email').notNull(),
  subject: text('subject').notNull(),
  template: text('template').notNull(), // 'digest', 'new_match', 'team_invite', etc.
  opportunityIds: jsonb('opportunity_ids').$type<string[]>(),

  // Tracking
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  opened: boolean('opened').default(false).notNull(),
  openedAt: timestamp('opened_at'),
  clicked: boolean('clicked').default(false).notNull(),
  clickedAt: timestamp('clicked_at'),

  // Resend metadata
  resendId: text('resend_id'),
  resendStatus: text('resend_status'),
}, (table) => ({
  userIdIdx: index('email_logs_user_id_idx').on(table.userId),
  sentAtIdx: index('email_logs_sent_at_idx').on(table.sentAt),
  templateIdx: index('email_logs_template_idx').on(table.template),
}));

// Payment History Table
export const paymentHistory = pgTable('payment_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  subscriptionId: uuid('subscription_id').notNull(), // References subscriptions.id
  provider: paymentProviderEnum('provider').notNull(),

  // Transaction details
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD').notNull(),
  status: text('status').notNull(), // 'succeeded', 'failed', 'pending'
  description: text('description'),

  // Provider IDs
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  stripeInvoiceId: text('stripe_invoice_id'),
  paypalOrderId: text('paypal_order_id'),
  paypalTransactionId: text('paypal_transaction_id'),

  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  subscriptionIdIdx: index('payment_history_subscription_id_idx').on(table.subscriptionId),
  statusIdx: index('payment_history_status_idx').on(table.status),
  paidAtIdx: index('payment_history_paid_at_idx').on(table.paidAt),
}));

// API Keys Table (encrypted storage)
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // References users.id
  provider: text('provider').notNull(), // 'sam_gov'
  keyName: text('key_name').notNull(), // User-friendly name
  encryptedKey: text('encrypted_key').notNull(), // Encrypted API key

  // Status tracking
  isValid: boolean('is_valid').default(true).notNull(),
  lastValidated: timestamp('last_validated'),
  usageCount: integer('usage_count').default(0).notNull(),
  rateLimit: integer('rate_limit'), // Daily rate limit
  rateLimitRemaining: integer('rate_limit_remaining'),
  rateLimitResetAt: timestamp('rate_limit_reset_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('api_keys_user_id_idx').on(table.userId),
  providerIdx: index('api_keys_provider_idx').on(table.provider),
}));

// Audit Logs Table (team activity tracking)
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull(), // References teams.id
  userId: uuid('user_id').notNull(), // References users.id
  action: text('action').notNull(), // 'user_invited', 'opportunity_saved', 'settings_changed', etc.
  resourceType: text('resource_type'), // 'opportunity', 'user', 'settings', etc.
  resourceId: text('resource_id'),
  metadata: jsonb('metadata'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  teamIdIdx: index('audit_logs_team_id_idx').on(table.teamId),
  userIdIdx: index('audit_logs_user_id_idx').on(table.userId),
  actionIdx: index('audit_logs_action_idx').on(table.action),
  createdAtIdx: index('audit_logs_created_at_idx').on(table.createdAt),
}));

// Webhooks Table (enterprise feature)
export const webhooks = pgTable('webhooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull(), // References teams.id
  url: text('url').notNull(),
  secret: text('secret').notNull(), // For HMAC signature verification
  events: jsonb('events').$type<string[]>().notNull(), // ['opportunity.new', 'opportunity.matched', etc.]
  active: boolean('active').default(true).notNull(),
  lastTriggeredAt: timestamp('last_triggered_at'),
  failureCount: integer('failure_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  teamIdIdx: index('webhooks_team_id_idx').on(table.teamId),
  activeIdx: index('webhooks_active_idx').on(table.active),
}));

// Integrations Table (Slack, Teams, etc.)
export const integrations = pgTable('integrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  teamId: uuid('team_id').notNull(), // References teams.id
  type: text('type').notNull(), // 'slack', 'teams', 'zapier'
  active: boolean('active').default(true).notNull(),

  // OAuth tokens (encrypted)
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  tokenExpiresAt: timestamp('token_expires_at'),

  // Integration-specific config
  config: jsonb('config').$type<{
    channelId?: string;
    channelName?: string;
    webhookUrl?: string;
    [key: string]: any;
  }>(),

  lastSyncedAt: timestamp('last_synced_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  teamIdIdx: index('integrations_team_id_idx').on(table.teamId),
  typeIdx: index('integrations_type_idx').on(table.type),
  activeIdx: index('integrations_active_idx').on(table.active),
}));

// Types - Original Tables
export type SavedOpportunity = typeof savedOpportunities.$inferSelect;
export type NewSavedOpportunity = typeof savedOpportunities.$inferInsert;

export type NotificationSubscription = typeof notificationSubscriptions.$inferSelect;
export type NewNotificationSubscription = typeof notificationSubscriptions.$inferInsert;

export type DiscoveredOpportunity = typeof discoveredOpportunities.$inferSelect;
export type NewDiscoveredOpportunity = typeof discoveredOpportunities.$inferInsert;

export type CompanyProfile = typeof companyProfile.$inferSelect;
export type NewCompanyProfile = typeof companyProfile.$inferInsert;

// Content Blocks Table (for proposal reusable content)
export const contentBlocks = pgTable('content_blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'), // References users.id, null for team-wide content
  teamId: uuid('team_id'), // References teams.id
  category: text('category').notNull(), // 'company-overview', 'quality-control', 'risk-management', etc.
  title: text('title').notNull(),
  content: text('content').notNull(),
  tags: jsonb('tags').$type<string[]>(),
  isShared: boolean('is_shared').default(false).notNull(), // Shared across team
  usageCount: integer('usage_count').default(0).notNull(),
  lastUsed: timestamp('last_used'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('content_blocks_user_id_idx').on(table.userId),
  teamIdIdx: index('content_blocks_team_id_idx').on(table.teamId),
  categoryIdx: index('content_blocks_category_idx').on(table.category),
}));

// Saved Searches Table (for alerts and quick access)
export const savedSearches = pgTable('saved_searches', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // References users.id
  name: text('name').notNull(), // User-friendly name
  description: text('description'),

  // Search parameters (stored as JSONB for flexibility)
  searchParams: jsonb('search_params').$type<{
    naicsCode?: string;
    procurementType?: string;
    state?: string;
    setAside?: string;
    keywords?: string;
    [key: string]: any;
  }>().notNull(),

  // Alert settings
  alertEnabled: boolean('alert_enabled').default(false).notNull(),
  alertFrequency: notificationFrequencyEnum('alert_frequency').default('daily'),
  lastAlertSent: timestamp('last_alert_sent'),

  // Metadata
  lastRun: timestamp('last_run'),
  resultCount: integer('result_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('saved_searches_user_id_idx').on(table.userId),
  alertEnabledIdx: index('saved_searches_alert_enabled_idx').on(table.alertEnabled),
}));

// User Payments Table (PayPal)
export const userPayments = pgTable('user_payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // References users.id

  // Payment details
  paymentType: text('payment_type').notNull(), // 'setup' or 'monthly'
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD').notNull(),
  status: text('status').notNull(), // 'pending', 'completed', 'failed'

  // PayPal details
  paypalOrderId: text('paypal_order_id'),
  paypalPayerId: text('paypal_payer_id'),
  paypalTransactionId: text('paypal_transaction_id'),

  // Timestamps
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_payments_user_id_idx').on(table.userId),
  statusIdx: index('user_payments_status_idx').on(table.status),
  paymentTypeIdx: index('user_payments_payment_type_idx').on(table.paymentType),
  paidAtIdx: index('user_payments_paid_at_idx').on(table.paidAt),
}));

// Types - SaaS Tables
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type UserPayment = typeof userPayments.$inferSelect;
export type NewUserPayment = typeof userPayments.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;

export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;

export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;

export type AiAnalysis = typeof aiAnalysis.$inferSelect;
export type NewAiAnalysis = typeof aiAnalysis.$inferInsert;

export type EmailLog = typeof emailLogs.$inferSelect;
export type NewEmailLog = typeof emailLogs.$inferInsert;

export type PaymentHistory = typeof paymentHistory.$inferSelect;
export type NewPaymentHistory = typeof paymentHistory.$inferInsert;

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

export type Webhook = typeof webhooks.$inferSelect;
export type NewWebhook = typeof webhooks.$inferInsert;

export type Integration = typeof integrations.$inferSelect;
export type NewIntegration = typeof integrations.$inferInsert;

export type ContentBlock = typeof contentBlocks.$inferSelect;
export type NewContentBlock = typeof contentBlocks.$inferInsert;

export type SavedSearch = typeof savedSearches.$inferSelect;
export type NewSavedSearch = typeof savedSearches.$inferInsert;
