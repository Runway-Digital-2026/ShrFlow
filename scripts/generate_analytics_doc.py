#!/usr/bin/env python3
import os
import sys

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def add_header_footer(canvas_obj, doc):
    canvas_obj.saveState()
    # Cover page has no header/footer
    if doc.page == 1:
        canvas_obj.restoreState()
        return
    
    # Draw header
    canvas_obj.setFont('Helvetica-Bold', 8)
    canvas_obj.setFillColor(colors.HexColor('#0EA5E9')) # Secondary color (Sky 500)
    canvas_obj.drawString(54, 750, "SHRFLOW ANALYTICS & INTELLIGENCE")
    
    canvas_obj.setFont('Helvetica', 8)
    canvas_obj.setFillColor(colors.HexColor('#64748B')) # Slate 500
    canvas_obj.drawRightString(doc.pagesize[0] - 54, 750, "SYSTEM REFERENCE DOCUMENT")
    
    # Header line
    canvas_obj.setStrokeColor(colors.HexColor('#CBD5E1')) # Slate 300
    canvas_obj.setLineWidth(0.5)
    canvas_obj.line(54, 742, doc.pagesize[0] - 54, 742)
    
    # Draw footer line
    canvas_obj.line(54, 60, doc.pagesize[0] - 54, 60)
    
    # Draw footer text
    canvas_obj.drawString(54, 45, "Confidential - For Internal Use Only")
    canvas_obj.drawRightString(doc.pagesize[0] - 54, 45, f"Page {doc.page} of 12")
    
    canvas_obj.restoreState()

