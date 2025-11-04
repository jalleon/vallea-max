# Valea Max Agents Reference Guide

Quick reference for all specialized Claude agents available in this project.

## 🚀 Quick Start

Use slash commands to activate agents:

```bash
/eval-help          # Évaluations module help
/design-review      # UI/UX design review
/setup-integration  # Third-party integrations
/admin-mode         # Admin dashboard
/validate-i18n      # Translation validation
/scaffold           # Generate new feature module
/type-check         # TypeScript type safety
```

---

## 📋 Available Agents

### 1. Évaluations Architect
**Slash Command:** `/eval-help`
**Agent File:** [.claude/agents/evaluations-architect.md](.claude/agents/evaluations-architect.md)

**When to Use:**
- Building or modifying the appraisals/évaluations module
- Need help with template system (RPS, NAS, Custom)
- Implementing AI-powered description generation
- Questions about CUSPAP/OEAQ/USPAP compliance
- Integrating data from library/inspection/adjustments

**Expertise:**
- Template-based appraisal creation
- Dynamic form generation based on value type and approaches
- AI description generation for narrative sections
- Standards compliance (Canadian & US)
- Data integration and auto-population

**Example Usage:**
```
You: /eval-help
You: I need to implement the Custom template selector for appraisals.
     Users should choose value type (Market Value, Insurance Value, Market Rental)
     and then select which approaches to use (Direct Comparison, Cost, Income, etc.)
```

---

### 2. UI/UX Designer
**Slash Command:** `/design-review`
**Agent File:** [.claude/agents/ui-ux-designer.md](.claude/agents/ui-ux-designer.md)

**When to Use:**
- Creating new UI components
- Need design consistency across modules
- Tablet optimization (inspection module)
- Desktop optimization (office modules)
- Responsive design questions
- Material-UI pattern guidance

**Expertise:**
- Valea Max design system (colors, spacing, typography)
- Device-specific optimization (48px touch targets for tablet)
- Material-UI component patterns
- Accessibility compliance (WCAG AA)
- Responsive breakpoints and grid layouts

**Example Usage:**
```
You: /design-review
You: I'm building the appraisal form. It's a desktop module (not tablet).
     The form has multiple sections. Should I use tabs or accordion?
     Show me the MUI pattern for this.
```

---

### 3. Integration Specialist
**Slash Command:** `/setup-integration`
**Agent File:** [.claude/agents/integration-specialist.md](.claude/agents/integration-specialist.md)

**When to Use:**
- Setting up authentication (Google OAuth, Apple Sign-in)
- Integrating Stripe payments and webhooks
- Configuring email service (Mailjet)
- Adding analytics (Sentry, GA4, PostHog)
- Monitoring setup (Vercel Analytics, Better Uptime)
- Security questions about API keys

**Expertise:**
- Supabase Auth with social providers
- Stripe subscription management and webhooks
- Mailjet transactional emails (FR/EN)
- Error tracking with Sentry
- Analytics (GA4, PostHog) and monitoring
- API key management and webhook security

**Example Usage:**
```
You: /setup-integration
You: I need to set up Stripe webhooks to update user subscriptions in Supabase
     when payments succeed or fail. Show me the webhook handler code.
```

---

### 4. Admin Dashboard
**Slash Command:** `/admin-mode`
**Agent File:** [.claude/agents/admin-dashboard.md](.claude/agents/admin-dashboard.md)

**When to Use:**
- Building internal admin tools
- User management features
- Business intelligence dashboards
- Support workflows
- Data extraction and reporting
- Feature flags and system settings

**Expertise:**
- Business metrics (MRR, ARR, churn, user growth)
- User impersonation for support
- Custom SQL queries and reports
- GDPR data exports
- Retool vs custom Next.js admin
- Audit logging and security

**Example Usage:**
```
You: /admin-mode
You: I need to create a user management page where admins can:
     - Search users by email
     - View their subscription status
     - Impersonate them for debugging
     Show me the implementation.
```

---

### 5. i18n Validator
**Slash Command:** `/validate-i18n`
**Agent File:** [.claude/agents/i18n-validator.md](.claude/agents/i18n-validator.md)

**When to Use:**
- Adding new features (need FR + EN translations)
- Checking for missing translation keys
- Finding hardcoded strings
- Validating placeholder consistency
- Cleaning up unused translations
- Pre-commit translation validation

**Expertise:**
- Comparing fr.json and en.json for completeness
- Detecting hardcoded user-facing strings
- Finding unused translation keys
- Placeholder consistency validation
- Generating validation scripts

**Example Usage:**
```
You: /validate-i18n
You: I just added the appraisal form. Can you check if I'm missing any
     translations and find any hardcoded strings I should translate?
```

---

### 6. Feature Scaffolder
**Slash Command:** `/scaffold`
**Agent File:** [.claude/agents/feature-scaffolder.md](.claude/agents/feature-scaffolder.md)

**When to Use:**
- Starting a new feature module
- Need complete module structure quickly
- Want to follow Valea Max patterns exactly
- Generating boilerplate code
- Creating database migrations

