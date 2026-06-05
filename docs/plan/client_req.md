# ShrFlow — Client Requirements & Specifications (Core Modules & Accessibility)

This document aggregates the client's functional specifications, product requirements, and technical expectations for the **ShrFlow** email operations platform. The requirements are compiled from the client briefings, modules, and accessibility guidelines.

---

## 1. System Architecture & SaaS Foundation

The platform must operate as a modern, enterprise-grade, multi-tenant SaaS application.

*   **Multi-Tenancy:** Single codebase serving multiple organizations (tenants). Every request must be tenant-aware with strict row-level isolation (RLS) or schema-level isolation in the primary database.
*   **Decoupled Worker Pool:** Background job processing (queues + workers) is required for high-volume tasks such as CSV parsing, campaign dispatches, and analytic aggregations.
*   **Core Technology Stack:**
    *   **Backend:** FastAPI (Python) or Node.js (TypeScript) — executing asynchronous workloads.
    *   **Frontend:** React (Next.js) + TypeScript, styled with Tailwind CSS or Chakra UI.
    *   **Primary Database:** PostgreSQL (storing metadata, lists, templates, logs, and metrics).
    *   **Caching & Rates:** Redis (for session caching, rate-limiting, and scheduler locks).
    *   **Message Broker:** RabbitMQ, AWS SQS, or Google Pub/Sub.
*   **Security & Compliance:**
    *   Encryption-at-rest for databases, backups, and object storage.
    *   Encryption-in-transit (HTTPS everywhere, TLS, HSTS).
    *   Audit logging of sensitive actions (admin activities, role adjustments, bulk data exports).
    *   Region-aware data residency (e.g., storing EU tenant data within EU regions).

---

## 2. Module 1: Data Ingestion & Field Management

Module 1 establishes the system's data foundation, acting as the primary repository for audience data.

### 2.1. File Ingestion Pipeline
*   **Supported File Types:** CSV, XLS (Excel 97-2003), and XLSX (Modern Excel).
*   **Upload Methods:** The UI must provide a file browser button alongside drag-and-drop. Drag-and-drop must *never* be the only option, as it is inaccessible to keyboard-only users.
*   **Dirty Data Handlers:** The ingestion worker must automatically clean common spreadsheet issues:
    *   Skipping leading blank rows.
    *   Handling merged header cells.
    *   Normalizing mixed date formats.
    *   Stripping extraneous white spaces.
    *   Converting numeric fields stored as text back to numbers.
*   **Ingestion Preview:** Display a read-only preview of the first 5 rows of the parsed file to allow users to verify mapping before committing the import.

### 2.2. Custom Fields & Typing
Users must be able to define custom properties dynamically. The system must support the following 8 core field types:
1.  **Text:** For names, custom labels, and descriptors.
2.  **Email:** Must be verified against standard formatting constraints (`name@domain.ext`).
3.  **Phone Number:** Cleaned to digits only; must enforce valid length formats.
4.  **Date:** Validated against recognizable date formats (e.g., YYYY-MM-DD).
5.  **Radio Buttons:** For mutually exclusive selections.
6.  **Dropdowns:** Selected from a pre-defined set of values.
7.  **Multi-select Checkboxes:** For tag lists or multiple attributes.
8.  **Created Date:** Auto-populated by the system on import/creation (defaulting to current date).

### 2.3. Data Validation & Error Feedback
*   **Validation Rules:** Enforce schema checks on field types (e.g., email syntax, mandatory fields, dropdown option matches).
*   **Actionable Errors:** Error reporting must tell the user exactly which row and field failed, why it failed, and provide an example of a valid format.
    *   *Bad Error:* "Invalid data in row 4."
    *   *Good Error:* "Row 4, Email column: 'ravi@' is missing a domain name. Please use a format like 'ravi@gmail.com'."
*   **Manual Entry:** Provide a fully keyboard-accessible form for adding single contacts manually without uploading a file.

---

## 3. Module 2: Email Creation Studio

Module 2 represents the visual editor where users design and compose email campaigns.

### 3.1. Formatting & Layout Controls
*   **Rich Text Canvas:** Provide options to alter font face, font size, bold, italics, underline, text color, alignment, line spacing, indentation, subscripts, superscripts, list formats (numbered and bulleted), links, emojis, and inline images.
*   **Template Support:** Render structured, responsive layout sections. Use MJML or React Email to compile the design canvas into HTML that is compatible with older desktop clients (such as Outlook) and modern mobile clients.

