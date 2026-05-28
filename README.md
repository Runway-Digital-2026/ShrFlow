# ShrFlow

ShrFlow is a self-hosted, multi-tenant email operations platform for teams that want full control over campaigns, audiences, templates, sending infrastructure, and delivery workflows.

It combines a Next.js product UI, a FastAPI backend, asynchronous workers, RabbitMQ-driven job processing, and PostgreSQL-backed tenancy into a single product-oriented stack.

## Why ShrFlow

- Multi-tenant workspace isolation for teams, agencies, and operational groups
- Campaign orchestration with scheduling, throttling, and pause/resume controls
- Audience import workflows for large contact lists and background processing
- Template and email composition flows backed by MJML compilation
- Delivery infrastructure split between campaign sending and system email workflows
- Auditability, API access, and infrastructure visibility for operator-heavy teams

## Product Preview

<p align="center">
  <img src="docs/screen-shots/landing-page.png" alt="ShrFlow marketing page" width="48%" />
  <img src="docs/screen-shots/dashboard.png" alt="ShrFlow dashboard" width="48%" />
</p>

<p align="center">
  <img src="docs/screen-shots/templates-list.png" alt="ShrFlow templates library" width="48%" />
  <img src="docs/screen-shots/settings-general.png" alt="ShrFlow settings overview" width="48%" />
</p>

## Documentation

- Product docs: [docs/README.md](docs/README.md)
- Introduction: [docs/introduction.md](docs/introduction.md)
- Quick start: [docs/getting-started/quick-start.md](docs/getting-started/quick-start.md)
- Product tour: [docs/screen-shots/README.md](docs/screen-shots/README.md)
- Live docs site: [runway-digital-2026.github.io/ShrFlow](https://runway-digital-2026.github.io/ShrFlow/)

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend API | FastAPI |
| Workers | Python background workers |
| Queue | RabbitMQ |
| Database | PostgreSQL / Supabase |
| Cache & coordination | Redis |
| Email infrastructure | SMTP and AWS-based sending workflows |
| Packaging | Docker Compose |

## Repository Structure

| Path | Purpose |
|---|---|
| `platform/client` | Next.js application |
| `platform/api` | FastAPI backend |
| `platform/worker` | Background workers and handlers |
| `platform/services/template_service` | Template-service decomposition work |
| `docs` | Product documentation and visual tour |
| `migrations` | Database migrations |
| `deploy` | Dockerfiles and deployment assets |
| `scripts` | Project utility scripts |

## Local Development

### 1. Prerequisites

- Git
- Docker Desktop or Docker Engine

### 2. Clone the repository

```bash
git clone <your-repo-url>
cd ShrFlow
```

### 3. Create your environment file

```bash
cp .env.example .env
```

Then review and update the values in `.env` for your environment. At minimum, pay attention to:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `RABBITMQ_URL`
- `REDIS_URL`
- SMTP and AWS-related variables if you are testing sending flows

Reference: [.env.example](.env.example)

### 4. Start the stack

```bash
docker-compose up --build
```

Default local endpoints:

- Frontend: `http://localhost:3000`
- API: `http://localhost:8000`
- Template service: `http://localhost:8001`

For deeper setup notes, use:

- [docs/getting-started/quick-start.md](docs/getting-started/quick-start.md)
- [docs/docker_notes.md](docs/docker_notes.md)
- [docs/infrastructure/database-setup.md](docs/infrastructure/database-setup.md)

## Key Workflows

- Start with the dashboard and settings flow to understand tenancy and account setup
- Import contacts through the audience/import path
- Build or manage templates in the template workspace
- Launch campaigns from the campaign workflow
- Verify domains and sender identities before production sending

## API and Architecture

Use the docs site for the maintained references instead of relying on the root README:

- API reference: [docs/api-reference/authentication.md](docs/api-reference/authentication.md)
- Delivery engine: [docs/advanced/deliverability-engine.md](docs/advanced/deliverability-engine.md)
- Security and RBAC: [docs/advanced/rbac-security.md](docs/advanced/rbac-security.md)
- Database RLS: [docs/advanced/database-rls.md](docs/advanced/database-rls.md)

## Contributing

Contributions are welcome. If you are making changes:

1. Create a focused branch
2. Keep backend, frontend, and docs changes clearly scoped
3. Update documentation when behavior or setup changes
4. Open a pull request with a clear summary of what changed

## Status

ShrFlow is an actively evolving product repository. The documentation site is the source of truth for onboarding, product orientation, and technical references.
