# IsabiLove — AI-Powered Relationship Reminder SaaS

IsabiLove is an intelligent relationship reminder SaaS designed to make loved ones feel remembered, cherished, and deeply celebrated. It combines rich personal profiles (love languages, personal quirks, gift preferences, shared memories) with Gemini 3.8 Flash AI generation, multi-cadence reminders, an in-app approval queue, and flexible multi-channel dispatch (Email, Webhook, WhatsApp/SMS).

## User Review & Critical Decisions

> [!IMPORTANT]
> The following choices were confirmed during Phase 1 interactive clarification:
> - **Delivery & Dispatch Mode**: In-app approval queue with simulated/direct Email notification, Webhook triggers, and one-click WhatsApp/SMS handoff.
> - **AI Personalization Engine**: Deep profile contextualization incorporating 5 love languages, shared memories, relationship roles, and 6 emotional tones.
> - **Subscription Architecture**: Freemium tier model with strict, visible usage enforcement (Free: 3 contacts, 10 AI drafts/month; Pro: unlimited contacts, automated webhooks, priority generation).

---

## 1. Overview & Core Concept

- **What It Does**: Enables users to keep track of birthdays, anniversaries, check-ins, and life milestones across partners, family, and close friends. Automatically crafts tailored, context-aware messages before each occasion, alerts the user for approval or auto-sends via configured channels, and archives message history.
- **Target Audience / Persona**: Busy professionals, thoughtful partners, thoughtful family members, and mindful friends who care deeply about their relationships but struggle with calendar clutter or finding the right words when life gets hectic.
- **Key Value**: Replaces generic calendar notifications with deeply personal, ready-to-send messages that honor each person's unique personality and love language, eliminating forgotten dates and last-minute panic.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Onboarding & Auth Setup**: User logs into their IsabiLove account (with timezone preference, email, and notification settings pre-configured).
2. **Contact & Loved One Profiling**: User adds a contact (Partner, Family, Friend, Mentor) with birthdays, relationship milestones, love languages (Words of Affirmation, Quality Time, Receiving Gifts, Acts of Service, Physical Touch), favorite items (flowers, foods, hobbies), and shared memories.
3. **Smart Reminder Scheduling**: User creates recurring (annual, monthly, custom cadence) or one-time reminders with advance notice alerts (e.g. 7 days prior for gift planning, day-of for emotional message).
4. **AI Message Generation & Studio**: Before an event, Gemini 3.8 Flash generates unique messages matching the contact's tone preference (Warm & Romantic, Playful & Teasing, Deeply Grateful, Poetic, Cheerful, or Culturally Warm). The user previews, customizes, regenerates, or edits the draft.
5. **Approval Queue & Multi-Channel Dispatch**: Pending messages appear in the In-App Approval Queue. The user approves with 1 click to dispatch via simulated Email, Webhook payload, or opens directly in WhatsApp Web / SMS.
6. **Usage & Subscription Management**: Usage meters track contact slots (e.g. 2/3 used) and monthly AI generation quotas. Users can simulate upgrading to Pro to unlock unlimited contacts and automated dispatch.

### Visual Identity & Theme
- **Aesthetic Direction**: Refined, warm, modern editorial SaaS. Avoids sterile corporate gray as well as neon candy palettes. Balances warm emotional care with crisp software craft.
- **Color Palette & Discipline (60-30-10)**:
  - *Canvas (60%)*: Crisp neutral warm-white (`#FBFBFB` / `#F8FAFC`) with dark mode support (`#0F172A`).
  - *Structural Surfaces (30%)*: Card and sidebar surfaces with single-elevation 1px hairline borders (`border-neutral-200 dark:border-neutral-800`), clean divider lines.
  - *Accent Budget (10%)*: Rose/Crimson primary accent (`#E11D48` rose-600 / `#BE123C` rose-700) for high-intent actions, paired with calm amber (`#D97706`) for impending reminders and emerald (`#059669`) for sent items.
- **Typography & Scale**:
  - *Display*: Plus Jakarta Sans for confident, human headlines and brand typography.
  - *Body Prose*: DM Sans for ultra-legible contact profiles and message previews.
  - *Metrics & Timestamps*: Strict tabular figures (`font-mono tabular-nums`) for dates, countdowns, and quota counters.