### 3.2. Personalization & AI Assistants
*   **Merge Tokens:** Allow inserting dynamic tokens (e.g., `{{first name}}` or custom fields like `{{city}}`) which are replaced with recipient data during sending.
*   **AI Writing Panel:** Provide integration with a LLM (OpenAI/Anthropic) to:
    *   Suggest high-converting subject lines based on body content.
    *   Improve tone, refine grammar, or rephrase selections.
    *   Adjust paragraph length (expand or shorten).
    *   *Constraint:* The AI panel must never directly alter the editor canvas without explicit user approval (accept/reject controls).

### 3.3. Accessibility Obligations
The editor must satisfy two distinct accessibility requirements:
1.  **Editor UI Accessibility (For Creators):**
    *   All toolbar actions must have text labels or descriptive `aria-label` tags (icons alone are prohibited).
    *   Modals (image uploads, link insertions) must trap keyboard focus.
    *   The token dropdown must use a searchable ARIA combobox pattern.
2.  **Email Output Accessibility (For Recipients):**
    *   Generate a single `<h1>` tag per email.
    *   Enforce structured heading hierarchy (headings cannot skip levels, e.g., `<h1>` directly to `<h3>` is blocked).
    *   Force alternative text input for uploaded images (with a "This image is decorative" checkbox option that sets `alt=""`). Warn users before saving if alt text is missing.
    *   Flag generic link text (e.g., "click here", "read more") and suggest descriptive phrases.
    *   Prevent using raw bullet characters (e.g., `•`) for lists; they must compile to semantic `<ul>`/`<ol>` tags.
    *   Check contrast ratios to ensure text-to-background contrast is $\ge$ 4.5:1.

---

## 4. Module 3: Email Rendering & Pre-Send Validation

Module 3 acts as the quality assurance layer, validating layouts and accessibility before dispatch.

### 4.1. Email Previews
*   **Responsive Layout Toggle:** Render in-app previews for Desktop (600px width) and Mobile (375px width).
*   **Client Rendering Simulator:** Simulate rendering across major email clients to catch client-specific issues (e.g., Outlook rendering glitches, image blocking, CSS strip rules).
    *   *Required Clients:* Gmail (Web & App), Outlook (Windows Desktop), Apple Mail (macOS & iOS), and Yahoo Mail.

### 4.2. Quality Control & Test Sends
*   **Test Dispatch:** Provide a tool to send a live test campaign to up to 5 real email addresses. Displays a "Sending..." loader and returns specific error messages on failure.
*   **Integrated Checklist:** Prior to activation, run an automated scan that scores items as PASS, WARN, or FAIL:
    *   **FAIL (Blocks Sending):** Missing image alt text, color contrast below 4.5:1, or broken links.
    *   **WARN (Warnings/Reminders):** Missing preview text, non-descriptive links ("click here"), missing unsubscribe links, or skipped heading levels.
    *   **PASS:** Valid subject line, correct headers, valid lang attribute.
*   **Checklist UI Accessibility:** Must use text alongside icons for status indications (never rely on color alone). Results must be announced to screen readers via `aria-live`. The "Send Campaign" button must remain disabled until all FAIL items are resolved.

---

## 5. Module 4: Campaign Dispatch & Scheduling

Module 4 executes email campaigns safely and manages sending profiles.

### 5.1. Sender Profiles & Domain Verification
*   **Sender Parameters:** Define a Sender Name (e.g., "Priya from The Store") and a Sender Email (e.g., `priya@yourdomain.com`).
*   **Verification:** Prevent campaigns from using unverified domains. Guide users through configuring SPF, DKIM, and DMARC records to establish sending trust.
*   **Deliverability Wizard:** Display copy-paste values for DNS configuration (TXT/CNAME records) and offer an automated checker to verify propagation.

### 5.2. Subject Lines & Preview Snips
*   **Subject Fields:** Custom inputs supporting merge tokens and emojis. Include a character counter highlighting the ideal length (40–60 characters).
*   **Preview Text:** Enable custom snippet configuration to replace default "view in browser" text in inbox apps.

