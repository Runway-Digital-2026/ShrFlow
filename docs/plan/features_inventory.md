# System Features & Components Inventory — ShrFlow

This inventory lists all specific backend and frontend features of the **ShrFlow** platform. You can use this inventory to select and design the **Low-Level Design (LLD)** for each component one by one.

---

## 1. Tenancy, Authentication & Identity

These components manage workspace isolation, user lifecycle, and compliance logs.

1.  **JWT Verification & Route Guard Middleware:** Decode user JWT context and redirect unauthenticated traffic.
2.  **PostgreSQL RLS Connection Manager:** Integrates with `asyncpg` connection pool to execute `SET LOCAL app.current_tenant_id` dynamically on transactions.
3.  **Onboarding Workspace Wizard:** Next.js wizard collecting workspace creation metrics and checking for "ghost workspaces" to prevent onboarding traps.
4.  **Workspace Member Invitation System:** Generates invite tokens (SHA-256) with 7-day expiration.
5.  **Multi-Factor Authentication (MFA) Service:** Generates QR codes and validates TOTP tokens.
6.  **Immutable Audit Log Writer:** Append-only log manager recording metadata of critical actions (bulk deletions, role changes, billing overrides).

---

## 2. Contacts & Audience Ingestion Engine

These components handle contact imports, validation, segmentation, and compliance.

7.  **Direct-to-Storage CSV/XLSX Ingest API:** Presigned URL generator allowing clients to upload bulk files directly to S3/MinIO.
8.  **Asynchronous Ingestion Ingestion Worker:** Streams files from storage in chunks of 500 rows, performing data checks and SQL bulk inserts.
9.  **Real-Time Lead Sync Endpoint (`POST /v1/contacts`):** Exposes a REST endpoint for third-party CRM and lead forms.
10. **Syntax, MX, & Disposable Domain Validator:** Validates email strings and rejects disposable addresses.
11. **Engagement Scorer Background Worker:** Analyzes interaction logs and classifies contacts (active/inactive/at-risk).
12. **GDPR Anonymization Service:** Anonymizes personal identifiable details (PII) of deleted contacts while keeping transaction records intact.
13. **Suppression List & Suppression Manager:** Blocks emails matching hard-bounce or unsubscribe logs.

---

## 3. Template Engine & Visual Studio

These components manage template state, responsive rendering, and asset control.

14. **Visual Design JSON Store:** Manages Canvas editing states as structured rows, columns, and blocks (Zustand/Redux).
15. **Stateless MJML Compilation Microservice:** Compiles design JSON objects into responsive HTML with inlined CSS.
16. **Asset CDN & Reference Tracker:** Prevents deletion of images currently referenced in active templates.
17. **Template Versioning & Patch Diffing Service:** Utilizes JSON-patch schemas to support undo/redo and version rollbacks.
18. **Headless Library Thumbnail Worker:** Spawns headless browser workers (Puppeteer) to capture screenshots of updated templates.

---

## 4. Campaign Orchestration Engine

These components handle draft creation, approval checks, A/B splits, and scheduling.

19. **Optimistic Locking Draft Version Guard:** Prevents concurrency race conditions when multiple creators/admins edit a campaign.
20. **Spintax & Personalization Token Resolver:** Injects personalization tags with dynamic default fallbacks (e.g., `{{first_name | default("Subscriber")}}`).
21. **Pre-Send Integrity Validation Gate:** Audits templates for unsubscribe links, physical addresses, and WCAG contrast errors before enabling send.
22. **Timezone-Aware Campaign Scheduler:** Stands alone as a Redis-locked process executing due campaigns.
23. **Bayesian A/B/n Multi-Armed Bandit Tester:** Adjusts campaign variant delivery splits based on real-time open rates.

---

## 5. Deliverability & Dispatch Engine

These components manage queues, SMTP channels, rate limits, and network warmup.

24. **Outbox Pattern Transaction Manager:** Writes database updates and RabbitMQ messages atomically using transaction tables.
25. **SMTP / AWS SES Dual-Path Router:** Segregates high-priority transactional emails (SMTP) from bulk campaign dispatches (AWS SES).
26. **Redis-Backed Token Bucket Rate Limiter:** Refills capacity tokens per plan tier to govern delivery speed.
27. **Persistent SMTP Connection Pooler:** Pools open TLS sockets to avoid handshake bottlenecks.
28. **Automated Domain Warmup Scheduler:** Staggers outbound caps for new verified domains over a 30-day window.

---

## 6. Observability, Telemetry & Webhooks

These components log telemetry events and stream them to external services.

29. **HMAC Open-Tracking Pixel Validator:** Generates signed 1x1 pixels to log opens.
30. **Redirect Link Telemetry Wrapper:** Wraps campaign URLs in redirect routes to track user clicks.
31. **Bot & Proxy Filter Service:** Identifies and filters out automated crawler actions and Apple MPP proxies.
32. **Click Heatmap Aggregator:** Correlates click coordinates back to DOM nodes in the sent layout.
33. **Time-Spent Tracking Telemetry:** Tracks reading duration based on periodic client pings.
34. **Outbound HMAC Webhook Dispatcher:** Signs event packets with HMAC-SHA256 headers before posting to third parties.

---

## 7. Artificial Intelligence & RAG Engine

These components handle local model inference, semantic search context retrieval, natural language filters, and automated optimization engines.

35. **Model Context Protocol (FastMCP) Server Endpoint:** Local python endpoints exposing database schema (`db_inspector`), logs, and queue metrics (`worker_monitor`) to LLMs.
36. **Asynchronous Vector Data Ingestion Worker:** Background task embedding campaign copy, subject lines, and metadata into pgvector tables upon campaign completion.
37. **Semantic Similarity Search Endpoint:** Cosine-similarity query resolver using pgvector to fetch relevant context files.
38. **Local 1.5B LLM RAG Chatbot Widget:** Client-side sliding widget utilizing two-stage local LLM prompting (routing + context synthesis) for copy drafting.
39. **Natural Language Segment Generator:** API converting raw user requests on the Contacts page into structured database filter JSON parameters.
40. **Deliverability SMTP Explainer Modal:** Assistant UI converting obscure SMTP bounce error codes into human-readable explanations.
41. **Multi-Language "Smart Translation" Service:** API translating campaign templates into local dialects.
42. **Machine Learning Send-Time Optimizer (STO):** Worker analyzing 30-day telemetry logs to schedule individual deliveries during peak open windows.
43. **Bayesian Multi-Armed Bandit A/B Tester:** Worker dynamically updating campaign variant split ratios based on live engagement.
44. **Smart Subject Line Generator:** AI suggestions for subject lines based on historical high-performing dispatches.