**Expertise:**
- Complete module structure generation
- Supabase service layer (CRUD operations)
- Form, Table, View components
- TypeScript interfaces and types
- Database migrations with RLS
- Translation keys (FR + EN)
- Next.js routes/pages

**Example Usage:**
```
You: /scaffold
You: I need a new "clients" module.
     Fields: name (required), email (optional), phone (optional), company (optional)
     Generate the complete module structure.
```

---

### 7. Type Safety Enforcer
**Slash Command:** `/type-check`
**Agent File:** [.claude/agents/type-safety-enforcer.md](.claude/agents/type-safety-enforcer.md)

**When to Use:**
- Working with Supabase JSONB columns
- Type errors at database boundaries
- Form data type safety
- Null vs undefined conversion
- Need to eliminate `any` types
- Runtime type validation

**Expertise:**
- Supabase type assertions (`as unknown as Type`)
- JSONB type handling (inspection_pieces, form_data)
- Form data sanitization (empty strings → null)
- Type guards and discriminated unions
- Zod schema validation
- TypeScript strict mode compliance

**Example Usage:**
```
You: /type-check
You: I'm reading inspection_pieces from Supabase (JSONB column).
     How do I properly type this data and handle the Supabase Json type?
```

---

## 🎯 Agent Selection Guide

### **By Task Type:**

| Task | Use Agent | Command |
|------|-----------|---------|
| Building appraisal forms | Évaluations Architect | `/eval-help` |
| Creating new UI components | UI/UX Designer | `/design-review` |
| Setting up Google OAuth | Integration Specialist | `/setup-integration` |
| Building admin panel | Admin Dashboard | `/admin-mode` |
| Adding new feature to existing code | i18n Validator (translations) + Type Safety (types) | `/validate-i18n` + `/type-check` |
| Creating brand new module | Feature Scaffolder | `/scaffold` |
| Fixing TypeScript errors | Type Safety Enforcer | `/type-check` |

### **By Module:**

| Module | Primary Agent | Secondary Agent |
|--------|---------------|-----------------|
| features/appraisals/ | Évaluations Architect | Type Safety Enforcer |
| features/inspection/ | UI/UX Designer (tablet) | Type Safety Enforcer |
| features/library/ | Feature Scaffolder | i18n Validator |
| app/admin/ | Admin Dashboard | Integration Specialist |
| Authentication | Integration Specialist | Type Safety Enforcer |
| Any new module | Feature Scaffolder | All others |

---

## 💡 Best Practices

### **1. Start with the Right Agent**
Don't waste time with general assistance when you have a specialized agent:
- ❌ "How do I build an appraisal form?" → Generic help
- ✅ `/eval-help` → Expert guidance with Valea patterns

### **2. Combine Agents for Complex Tasks**
Example: Creating a new feature
1. `/scaffold` → Generate module structure
2. `/validate-i18n` → Check translations
3. `/type-check` → Validate TypeScript types
4. `/design-review` → Review UI components

### **3. Use Agents for Code Review**
Before committing:
- `/validate-i18n` → Ensure FR + EN complete
- `/type-check` → No type safety issues
- `/design-review` → UI follows design system

### **4. Keep Agent Files Updated**
As the project evolves, update agent specifications:
- New patterns discovered → Add to relevant agent
- Better practices found → Update agent constraints
- Project requirements change → Revise agent goals

---

## 📁 Agent File Locations

All agent specifications are in `.claude/agents/`:

```
.claude/
├── agents/
│   ├── evaluations-architect.md    # Appraisals module expert
│   ├── ui-ux-designer.md           # Design system enforcer
│   ├── integration-specialist.md   # Third-party integrations
│   ├── admin-dashboard.md          # Admin tools & BI
│   ├── i18n-validator.md           # Translation validation
│   ├── feature-scaffolder.md       # Module generation
│   └── type-safety-enforcer.md     # TypeScript type safety
└── commands/
    ├── eval-help.md                # /eval-help command
    ├── design-review.md            # /design-review command
    ├── setup-integration.md        # /setup-integration command
    ├── admin-mode.md               # /admin-mode command
    ├── validate-i18n.md            # /validate-i18n command
    ├── scaffold.md                 # /scaffold command
    └── type-check.md               # /type-check command
```

---

## 🔄 Updating Agents

Agents are **living documents**. Update them as you learn:

```bash
# Edit agent specification
code .claude/agents/evaluations-architect.md

# Update with new patterns, better practices, changed requirements
# The agent will use the LATEST version next time it's invoked
```

---

## ❓ Quick Reference

**Most Common Commands:**

```bash
# Starting new feature
/scaffold

# Working on appraisals
/eval-help

# Designing UI
/design-review

# Before committing
/validate-i18n
/type-check

# Setting up integrations
/setup-integration

# Building admin features
/admin-mode
```

---

**Need help choosing an agent?** Just ask: "Which agent should I use for [your task]?"

**Last Updated:** 2025-01-02