### 5.3. Scheduling & Review
*   **Send Controls:** Support immediate sending or scheduled dispatches (Date + Time + Time Zone).
*   **Accessible Scheduling Forms:** Date input fields must allow manual text entry (DD/MM/YYYY) as an alternative to clicking through calendar widgets. Time zones must be selected using a searchable combobox.
*   **Pre-Send Review Matrix:** A detailed review table showing all settings:
    *   Sender details, verified status, subject length, and preview text.
    *   Target recipient lists and the total combined recipient count.
    *   Scheduled execution time.
    *   *Requirement:* Each row in the summary must contain an "Edit" link to navigate back to that step. The "Confirm Send" button must dynamically state the total recipient count (e.g., "Confirm Send to 12,847 Recipients").

---

## 6. Module 5: Analytics, Telemetry & Webhook Reporting

Module 5 tracks campaign performance and provides reports.

### 6.1. Core Analytics Metrics
Every campaign report dashboard must track and compute:
*   **Dispatched (Sent):** Total emails sent.
*   **Delivered:** Accepted by receiving servers.
*   **Opened:** Detected via image tracking pixel.
*   **Clicked:** Tracked via link redirect wrappers.
*   **Bounced:** Categorized into:
    *   *Hard Bounces (Permanent):* Typos, closed domains. These must be added to a suppression list immediately to stop further dispatches.
    *   *Soft Bounces (Temporary):* Full mailboxes, temporary timeouts. The system will retry sending. If an address soft-bounces 3 consecutive times, it is converted to a hard bounce.
*   **Calculation Rates:**
    *   $\text{Delivery Rate} = (\text{Delivered} / \text{Sent}) \times 100$
    *   $\text{Open Rate} = (\text{Opened} / \text{Delivered}) \times 100$
    *   $\text{Click Rate} = (\text{Clicked} / \text{Delivered}) \times 100$

### 6.2. Heatmaps & Telemetry
*   **Click Heatmap:** Visual representation overlay showing engagement metrics across links and visual blocks.
*   **Time-on-Email:** Track engagement duration proxies based on telemetry pings from the client.

### 6.3. Report UI & Chart Accessibility
*   **Accessible Colors:** Use color-blind friendly scales (e.g., Blue-to-Orange) instead of standard Red-to-Green indicators. Never use color intensity alone to convey engagement levels on the heatmap.
*   **Keyboard Charts:** Enable navigation of chart data points (bars, line nodes) using the keyboard.
*   **Data Table Fallback:** Every visual representation (bar chart, line graph, click heatmap) must feature a "View as Table" toggle that displays the data in a clean, semantic HTML table.
*   **Table Formatting:** Tables must use captions, bold headers (`<th>`), explicit empty cell labels ("0" or "N/A"), and avoid merged cells.

---

## 7. Accessibility Compliance Framework (WCAG 2.1 AA & ARIA)

The entire application must meet WCAG 2.1 Level AA compliance.

### 7.1. Structural Rules
*   Every page must feature a unique, descriptive `<title>` tag.
*   Structure headings sequentially (`<h1>` $\rightarrow$ `<h2>` $\rightarrow$ `<h3>`) without skipping levels.
*   Declare language properties on the root container (`<html lang="en">`).

### 7.2. Forms & Inputs
*   Every input element must have a corresponding, programmatically linked `<label>` (placeholders are not a substitute for labels).
*   Flag mandatory fields with `aria-required="true"`.
*   Link error text directly to input elements using `aria-describedby` or `aria-errormessage`. Do not denote errors with color borders alone.

### 7.3. Keyboard & Focus Control
*   The entire portal must be navigable using the keyboard alone (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`, `Arrow keys`).
*   Ensure focus rings are highly visible across all elements.
*   **Focus Trapping:** When a dialog/modal is opened, lock keyboard focus inside the modal. Do not let focus escape to background elements. Pressing `Escape` must close the modal and return focus back to the button that triggered it.
*   Provide a "Skip to main content" link at the very top of each page, hidden until focused.

### 7.4. Color & Contrast Ratios
*   Maintain a contrast ratio of at least **4.5:1** for standard body text, and **3:1** for large text (bold 18pt or larger) and UI control states.
*   Never rely on color alone to communicate information. Always accompany color codes with textual labels or distinct icons.
