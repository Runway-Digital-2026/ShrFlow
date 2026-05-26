---
title: 'Deliverability Engine'
description: 'How ShrFlow guarantees massive-scale inbox placement.'
icon: 'rocket'
---

ShrFlow's architecture is engineered to bypass standard volume constraints using a distributed, event-driven infrastructure. We prioritize "Operational Calm"—ensuring that massive sends do not degrade platform performance for other users.

## The Asynchronous Dispatch Pipeline

When you dispatch a campaign to 1,000,000+ users, the platform orchestrates a high-concurrency fan-out across multiple layers:

<Steps>
  <Step title="Cursor-Based Streaming">
    The API securely queries your audience segment using an `asyncpg` server-side cursor. This streams contacts into memory in optimized batches (default 1,000), preventing OOM (Out of Memory) crashes even when handling millions of rows.
  </Step>
  <Step title="Immutable Snapshotting">
    Before any email is queued, the engine creates an immutable "Snapshot" of the template and merge tags. This ensures that even if you edit the template while a campaign is sending, the already-queued emails remain consistent.
  </Step>
  <Step title="RabbitMQ Queue Injection">
    Contacts are mapped to task IDs and injected into a RabbitMQ high-throughput message broker. We use a **Pre-fetch** strategy of 10 tasks per worker to ensure fair-use across multiple tenants.
  </Step>
  <Step title="Worker Consumption & Throttling">
    Horizontal workers consume the tasks, applying tenant-specific rate-limiting and exponential backoff. This prevents IP throttling from strict providers like Gmail and Outlook.
  </Step>
</Steps>

## Performance Guardrails

### MJML Compilation
ShrFlow utilizes **MJML (Mailjet Markup Language)** as its core rendering engine. Instead of raw HTML, we store structural JSON that compiles into responsive, Outlook-compatible HTML on-the-fly. This guarantees your design looks identical across all 50+ major email clients.

### The Redis "Kill Switch"
In the event of an accidental send or a critical error, ShrFlow provides a sub-millisecond **Kill Switch**. When you click "Pause" in the dashboard, a global key is set in Redis. Every worker checks this key before dispatching an individual email. If active, the send is instantly halted across the entire cluster.

## Reputation Management
We automatically manage your sender reputation through a closed-loop feedback system:
* **Bounce Ingestion:** Hard bounces are instantly moved to the suppression list.
* **FBL (Feedback Loops):** Spam complaints trigger immediate contact exclusion.
* **102KB Safety:** The engine warns you if your email exceeds Gmail's clipping limit, ensuring your "Unsubscribe" link is always visible.
