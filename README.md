# AI Brand Governance Agent

Real-time brand enforcement layer that monitors creative exports, evaluates compliance against brand and legal rules, auto-fixes safe violations, blocks hard violations, and routes exceptions to humans.

Integrates with the Adobe InDesign/Illustrator plugin, Airtable (governance records), and Slack (alerts and approvals).

## Architecture

```
Adobe Plugin  ──POST /webhooks/adobe/export──>  Server
                                                   │
                                          ┌────────┴────────┐
                                          │  Engine Pipeline │
                                          │                  │
                                          │  1. Match rules  │
                                          │  2. Run QA checks│
                                          │  3. Auto-fix     │
                                          │  4. Score (0-100)│
                                          │  5. Decide       │
                                          └────────┬────────┘
                                                   │
                                    ┌──────────────┼──────────────┐
                                    ▼              ▼              ▼
                               Airtable        Slack          Response
                            (audit record)  (alert/buttons)  (gate: approve/block)
```

## Packages

| Package | Description |
|---------|-------------|
| `packages/shared` | Types, enums, constants, color-math utilities, Zod validators |
| `packages/engine` | Policy loading (YAML), scoring, decision engine, phase guards |
| `packages/qa-rules` | Deterministic checks: dimensions, color palette, logo, disclaimer, typography, file specs |
| `packages/auto-fix` | Safe auto-corrections: color remap, logo replace, disclaimer insert, font normalize |
| `packages/integrations` | Airtable CRUD, Slack Block Kit alerts, Adobe webhook adapter |
| `packages/server` | Express HTTP layer with JWT auth, governance evaluation, webhook endpoints |

## Rollout Phases

The system supports four deployment phases, controlled by the `GOVERNANCE_PHASE` env var. The phase guard softens decisions without code changes:

| Phase | Behavior |
|-------|----------|
| **Observe** | Log only. All exports approved. Score and violations recorded for baseline data. |
| **Warn** | Suggestions shown. Rejections converted to warnings. Nothing blocked. |
| **Enforce** | Hard violations block exports. Soft violations warn. Auto-fix disabled. |
| **Autonomous** | Full enforcement + auto-fix for safe violations (color remap, font normalize, etc.) |

## Compliance Scoring

Each export is scored 0-100 based on weighted QA check results:

- **90+** — Approved
- **70-89** — Approved with warnings (Slack alert sent)
- **<70** — Escalated or rejected (Slack alert with action buttons)
- **Hard violation** — Always rejected regardless of score (in Enforce/Autonomous phases)

Category weights: Logo Compliance (1.0), Disclaimer (1.0), Dimensions (0.8), Color Palette (0.7), Typography (0.6), File Specs (0.5).

## Policy Definitions

Policies are defined in YAML and support layered overrides:

```
policies/
  default-policy.yaml          # Base rules for all exports
  markets/us.yaml              # US-specific (FDA disclaimers, FTC claims)
  markets/eu.yaml              # EU-specific (consumer rights, larger min fonts)
  channels/print.yaml          # Print (bleed required, 300 DPI min)
  channels/digital.yaml        # Digital (web formats, max dimensions)
```

Rules are scoped by brand, market, channel, and format. Empty scope = applies to all.

## Setup

### Prerequisites

- Node.js >= 20
- npm

### Install

```bash
npm install
```

### Configure

```bash
cp .env.example .env
# Edit .env with your Airtable API key, Slack bot token, etc.
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Run

```bash
# Development (hot reload)
npm run dev

# Production
npm start
```

The server starts on port 3100 by default.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/webhooks/adobe/export` | Main trigger — receives export events from the Adobe plugin |
| `POST` | `/webhooks/slack/actions` | Handles Slack interactive button clicks (approve/reject) |
| `POST` | `/governance/evaluate` | Manual evaluation trigger with an ExportEvent body |
| `GET` | `/health` | Health check with phase, policy count, and integration status |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3100` |
| `GOVERNANCE_PHASE` | Rollout phase: `observe`, `warn`, `enforce`, `autonomous` | `observe` |
| `BRAND_MIDDLEWARE_URL` | URL to fetch BrandPayload from the middleware service | — |
| `AIRTABLE_API_KEY` | Airtable personal access token | — |
| `AIRTABLE_BASE_ID` | Airtable base ID for governance records | — |
| `SLACK_BOT_TOKEN` | Slack bot OAuth token | — |
| `SLACK_SIGNING_SECRET` | Slack request signing secret | — |
| `SLACK_CHANNEL_CRITICAL` | Channel for critical violations | `#brand-governance-critical` |
| `SLACK_CHANNEL_WARNINGS` | Channel for warnings | `#brand-governance-alerts` |
| `SLACK_CHANNEL_INFO` | Channel for informational logs | `#brand-governance-log` |
| `AI_PROVIDER` | AI provider: `anthropic` or `openai` | `anthropic` |
| `JWT_SECRET` | Secret for webhook JWT authentication | — |

## Tech Stack

- **Language**: TypeScript 5.4+ (strict mode)
- **Runtime**: Node.js 20+
- **Monorepo**: npm workspaces
- **HTTP**: Express 4.x
- **Airtable**: `airtable` npm package
- **Slack**: `@slack/web-api`
- **YAML**: `yaml` npm package
- **Validation**: Zod
- **Testing**: Jest + ts-jest
- **Logging**: Pino
