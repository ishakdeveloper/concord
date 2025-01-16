import { relations } from 'drizzle-orm';
import { boolean, integer, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { pgTable } from 'drizzle-orm/pg-core';
import { type InferSelectModel } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password'),
  displayName: text('displayName'),
  name: text('name'),
  discriminator: text('discriminator').notNull(),
  refreshTokenVersion: integer('token_version').notNull().default(0),
  confirmed: boolean('confirmed').notNull().default(false),

  // Profile customization
  image: text('image'),
  banner: text('banner'),
  accentColor: text('accentColor'),
  bio: text('bio'),
  pronouns: text('pronouns'),

  // Status & Presence
  status: text('status').notNull().default('offline'),
  customStatus: text('customStatus'),
  currentActivity: text('currentActivity'),

  // Preferences
  enableDM: boolean('enableDM').default(true),

  // Timestamps
  lastOnline: timestamp('lastOnline'),
  premiumSince: timestamp('premiumSince'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),

  dateOfBirth: timestamp('date_of_birth').notNull(),
});

export type DbUser = InferSelectModel<typeof users>;

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  provider: text('provider').notNull(), // 'discord', 'google', etc.
  providerId: text('provider_id').notNull(), // external ID from the provider
  providerEmail: text('provider_email'),
  providerUsername: text('provider_username'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Device info
  deviceId: text('device_id').notNull(), // Unique identifier for the device
  deviceName: text('device_name').notNull(), // "Chrome on Windows", "iPhone 12", etc.
  deviceType: text('device_type').notNull(), // "browser", "mobile", "desktop"
  clientName: text('client_name'), // "Chrome", "Firefox", "Discord iOS", etc.
  clientVersion: text('client_version'),
  osName: text('os_name'), // "Windows", "iOS", "Android", etc.
  osVersion: text('os_version'),

  // Location info (optional, for showing in devices list)
  ipAddress: text('ip_address'),
  location: text('location'), // "San Francisco, US", etc.

  // Session status
  isActive: boolean('is_active').notNull().default(true),
  isRevoked: boolean('is_revoked').notNull().default(false),

  // Token management
  refreshTokenVersion: integer('refresh_token_version').notNull().default(0),

  // Timestamps
  lastActive: timestamp('last_active').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type DbSession = InferSelectModel<typeof sessions>;

// Add relations
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
}));
