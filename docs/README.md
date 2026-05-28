# ShrFlow Documentation

<div class="hero">
  <img class="hero-logo no-shadow" src="assets/shrflow-logo.svg" alt="ShrFlow logo">
  <div class="hero-sub">Self-hosted email operations</div>
  <h1>Documentation built for product understanding, not file hunting.</h1>
  <p class="hero-desc">ShrFlow is a multi-tenant email platform for teams that want control over delivery, tenancy, infrastructure, and operations. This documentation is organized to help you understand the product quickly, get it running, and go deeper only when you need to.</p>
  <div class="hero-btns">
    <a class="btn btn-primary" href="getting-started/quick-start.md">Start with Quick Start</a>
    <a class="btn btn-outline" href="screen-shots/README.md">Take the Product Tour</a>
  </div>
  <div class="hero-pills">
    <span class="pill">Next.js 14</span>
    <span class="pill">FastAPI</span>
    <span class="pill">RabbitMQ</span>
    <span class="pill">PostgreSQL RLS</span>
    <span class="pill">REST API</span>
  </div>
</div>

## Quick Navigation

<div class="card-grid">
  <a class="card" href="getting-started/quick-start.md">
    <div class="card-icon">🚀</div>
    <div class="card-title">Quick Start</div>
    <div class="card-desc">Bring the local stack up fast and understand the minimum setup path.</div>
    <div class="card-arrow">Open setup guide →</div>
  </a>
  <a class="card" href="introduction.md">
    <div class="card-icon">📖</div>
    <div class="card-title">Introduction</div>
    <div class="card-desc">Get the platform story, architecture snapshot, and core product principles.</div>
    <div class="card-arrow">Read the overview →</div>
  </a>
  <a class="card" href="screen-shots/README.md">
    <div class="card-icon">🖼️</div>
    <div class="card-title">Product Tour</div>
    <div class="card-desc">Walk through the main screens with routes and context, grouped by workflow.</div>
    <div class="card-arrow">Browse screenshots →</div>
  </a>
  <a class="card" href="getting-started/first-campaign.md">
    <div class="card-icon">📧</div>
    <div class="card-title">First Campaign</div>
    <div class="card-desc">Follow the main operational journey from setup to sending.</div>
    <div class="card-arrow">Send your first campaign →</div>
  </a>
  <a class="card" href="advanced/deliverability-engine.md">
    <div class="card-icon">⚙️</div>
    <div class="card-title">Architecture</div>
    <div class="card-desc">Explore how the delivery engine, tenancy model, and infrastructure fit together.</div>
    <div class="card-arrow">View architecture docs →</div>
  </a>
  <a class="card" href="api-reference/authentication.md">
    <div class="card-icon">📡</div>
    <div class="card-title">API Reference</div>
    <div class="card-desc">Jump into authentication, campaign, and contacts endpoints.</div>
    <div class="card-arrow">Open API docs →</div>
  </a>
</div>

## Start Here

<div class="journey-grid">
  <div class="journey-card">
    <div class="journey-kicker">New to ShrFlow</div>
    <h3>Understand the product first</h3>
    <p>Read <a href="introduction.md">Introduction</a>, then take the <a href="screen-shots/README.md">Product Tour</a> so the codebase and routes have context before you read implementation details.</p>
  </div>
  <div class="journey-card">
    <div class="journey-kicker">Setting up locally</div>
    <h3>Get to a working environment quickly</h3>
    <p>Use <a href="getting-started/quick-start.md">Quick Start</a>, verify sending with <a href="getting-started/verify-domain.md">Domain Verification</a>, and then continue to <a href="getting-started/first-campaign.md">First Campaign</a>.</p>
  </div>
  <div class="journey-card">
    <div class="journey-kicker">Working on platform internals</div>
    <h3>Go deeper only when needed</h3>
    <p>Move into the architecture, API, and troubleshooting sections once you already understand the main product flows and setup expectations.</p>
  </div>
</div>

## Documentation Map

| Section | What it covers | Best for |
|-------|-----------|---------|
| Overview | Product story, architecture snapshot, and platform principles | First-time readers |
| Getting Started | Local setup, domain verification, and first-send flow | Engineers onboarding to the repo |
| Product Tour | Screens grouped by user journey with code route references | Designers, PMs, and engineers orienting to the app |
| Architecture | Delivery engine, security, RLS, webhooks, and infrastructure notes | Deeper technical exploration |
| API Reference | Authentication, campaigns, and contacts endpoints | Integration work |
| Troubleshooting | Common setup and operational issues | Debugging and recovery |
| Internal Planning | Roadmaps, audits, and planning artifacts | Team planning, not core onboarding |

## Platform Snapshot

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 (App Router) | Product UI, dashboard, and operational workflows |
| Backend | FastAPI (Python 3.11) | Business logic, auth, and API contracts |
| Queue | RabbitMQ | Campaign dispatch and background work |
| Database | PostgreSQL + Supabase | Multi-tenant data storage and policy enforcement |
| Auth | Supabase Auth | JWT sessions and identity flows |
| Containers | Docker Compose | Local and production-friendly environments |

<div class="callout info">
  <span class="callout-icon">💡</span>
  <div>This docs site now separates product documentation from internal planning. If you are onboarding to ShrFlow, stay in the Overview, Getting Started, Product Tour, Architecture, API, and Troubleshooting sections first.</div>
</div>