def generate_pdf():
    # Target directory and file path
    pdf_dir = r"C:\Users\vinay\.gemini\antigravity\brain\38c004a7-da6c-4c33-a5e6-fe617bfbb3e4"
    os.makedirs(pdf_dir, exist_ok=True)
    pdf_path = os.path.join(pdf_dir, "analytics_documentation.pdf")
    
    print(f"Generating PDF at: {pdf_path}")
    
    # Page setup
    # Margins: 54 points (0.75 in) left/right, 70 points (0.97 in) top/bottom
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=70,
        bottomMargin=70
    )
    
    # Theme Color Palette (ShrFlow Slate/Sky premium theme)
    primary_color = colors.HexColor('#0F172A')   # Slate 900
    secondary_color = colors.HexColor('#0EA5E9') # Sky 500
    text_color = colors.HexColor('#334155')      # Slate 700
    light_bg = colors.HexColor('#F8FAFC')        # Slate 50
    border_color = colors.HexColor('#E2E8F0')    # Slate 200
    
    # Typography Styles
    styles = getSampleStyleSheet()
    
    # Base text styles
    normal_style = styles['Normal']
    normal_style.textColor = text_color
    normal_style.fontSize = 10
    normal_style.leading = 14.5
    normal_style.fontName = 'Helvetica'
    
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=normal_style,
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=primary_color,
        spaceAfter=15
    )
    
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=normal_style,
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=secondary_color,
        spaceAfter=40
    )
    
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=normal_style,
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=10,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=normal_style,
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=secondary_color,
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body_Custom',
        parent=normal_style,
        spaceAfter=8
    )
    
    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=normal_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=5
    )
    
    code_style = ParagraphStyle(
        'Code_Custom',
        parent=normal_style,
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=primary_color,
        backColor=light_bg,
        borderColor=border_color,
        borderWidth=0.5,
        borderPadding=6,
        spaceAfter=10
    )
    
    story = []
    
    # ---------------------------------------------------------
    # PAGE 1: COVER PAGE
    # ---------------------------------------------------------
    story.append(Spacer(1, 140))
    # Colored top accent bar
    story.append(Table(
        [[Paragraph("", body_style)]],
        colWidths=[504],
        rowHeights=[6],
        style=TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), secondary_color),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ])
    ))
    story.append(Spacer(1, 15))
    story.append(Paragraph("SHRFLOW EMAIL ENGINE REFERENCE MANUAL", ParagraphStyle('UpperTitle', fontName='Helvetica-Bold', fontSize=9, leading=11, textColor=colors.HexColor('#64748B'), spaceAfter=5)))
    story.append(Paragraph("Analytics & Intelligence Command Center", title_style))
    story.append(Paragraph("An Exhaustive Engineering Guide covering Platform Telemetry, tracking Ingest, SMTP Bounce Science, and Machine Learning Diagnostics", subtitle_style))
    
    story.append(Table(
        [[Paragraph("", body_style)]],
        colWidths=[504],
        rowHeights=[0.5],
        style=TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), border_color),
            ('TOPPADDING', (0,0), (-1,-1), 0),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ])
    ))
    story.append(Spacer(1, 100))
    
    metadata_text = """
    <b>Document Classification:</b> System Architecture Reference Guide<br/>
    <b>Release Version:</b> 1.0.0 (Stable Production)<br/>
    <b>Release Date:</b> May 2026<br/>
    <b>Prepared For:</b> ShrFlow Technical Teams & Workspace Administrators<br/>
    <b>Copyright:</b> &copy; 2026 ShrFlow. All rights reserved.
    """
    story.append(Paragraph(metadata_text, ParagraphStyle('Metadata', fontName='Helvetica', fontSize=9.5, leading=16, textColor=colors.HexColor('#475569'))))
    story.append(PageBreak())
    
    # ---------------------------------------------------------
    # PAGE 2: EXECUTIVE SUMMARY & SYSTEM OVERVIEW
    # ---------------------------------------------------------
    story.append(Paragraph("1. Executive Summary & System Overview", h1_style))
    story.append(Paragraph(
        "The ShrFlow Analytics & Intelligence Command Center is the operational telemetry hub of the ShrFlow email system. "
        "Modern enterprise communication requires more than simple batch sending; it demands deep statistical visibility, "
        "real-time monitoring, and automatic deliverability protection to ensure that sent emails reach the recipient inboxes. "
        "This document details the software design, telemetry ingestion pipelines, database schemas, and AI diagnostic components "
        "that power ShrFlow's analytics engine.",
        body_style
    ))
    
    story.append(Paragraph("1.1 System Objectives", h2_style))
    story.append(Paragraph(
        "The telemetry suite is engineered to fulfill three principal system goals:",
        body_style
    ))
    story.append(Paragraph("• <b>Absolute Data Consistency:</b> Ensuring that every single email dispatch, pixel load, link redirect, and bounce notice is logged with high transactional integrity.", bullet_style))
    story.append(Paragraph("• <b>Low-Latency Event Ingestion:</b> Decoupling event tracking routes from core analytics dashboards to prevent web traffic load from stalling system performance.", bullet_style))
    story.append(Paragraph("• <b>Proactive Deliverability Monitoring:</b> Calculating bounce and spam rate percentages dynamically, providing workspace administrators with early warnings about list health and DNS status.", bullet_style))
    
    story.append(Spacer(1, 15))
    story.append(Paragraph("1.2 Real-World Value & Use Cases", h2_style))
    story.append(Paragraph(
        "In the email marketing industry, list decay and bad sender reputations are the leading causes of delivery failures. "
        "For example, sending campaigns to outdated contact lists containing invalid domains results in hard bounces. "
        "If a tenant's bounce rate exceeds 5%, mailbox providers (such as Gmail, Yahoo, and Outlook) start redirecting "
        "subsequent dispatches directly to the spam folder. By aggregating these metrics in real-time, ShrFlow enables "
        "administrators to identify problems early, configure SPF/DKIM keys, purge inactive contacts, and maximize "
        "ROI on active campaigns.",
        body_style
    ))
    story.append(PageBreak())
    
    # ---------------------------------------------------------
    # PAGE 3: CORE TECH STACK & INTEGRATION DESIGN
    # ---------------------------------------------------------
    story.append(Paragraph("2. Core Technology Stack & Integration Design", h1_style))
    story.append(Paragraph(
        "The telemetry engine is built using modern frameworks optimized for throughput, security, and responsive layouts. "
        "By leveraging containerized services, the platform ensures rapid deployments and isolated service scaling.",
        body_style
    ))
    
    story.append(Paragraph("2.1 Technology Stack Configuration", h2_style))
    
    # Tech Stack Table
    tech_data = [
        [
            Paragraph("<b>System Layer</b>", ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=9, textColor=primary_color)),
            Paragraph("<b>Technology Stack</b>", ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=9, textColor=primary_color)),
            Paragraph("<b>Core Role & Functionality</b>", ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=9, textColor=primary_color))
        ],
        [
            Paragraph("Backend API", body_style),
            Paragraph("FastAPI (Python 3.11)", body_style),
            Paragraph("Exposes protected telemetry endpoints, computes smart insights, parses chatbot queries, and handles JWT checks.", body_style)
        ],
        [
            Paragraph("Database", body_style),
            Paragraph("PostgreSQL (Supabase)", body_style),
            Paragraph("Stores relational campaign data, dispatch queues, tracking events, and user profiles with custom indexing.", body_style)
        ],
        [
            Paragraph("Frontend UI", body_style),
            Paragraph("Next.js 14 & React 18", body_style),
            Paragraph("Renders responsive control panels, dynamic 7d activity charts, and color-scaled engagement heatmaps.", body_style)
        ],
        [
            Paragraph("Task Workers", body_style),
            Paragraph("RabbitMQ & Redis", body_style),
            Paragraph("RabbitMQ acts as the message broker, queuing campaigns for execution. Redis maintains lock controls.", body_style)
        ]
    ]
    
    tech_table = Table(tech_data, colWidths=[100, 120, 284])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), light_bg),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("2.2 Multi-Tenant Data Isolation Security Model", h2_style))
    story.append(Paragraph(
        "A foundational design pattern in ShrFlow is absolute isolation between organizations. Every incoming HTTP request must include "
        "a valid JSON Web Token (JWT) in the Authorization header. The FastAPI middleware extracts the token, verifies the cryptographic signature "
        "using a system secret, and decodes the identity context (user_id, role, tenant_id).",
        body_style
    ))
    story.append(Paragraph(
        "When querying telemetry datasets (such as campaigns, dispatches, and email events), the API injects the verified tenant_id directly into "
        "the Supabase PostgREST client: `.eq('tenant_id', tenant_id)`. This query isolation prevents any cross-tenant data leakage.",
        body_style
    ))
    story.append(PageBreak())
    
    # ---------------------------------------------------------
    # PAGE 4: THE INGESTION PIPELINE & CAMPAIGN PREPARATION
    # ---------------------------------------------------------
    story.append(Paragraph("3. The Ingestion Pipeline & Campaign Preparation", h1_style))
    story.append(Paragraph(
        "To deliver accurate, live interaction statistics, the platform captures every lifecycle transition of an outbound email. "
        "The tracking workflow begins before the message is ever sent, during the template pre-compilation phase.",
        body_style
    ))
    
    story.append(Paragraph("3.1 Pre-Compilation and Dynamic Personalization", h2_style))
    story.append(Paragraph(
        "When a campaign is triggered for dispatch, the worker process loads the base HTML template and retrieves the targeted "
        "audience contact records. For each contact, the engine compiles a personalized version of the email, replacing custom "
        "merge tags like {{first_name}} and {{last_name}} with the contact's actual profile data.",
        body_style
    ))
    
    story.append(Paragraph("3.2 Injection of Tracking Codes", h2_style))
    story.append(Paragraph(
        "During this compilation step, the worker inserts tracking hooks. It appends an invisible image pixel for open tracking, "
        "and parses the HTML body to extract all hyperlinked anchor tags. Each standard link is replaced with a custom-generated "
        "tracking wrapper link unique to that recipient.",
        body_style
    ))
    
    story.append(Paragraph("3.3 RabbitMQ Decoupling & Database Records", h2_style))
    story.append(Paragraph(
        "Sending thousands of emails simultaneously can create intense traffic spikes. To handle this, the backend decouples "
        "campaign launching from SMTP transmission. The API creates a Campaign row in PostgreSQL and generates 'PENDING' rows "
        "in the campaign_dispatch table for every contact. It then publishes these dispatch task IDs to a dedicated RabbitMQ queue.",
        body_style
    ))
    story.append(Paragraph(
        "Worker processes consume tasks from the queue at a controlled rate, format the SMTP payloads, connect to the delivery relay, "
        "and fire the messages. Once delivered, the worker updates the row status in campaign_dispatch to 'DISPATCHED'. "
        "If the SMTP handshake fails immediately, the status is set to 'FAILED' and the error details are logged.",
        body_style
    ))
    story.append(PageBreak())
    
    # ---------------------------------------------------------
    # PAGE 5: OPEN TRACKING TELEMETRY & BOT PROTECTION
    # ---------------------------------------------------------
    story.append(Paragraph("4. Open Tracking Telemetry & Bot Protection", h1_style))
    story.append(Paragraph(
        "Tracking when an email is opened is critical for measuring subscriber interest. This is achieved using an "
        "invisible asset request, which must be carefully filtered to exclude automated traffic.",
        body_style
    ))
    
    story.append(Paragraph("4.1 Open-Tracking Pixel Mechanics", h2_style))
    story.append(Paragraph(
        "During pre-compilation, the email sender worker appends an invisible 1x1 transparent PNG image at the bottom "
        "of the email body, just before the closing body tag. The image sources a tracking endpoint:",
        body_style
    ))
    story.append(Paragraph(
        "&lt;img src=\"http://api.shrflow.com/tracking/open?t=[JWT_TOKEN]\" width=\"1\" height=\"1\" /&gt;",
        code_style
    ))
    story.append(Paragraph(
        "The 't' parameter is a lightweight JWT token containing the campaign_id, subscriber_id, and tenant_id, signed "
        "cryptographically by the platform. When the subscriber opens the email, their email client fetches this image, "
        "triggering a request to the FastAPI server. The API decodes the token, verifies its signature, and logs an "
        "'open' event in the email_events database.",
        body_style
    ))
    
    story.append(Paragraph("4.2 Bot Filtering and Data Accuracy", h2_style))
    story.append(Paragraph(
        "Many mailbox providers (especially Apple Mail and Gmail) cache email assets automatically on their proxy servers "
        "immediately upon delivery to protect users. This triggers a false 'open' request. To prevent these false events "
        "from skewing analytics, the API monitors incoming requests for proxy characteristics: checking user-agent strings "
        "(e.g., AppleNews, GoogleImageProxy) and tracking rapid multiple requests.",
        body_style
    ))
    story.append(Paragraph(
        "Proxy requests are logged with is_bot = True. The platform's dashboard and reporting queries filter out these "
        "rows, displaying only verified human interactions.",
        body_style
    ))
    
    story.append(Spacer(1, 10))
    story.append(Paragraph("4.3 Real-World Walkthrough", h2_style))
    story.append(Paragraph(
        "1. A marketing manager sends a newsletter to subscriber 'Vinay'.<br/>"
        "2. The email client on Vinay's phone downloads the invisible tracking pixel.<br/>"
        "3. The request hits the API. The user-agent is identified as a mobile browser (human).<br/>"
        "4. The API records a human 'open' event in the database, updating the campaign's open rate on the dashboard in real-time.",
        body_style
    ))
    story.append(PageBreak())
    
    # ---------------------------------------------------------
    # PAGE 6: CLICK TELEMETRY & REDIRECT ARCHITECTURE
    # ---------------------------------------------------------
    story.append(Paragraph("5. Click Telemetry & Redirect Architecture", h1_style))
    story.append(Paragraph(
        "Click-through rates are the primary indicator of subscriber engagement. Tracking clicks requires intercepting "
        "hyperlink navigations, registering the event, and redirecting the subscriber to their destination with minimal latency.",
        body_style
    ))
    
    story.append(Paragraph("5.1 Anchor Link Rewriting Pipeline", h2_style))
    story.append(Paragraph(
        "When an email template is compiled, the system's HTML parser extracts all hyperlink href values. "
        "Each link is rewritten to route through the tracking gateway. For example, if the template contains a link to "
        "https://yoursite.com/promo, it is rewritten to: ",
        body_style
    ))
    story.append(Paragraph(
        "&lt;a href=\"http://api.shrflow.com/tracking/click?t=[JWT_TOKEN]&url=https://yoursite.com/promo\"&gt;Shop Now&lt;/a&gt;",
        code_style
    ))
    story.append(Paragraph(
        "The JWT contains the subscriber's ID, the campaign ID, and the tenant ID, ensuring the click can be attributed to the exact contact.",
        body_style
    ))
    
    story.append(Paragraph("5.2 Redirect API Handler", h2_style))
    story.append(Paragraph(
        "When the subscriber clicks the link, the browser opens the tracking gateway. The FastAPI server processes the request:",
        body_style
    ))
    story.append(Paragraph("1. <b>Token Parsing:</b> The API extracts and decrypts the JWT token, validating the signature.", bullet_style))
    story.append(Paragraph("2. <b>Event Registration:</b> The API inserts a click record into the email_events table with the target URL, timestamp, and device details.", bullet_style))
    story.append(Paragraph("3. <b>Redirection Response:</b> The API returns an HTTP 302 'Found' response with the Location header set to the original destination URL.", bullet_style))
    
    story.append(Spacer(1, 10))
    story.append(Paragraph("5.3 Real-World Walkthrough", h2_style))
    story.append(Paragraph(
        "1. A subscriber receives an email and clicks the 'Shop Now' button.<br/>"
        "2. The browser request goes to the API: GET /tracking/click?t=eyJ...&url=https://yoursite.com/promo.<br/>"
        "3. The API logs a 'click' event for the campaign and subscriber in PostgreSQL.<br/>"
        "4. The API sends a 302 redirect. The subscriber's browser immediately loads the promo page. "
        "This entire redirection process takes less than 50 milliseconds, providing a seamless user experience.",
        body_style
    ))
    story.append(PageBreak())
    
    # ---------------------------------------------------------
    # PAGE 7: EMAIL BOUNCES & DELIVERABILITY SCIENCE
    # ---------------------------------------------------------
    story.append(Paragraph("6. Email Bounces & Deliverability Science", h1_style))
    story.append(Paragraph(
        "Deliverability represents the percentage of emails that successfully land in subscriber inboxes. "
        "Managing deliverability requires capturing and categorizing bounces—delivery failures reported by recipient servers.",
        body_style
    ))
    
    story.append(Paragraph("6.1 Hard Bounces vs. Soft Bounces", h2_style))
    story.append(Paragraph(
        "Bounces are categorized into two types based on the permanence of the delivery failure:",
        body_style
    ))
    story.append(Paragraph(
        "• <b>Hard Bounces (5xx SMTP Codes):</b> Permanent delivery failures. These occur when an email address does not exist, "
        "the domain is invalid, or the recipient server has blocked the sender. Examples include SMTP error 550 (User Unknown). "
        "Hard bounces are critical deliverability threats and must be managed immediately.",
        body_style
    ))
    story.append(Paragraph(
        "• <b>Soft Bounces (4xx SMTP Codes):</b> Temporary delivery failures. These occur when a recipient's inbox is full, "
        "their mail server is temporarily down, or the message exceeds file size limits. Examples include SMTP error 422 (Inbox Full). "
        "The system will retry sending to soft-bouncing addresses for up to 72 hours before marking them as failed.",
        body_style
    ))
    
    story.append(Paragraph("6.2 Webhook Listening and Event Processing", h2_style))
    story.append(Paragraph(
        "When an email bounces, the recipient's mail server sends a bounce notification to the SMTP delivery relay. "
        "The relay processes this bounce and fires a POST webhook request to the platform's webhook endpoint `/webhooks/delivery`. "
        "The FastAPI server parses this webhook payload, extracts the bounce code and description, and inserts a "
        "'bounce' event row into email_events, linking it to the campaign and contact.",
        body_style
    ))
    
    story.append(Paragraph("6.3 Suppression List Automation", h2_style))
    story.append(Paragraph(
        "To protect sender reputation, hard-bouncing contacts must never be emailed again. When a 'bounce' event is recorded, "
        "a database trigger or worker process updates the contact's status in the contacts table to 'bounced' or 'unsubscribed'. "
        "Future campaign queries filter out these contacts automatically: `.eq('status', 'active')`.",
        body_style
    ))
    story.append(PageBreak())
    
    # ---------------------------------------------------------
    # PAGE 8: SUBSCRIBER INTELLIGENCE & ENGAGEMENT SEGMENTATION
    # ---------------------------------------------------------
    story.append(Paragraph("7. Subscriber Intelligence & Engagement Segmentation", h1_style))
    story.append(Paragraph(
        "A healthy email list is segmented by engagement. The Subscriber Intelligence engine groups the contact base "
        "dynamically based on their interaction history, helping administrators target active users and re-engage inactive ones.",
        body_style
    ))
    
    story.append(Paragraph("7.1 Real-Time Segmentation Tiers", h2_style))
    story.append(Paragraph(
        "The backend route `/subscriber-intelligence` scans the database to group subscribers into three engagement tiers:",
        body_style
    ))
    
    # Segment Table
    segment_data = [
        [
            Paragraph("<b>Engagement Tier</b>", ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=9, textColor=primary_color)),
            Paragraph("<b>Evaluation Rule</b>", ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=9, textColor=primary_color)),
            Paragraph("<b>Recommended Strategy</b>", ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=9, textColor=primary_color))
        ],
        [
            Paragraph("Highly Engaged", body_style),
            Paragraph("Contact has &ge; 3 recorded open/click events", body_style),
            Paragraph("Target with promotional offers, reviews, and loyalty rewards.", body_style)
        ],
        [
            Paragraph("Moderately Engaged", body_style),
            Paragraph("Contact has 1 or 2 open/click events", body_style),
            Paragraph("Send regular newsletters and surveys to build brand affinity.", body_style)
        ],
        [
            Paragraph("Inactive List", body_style),
            Paragraph("Contact has 0 open/click events in database", body_style),
            Paragraph("Run a win-back re-engagement campaign, or purge to protect reputation.", body_style)
        ]
    ]
    segment_table = Table(segment_data, colWidths=[110, 160, 234])
    segment_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), light_bg),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(segment_table)
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("7.2 Real-World Segmentation Example", h2_style))
    story.append(Paragraph(
        "Imagine an e-commerce brand launching a new product line. Instead of blasting the entire database—which increases spam "
        "complaints and list fatigue—the administrator filters the contacts to select only the 'Highly Engaged' segment. "
        "This segment has a proven track record of opening and clicking campaigns. As a result, the campaign achieves a high "
        "open rate (e.g., 45%) and a strong click-through rate, reinforcing positive sender reputation metrics with major inbox providers.",
        body_style
    ))
    story.append(PageBreak())
    
    # ---------------------------------------------------------
    # PAGE 9: OPTIMAL SEND TIME HEATMAP (7x24 MATRIX)
    # ---------------------------------------------------------
    story.append(Paragraph("8. Optimal Send Time Heatmap (7x24 Matrix)", h1_style))
    story.append(Paragraph(
        "Email open rates are highly dependent on the day and time of delivery. To optimize this, the platform provides "
        "an interactive engagement heatmap visualizing when a tenant's subscribers are most active.",
        body_style
    ))
    
    story.append(Paragraph("8.1 Data Gathering & Ingestion", h2_style))
    story.append(Paragraph(
        "The backend route `GET /analytics/heatmap` queries the email_events table for all open and click events "
        "matching the active tenant. Only events where is_bot = False are selected to ensure proxy hits do not corrupt the data. "
        "The query returns the created_at timestamp for each interaction event.",
        body_style
    ))
    
    story.append(Paragraph("8.2 Weekday and Hour Binning Logic", h2_style))
    story.append(Paragraph(
        "For each timestamp, the API extracts the day of the week (0 to 6) and the hour of the day (0 to 23). "
        "The API accumulates counts in a 2D grid structure:",
        body_style
    ))
    story.append(Paragraph(
        "grid = {day: {hour: 0 for hour in range(24)} for day in range(7)}",
        code_style
    ))
    story.append(Paragraph(
        "This 2D grid is flattened into a JSON array of 168 coordinate objects: `[{'day': day_idx, 'hour': hour_idx, 'value': count}]` "
        "and returned to the frontend client.",
        body_style
    ))
    
    story.append(Paragraph("8.3 Frontend Shading and Tooltips", h2_style))
    story.append(Paragraph(
        "The Next.js client renders the heatmap as a grid of 7 rows (Monday to Sunday) and 24 columns (hours 12 AM to 11 PM). "
        "The background opacity of each cell scales dynamically based on its count relative to the maximum count in the dataset: "
        "`opacity = value / max_value`. A hover tooltip displays the exact day, hour, and event count for each cell, "
        "helping users visually identify the best times to schedule future campaign sends.",
        body_style
    ))
    story.append(PageBreak())
    
    # ---------------------------------------------------------
    # PAGE 10: PREDICTIVE ANALYTICS & FORECASTING MODELS
    # ---------------------------------------------------------
    story.append(Paragraph("9. Predictive Analytics & Forecasting Models", h1_style))
    story.append(Paragraph(
        "The predictive analytics layer evaluates historical campaigns to forecast future performance, "
        "helping administrators set realistic benchmarks and improve their sending strategies.",
        body_style
    ))
    
    story.append(Paragraph("9.1 Time-Series Predictive Forecasting", h2_style))
    story.append(Paragraph(
        "The `/predictive` endpoint projects expected open and click rates for the next campaign. The engine "
        "retrieves the last 10 campaigns sent by the tenant, calculates their individual open/click rates, and "
        "computes a weighted moving average. Recent campaigns are weighted more heavily than older ones, reflecting "
        "current subscriber interest and list hygiene trends.",
        body_style
    ))
    
    story.append(Paragraph("9.2 Evaluating Trend Slope", h2_style))
    story.append(Paragraph(
        "The forecasting model compares the performance of the oldest campaign in the series against the most recent "
        "to determine the overall engagement trend. The slope is classified into one of three trends:",
        body_style
    ))
    story.append(Paragraph("• <b>Upward Trend:</b> Average engagement is growing by &gt; 1% (e.g., due to improving list quality).", bullet_style))
    story.append(Paragraph("• <b>Downward Trend:</b> Average engagement is dropping by &gt; 1% (e.g., due to list fatigue or delivery issues).", bullet_style))
    story.append(Paragraph("• <b>Stable Trend:</b> Performance is flat, staying within a &plusmn; 1% range.", bullet_style))
    
    story.append(Paragraph("9.3 Statistical Confidence Metrics", h2_style))
    story.append(Paragraph(
        "Forecasting accuracy depends on data volume. To reflect this, the model calculates a confidence score based "
        "on the number of sent campaigns: starting at 65% for a single campaign and scaling up to 92% once a history "
        "of 8 or more campaigns is established. This ensures administrators understand the statistical reliability of the predictions.",
        body_style
    ))
    story.append(PageBreak())
    
    # ---------------------------------------------------------
    # PAGE 11: CONVERSATIONAL AI ANALYTICS CHATBOT
    # ---------------------------------------------------------
    story.append(Paragraph("10. Conversational AI Analytics Chatbot", h1_style))
    story.append(Paragraph(
        "To make analytics accessible, the platform includes a floating chatbot assistant. Users can ask questions "
        "in plain English and receive real-time, database-driven answers.",
        body_style
    ))
    
    story.append(Paragraph("10.1 Natural Language Query Parsing", h2_style))
    story.append(Paragraph(
        "The `/chat` endpoint accepts a text query from the user. Rather than running a static chatbot flow, "
        "the FastAPI backend parses the query to identify key intent tokens: open, click, bounce, contact, and campaign.",
        body_style
    ))
    
    story.append(Paragraph("10.2 Dynamic Context Building", h2_style))
    story.append(Paragraph(
        "When an intent token is matched, the engine executes targeted database queries to pull live data for the active tenant. "
        "It then generates a natural-language response incorporating these live metrics, complete with optimization suggestions:",
        body_style
    ))
    story.append(Paragraph(
        "if 'open' in query:<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;return f\"Your open rate is {open_rate}% with {num_opens} total opens. To improve this...\"",
        code_style
    ))
    
    story.append(Paragraph("10.3 Real-World Conversational Examples", h2_style))
    story.append(Paragraph(
        "• <b>User query:</b> 'What is my bounce rate?'<br/>"
        "<b>System response:</b> 'You have recorded 12 total bounces/delivery failures, yielding a bounce rate of 1.2%. "
        "A healthy bounce rate should be under 2%. If it rises, you might need to clean your contact lists.'",
        body_style
    ))
    story.append(Paragraph(
        "• <b>User query:</b> 'Tell me about my contacts.'<br/>"
        "<b>System response:</b> 'You currently have 1,420 total contacts in your audience database. "
        "You can segment them in the Subscriber Intelligence view based on their engagement history.'",
        body_style
    ))
    story.append(Paragraph(
        "• <b>User query:</b> 'Show me my account health.'<br/>"
        "<b>System response:</b> 'Hello! Here is a snapshot of your live metrics: Contacts: 1,420; Campaigns: 15; "
        "Total Sent: 8,420; Open Rate: 22.4%; Click Rate: 3.1%; Bounce Rate: 1.2%. Ask me about any specific metric for details!'",
        body_style
    ))
    story.append(PageBreak())
    
    # ---------------------------------------------------------
    # PAGE 12: OPERATIONS, COMPLIANCE, & MAINTENANCE
    # ---------------------------------------------------------
    story.append(Paragraph("11. Operations, Compliance, & Maintenance", h1_style))
    story.append(Paragraph(
        "Running a high-performance email analytics engine requires ongoing database maintenance, security controls, "
        "and compliance with international privacy laws.",
        body_style
    ))
    
    story.append(Paragraph("11.1 Database Optimization & Indexing", h2_style))
    story.append(Paragraph(
        "As a workspace sends more campaigns, the email_events and campaign_dispatch tables can grow to millions of rows. "
        "To maintain fast query response times, the PostgreSQL database includes compound indexes on frequently queried columns: "
        "specifically campaign_id + event_type on email_events, and campaign_id + status on campaign_dispatch. "
        "This ensures that dashboard charts and AI chatbot queries resolve in milliseconds.",
        body_style
    ))
    
    story.append(Paragraph("11.2 Delivery Compliance (SPF, DKIM, DMARC)", h2_style))
    story.append(Paragraph(
        "High deliverability rates require proper domain authentication. The platform monitors verified domains to ensure they have "
        "correct Sender Policy Framework (SPF), DomainKeys Identified Mail (DKIM), and Domain-based Message Authentication "
        "Reporting and Conformance (DMARC) records configured. If these records are missing or invalid, the smart insights engine "
        "flags a warning on the dashboard.",
        body_style
    ))
    
    story.append(Paragraph("11.3 Privacy Regulations (GDPR & CAN-SPAM)", h2_style))
    story.append(Paragraph(
        "The platform is designed to comply with data privacy laws. Every marketing email must include an unsubscribe link. "
        "When a subscriber clicks the unsubscribe link, the tracking API logs the unsubscribe event and immediately updates "
        "the contact's status to 'unsubscribed' in the database. Future campaigns exclude these unsubscribed contacts automatically, "
        "ensuring compliance with CAN-SPAM and GDPR regulations.",
        body_style
    ))
    story.append(Paragraph(
        "Additionally, tracking tokens are encrypted and contain no raw personally identifiable information (PII), "
        "protecting subscriber privacy in transit.",
        body_style
    ))
    
    # Run simple footer callback except on first page
    doc.build(story, onFirstPage=lambda c, d: None, onLaterPages=add_header_footer)
    print("PDF Generation complete.")

if __name__ == "__main__":
    generate_pdf()