- **Anti-Slop Discipline**:
  - Zero static pill badges: Metadata rendered with clean unboxed text and typographic dots (`·`).
  - No decorative pulsing dots or hallucinated innovation scores.
  - Single-line button and tab controls with no text wrapping.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Server-Side Gemini API Proxy**:
  - *Chosen Approach*: Route all AI generation requests through `/api/gemini/generate-message` on the backend using the `@google/genai` TypeScript SDK (`gemini-3.8-flash`).
  - *Why*: Keeps API keys strictly server-side, conforms to security requirements, enables server-side prompt engineering, and provides fallback generation if network fails.
- **Decision 2: Hybrid Client Persistence with Export/Import**:
  - *Chosen Approach*: Client-side resilient storage (IndexedDB/localStorage) with automated session seeding, quick demo dataset, and full JSON Export/Backup & Restore.
  - *Why*: Delivers a fast, zero-setup, zero-latency experience with zero friction while enabling users to persist their custom contacts and reminders across refreshes.
- **Decision 3: Simulated & Direct Dispatch Engine**:
  - *Chosen Approach*: In-app queue supporting direct browser webhook triggers (POST JSON payloads), native Email notification triggers (with copyable preview and dispatch log), and direct URL-scheme launching (WhatsApp Web and SMS).
  - *Why*: Gives complete end-to-end functionality without requiring users to configure third-party Twilio or SendGrid accounts before experiencing the core loop.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        IsabiLove Client (React SPA)                     │
│                                                                        │
│  ┌──────────────────────┐  ┌────────────────────────────────────────┐  │
│  │   Navigation Sidebar │  │ Top Bar (Brand · Breadcrumbs · Profile)│  │
│  │   - Dashboard        │  └────────────────────────────────────────┘  │
│  │   - Contacts         │  ┌────────────────────────────────────────┐  │
│  │   - Reminders        │  │ Active Workspace View                  │  │
│  │   - Approval Queue   │  │  - Upcoming Milestones & Streaks       │  │
│  │   - Message Studio   │  │  - Contact Profile Cards & Details     │  │
│  │   - History & Logs   │  │  - Interactive AI Draft Editor         │  │
│  │   - Settings & Tiers │  │  - Dispatch Channels (Email/Webhook/WA)│  │
│  └──────────────────────┘  └────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Client State & Scheduler Engine (Tick interval, Quota Enforcer) │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP Fetch (/api/*)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Express Backend API Gateway                     │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  POST /api/gemini/generate-message                                │  │
│  │  - Reads profile context: love languages, relation, tone, event  │  │
│  │  - Calls @google/genai SDK with model 'gemini-3.8-flash'          │  │
│  │  - Returns formatted structured message drafts + suggested gift  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  POST /api/notifications/dispatch-webhook                        │  │
│  │  - Triggers external webhook payload with delivery acknowledgement│  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Models
- **Contact**: `id`, `name`, `relationship` (`partner` | `family` | `friend` | `colleague`), `avatarUrl`, `birthDate`, `anniversaryDate`, `loveLanguage` (`words_of_affirmation` | `quality_time` | `receiving_gifts` | `acts_of_service` | `physical_touch`), `preferences` (favorite flowers, foods, colors, hobbies, dislikes), `importantNotes`, `memories` (`string[]`), `preferredTone`.
- **Reminder**: `id`, `contactId`, `title`, `occasionType` (`birthday` | `anniversary` | `check_in` | `milestone` | `custom`), `eventDate`, `advanceDays` (`number[]`, e.g. [7, 0]), `cadence` (`once` | `annual` | `monthly`), `channel` (`queue` | `email` | `webhook` | `whatsapp`), `requireApproval` (`boolean`), `status` (`active` | `paused`).
- **MessageDraft**: `id`, `reminderId`, `contactId`, `occasion`, `tone`, `generatedText`, `customizedText`, `status` (`draft` | `pending_approval` | `approved` | `sent` | `dismissed`), `scheduledFor`, `sentAt`, `channel`, `deliveryLog`.
- **UserSubscription**: `tier` (`free` | `pro`), `contactsLimit` (3 for free, unlimited for pro), `monthlyAiDraftsLimit` (10 for free, 500 for pro), `aiDraftsUsedThisMonth`, `timezone`.

### Key Sequences
1. **Background Event Detection**: The scheduler periodically evaluates active reminders against current timezone-adjusted dates.
2. **AI Pre-generation**: When a reminder falls within the advance threshold, a draft generation job triggers `/api/gemini/generate-message`.
3. **Approval & Dispatch Flow**:
   - Item enters "Approval Queue".
   - User reviews text in Message Studio, adjusts tone or tweaks copy.
   - User clicks "Approve & Send": Dispatches via selected channel, updates usage statistics, and moves record to Sent History.
