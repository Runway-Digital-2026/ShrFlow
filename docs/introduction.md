# Introduction

ShrFlow is an enterprise-grade, self-hosted email marketing platform built on Next.js, FastAPI, RabbitMQ, and PostgreSQL. It gives engineering teams full ownership of their email infrastructure — no vendor lock-in, no per-email pricing, no black-box deliverability.

![ShrFlow Dashboard](screen-shots/dashboard.png)

---

## What ShrFlow Does

<div class="card-grid">
  <a class="card" href="#/getting-started/quick-start">
    <div class="card-icon">🚀</div>
    <div class="card-title">Quick Start</div>
    <div class="card-desc">Launch your local dev cluster and send your first campaign in under 10 minutes.</div>
    <div class="card-arrow">Get started →</div>
  </a>
  <a class="card" href="#/api-reference/authentication">
    <div class="card-icon">📡</div>
    <div class="card-title">API Reference</div>
    <div class="card-desc">Integrate ShrFlow into your products using the full REST API.</div>
    <div class="card-arrow">View API →</div>
  </a>
  <a class="card" href="#/advanced/deliverability-engine">
    <div class="card-icon">⚙️</div>
    <div class="card-title">Delivery Engine</div>
    <div class="card-desc">Dual-path dispatch with RabbitMQ for guaranteed, high-throughput delivery.</div>
    <div class="card-arrow">Learn more →</div>
  </a>
  <a class="card" href="#/advanced/webhooks">
    <div class="card-icon">🔗</div>
    <div class="card-title">Webhooks & Events</div>
    <div class="card-desc">Stream real-time email events — opens, clicks, bounces, and complaints.</div>
    <div class="card-arrow">Explore →</div>
  </a>
</div>

---

## System Architecture

ShrFlow is fully containerized, stateless at the edge, and built for horizontal scaling. The message broker architecture guarantees delivery under load without dropping events.

```
┌─────────────────────────────────────────────────────┐
│                   Next.js Frontend                  │
│          (App Router · Server Components)           │
└───────────────────┬─────────────────────────────────┘
                    │ REST API calls
┌───────────────────▼─────────────────────────────────┐
│                 FastAPI Backend                     │
│        (Python · Async · Business Logic)            │
└────────┬─────────────────────────┬──────────────────┘
         │                         │
┌────────▼────────┐    ┌───────────▼──────────────────┐
│   PostgreSQL    │    │         RabbitMQ              │
│  (Supabase RLS) │    │    (Campaign Dispatch Queue)  │
└─────────────────┘    └──────────────────────────────┘
```

---

## Core Principles

<div class="callout info">
  <span class="callout-icon">🏗️</span>
  <div><strong>Self-hosted first.</strong> ShrFlow runs entirely on your infrastructure. No data leaves your environment. You own the database, the queue, and the delivery layer.</div>
</div>

<div class="callout success">
  <span class="callout-icon">⚡</span>
  <div><strong>Built for scale.</strong> The RabbitMQ dispatch engine handles millions of recipients per campaign with configurable concurrency and retry logic.</div>
</div>

<div class="callout warning">
  <span class="callout-icon">🔐</span>
  <div><strong>Multi-tenant by design.</strong> PostgreSQL Row-Level Security (RLS) enforces tenant isolation at the database layer — not in application code.</div>
</div>

---

## Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | Next.js 14 (App Router) | Campaign management dashboard |
| Backend | FastAPI (Python 3.11) | REST API + business logic |
| Queue | RabbitMQ | Async email dispatch |
| Database | PostgreSQL via Supabase | Multi-tenant data store |
| Auth | Supabase Auth | JWT authentication + RLS |
| Storage | Supabase Storage | Template assets |
| Containers | Docker Compose | Local + production orchestration |

---

## Next Steps

Ready to dive in? Start with the guided onboarding:

1. [Visual Tour →](screen-shots/README.md) — See every screen of the platform
2. [Quick Start →](getting-started/quick-start.md) — Run ShrFlow locally
3. [First Campaign →](getting-started/first-campaign.md) — Send your first email
