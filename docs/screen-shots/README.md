# Product Tour

This visual tour is organized by workflow so you can understand the product the way a user experiences it. Every card includes the image, the related app route, and the reason that screen exists.

<div class="callout info">
  <span class="callout-icon">🧭</span>
  <div>Use this page for orientation first. Open the full-size image from any card when you need to inspect finer UI details.</div>
</div>

## Marketing & Access

<div class="tour-grid">
  <div class="tour-card">
    <a class="tour-thumb" href="screen-shots/landing-page.png" target="_blank" rel="noopener">
      <img src="screen-shots/landing-page.png" alt="Marketing landing page" loading="lazy" decoding="async">
    </a>
    <div class="tour-body">
      <div class="tour-title">Marketing Landing Page</div>
      <p>High-conversion homepage used to introduce ShrFlow, guide users into the product, and frame the platform value clearly.</p>
      <div class="tour-meta"><code>platform/client/src/app/(marketing)/page.tsx</code></div>
    </div>
  </div>
  <div class="tour-card">
    <a class="tour-thumb" href="screen-shots/signup.png" target="_blank" rel="noopener">
      <img src="screen-shots/signup.png" alt="User signup screen" loading="lazy" decoding="async">
    </a>
    <div class="tour-body">
      <div class="tour-title">Signup & Onboarding Entry</div>
      <p>Registration gateway for creating a tenant-aware account and beginning the onboarding flow into the main workspace.</p>
      <div class="tour-meta"><code>platform/client/src/app/(auth)/signup/page.tsx</code></div>
    </div>
  </div>
</div>

## Core Workspace Operations

<div class="tour-grid">
  <div class="tour-card">
    <a class="tour-thumb" href="screen-shots/dashboard.png" target="_blank" rel="noopener">
      <img src="screen-shots/dashboard.png" alt="Workspace dashboard" loading="lazy" decoding="async">
    </a>
    <div class="tour-body">
      <div class="tour-title">Dashboard</div>
      <p>The operational home screen for campaign activity, platform health, and immediate next actions across a tenant workspace.</p>
      <div class="tour-meta"><code>platform/client/src/app/(platform)/[tenantId]/dashboard/page.tsx</code></div>
    </div>
  </div>
  <div class="tour-card">
    <a class="tour-thumb" href="screen-shots/contacts-import-history.png" target="_blank" rel="noopener">
      <img src="screen-shots/contacts-import-history.png" alt="Contacts import history" loading="lazy" decoding="async">
    </a>
    <div class="tour-body">
      <div class="tour-title">Audience Import History</div>
      <p>Tracks contact import jobs, row counts, failures, and background processing outcomes for large audience uploads.</p>
      <div class="tour-meta"><code>platform/client/src/app/(platform)/[tenantId]/contacts/import-history/page.tsx</code></div>
    </div>
  </div>
  <div class="tour-card">
    <a class="tour-thumb" href="screen-shots/templates-list.png" target="_blank" rel="noopener">
      <img src="screen-shots/templates-list.png" alt="Templates library" loading="lazy" decoding="async">
    </a>
    <div class="tour-body">
      <div class="tour-title">Templates Library</div>
      <p>A reusable template workspace for MJML-based email layouts, edits, and quick access to saved creative assets.</p>
      <div class="tour-meta"><code>platform/client/src/app/(platform)/[tenantId]/templates/page.tsx</code></div>
    </div>
  </div>
  <div class="tour-card">
    <a class="tour-thumb" href="screen-shots/campaigns-list.png" target="_blank" rel="noopener">
      <img src="screen-shots/campaigns-list.png" alt="Campaign list" loading="lazy" decoding="async">
    </a>
    <div class="tour-body">
      <div class="tour-title">Campaigns List</div>
      <p>The main orchestration view for draft, scheduled, sending, paused, and completed campaigns across the tenant.</p>
      <div class="tour-meta"><code>platform/client/src/app/(platform)/[tenantId]/campaigns/page.tsx</code></div>
    </div>
  </div>
  <div class="tour-card">
    <a class="tour-thumb" href="screen-shots/analytics.png" target="_blank" rel="noopener">
      <img src="screen-shots/analytics.png" alt="Analytics page" loading="lazy" decoding="async">
    </a>
    <div class="tour-body">
      <div class="tour-title">Analytics</div>
      <p>Campaign performance reporting for opens, clicks, delivery results, and engagement trends over time.</p>
      <div class="tour-meta"><code>platform/client/src/app/(platform)/[tenantId]/analytics/page.tsx</code></div>
    </div>
  </div>
  <div class="tour-card">
    <a class="tour-thumb" href="screen-shots/infrastructure.png" target="_blank" rel="noopener">
      <img src="screen-shots/infrastructure.png" alt="Infrastructure status page" loading="lazy" decoding="async">
    </a>
    <div class="tour-body">
      <div class="tour-title">Infrastructure Status</div>
      <p>Operational visibility into worker status, queue behavior, key services, and environment health signals.</p>
      <div class="tour-meta"><code>platform/client/src/app/(platform)/[tenantId]/infrastructure/page.tsx</code></div>
    </div>
  </div>
</div>

## Workspace Administration & Settings

<div class="tour-grid">
  <div class="tour-card">
    <a class="tour-thumb" href="screen-shots/settings-general.png" target="_blank" rel="noopener">
      <img src="screen-shots/settings-general.png" alt="General settings" loading="lazy" decoding="async">
    </a>
    <div class="tour-body">
      <div class="tour-title">General Settings</div>
      <p>Workspace identity, branding, and top-level personalization settings used to shape the tenant environment.</p>
      <div class="tour-meta"><code>platform/client/src/app/(platform)/[tenantId]/settings/general/page.tsx</code></div>
    </div>
  </div>
  <div class="tour-card">
    <a class="tour-thumb" href="screen-shots/settings-organization.png" target="_blank" rel="noopener">
      <img src="screen-shots/settings-organization.png" alt="Organization settings" loading="lazy" decoding="async">
    </a>
    <div class="tour-body">
      <div class="tour-title">Organization Settings</div>
      <p>Legal and mailing profile details that support compliance-sensitive email sending and account governance.</p>
      <div class="tour-meta"><code>platform/client/src/app/(platform)/[tenantId]/settings/organization/page.tsx</code></div>
    </div>
  </div>
  <div class="tour-card">
    <a class="tour-thumb" href="screen-shots/settings-team.png" target="_blank" rel="noopener">
      <img src="screen-shots/settings-team.png" alt="Team management settings" loading="lazy" decoding="async">
    </a>
    <div class="tour-body">
      <div class="tour-title">Team Management</div>
      <p>Invitations, role management, and access changes for shared workspace collaboration.</p>
      <div class="tour-meta"><code>platform/client/src/app/(platform)/[tenantId]/settings/team/page.tsx</code></div>
    </div>
  </div>
  <div class="tour-card">
    <a class="tour-thumb" href="screen-shots/settings-franchise.png" target="_blank" rel="noopener">
      <img src="screen-shots/settings-franchise.png" alt="Franchise settings" loading="lazy" decoding="async">
    </a>
    <div class="tour-body">
      <div class="tour-title">Franchise Accounts</div>
      <p>Parent-child workspace management for multi-tenant structures that need distributed operational control.</p>
      <div class="tour-meta"><code>platform/client/src/app/(platform)/[tenantId]/settings/franchise/page.tsx</code></div>
    </div>
  </div>
  <div class="tour-card">
    <a class="tour-thumb" href="screen-shots/settings-requests.png" target="_blank" rel="noopener">
      <img src="screen-shots/settings-requests.png" alt="Workspace requests settings" loading="lazy" decoding="async">
    </a>
    <div class="tour-body">
      <div class="tour-title">Workspace Requests</div>
      <p>Approval and denial flows for permissions or requests generated by subordinate accounts or franchise branches.</p>
      <div class="tour-meta"><code>platform/client/src/app/(platform)/[tenantId]/settings/requests/page.tsx</code></div>
    </div>
  </div>
  <div class="tour-card">
    <a class="tour-thumb" href="screen-shots/settings-billing.png" target="_blank" rel="noopener">
      <img src="screen-shots/settings-billing.png" alt="Billing settings" loading="lazy" decoding="async">
    </a>
    <div class="tour-body">
      <div class="tour-title">Billing & Plan</div>
      <p>Subscription details, plan limits, and commercial controls for the tenant workspace.</p>
      <div class="tour-meta"><code>platform/client/src/app/(platform)/[tenantId]/settings/billing/page.tsx</code></div>
    </div>
  </div>
  <div class="tour-card">
    <a class="tour-thumb" href="screen-shots/settings-audit-history.png" target="_blank" rel="noopener">
      <img src="screen-shots/settings-audit-history.png" alt="Audit history settings" loading="lazy" decoding="async">
    </a>
    <div class="tour-body">
      <div class="tour-title">Audit History</div>
      <p>Change history and security-sensitive activity log for governance, investigations, and operational review.</p>
      <div class="tour-meta"><code>platform/client/src/app/(platform)/[tenantId]/settings/audit-history/page.tsx</code></div>
    </div>
  </div>
  <div class="tour-card">
    <a class="tour-thumb" href="screen-shots/settings-sending-domains.png" target="_blank" rel="noopener">
      <img src="screen-shots/settings-sending-domains.png" alt="Sending domains settings" loading="lazy" decoding="async">
    </a>
    <div class="tour-body">
      <div class="tour-title">Sending Domains</div>
      <p>Domain verification and DNS setup for authenticated outbound campaign delivery.</p>
      <div class="tour-meta"><code>platform/client/src/app/(platform)/[tenantId]/settings/sending-domains/page.tsx</code></div>
    </div>
  </div>
  <div class="tour-card">
    <a class="tour-thumb" href="screen-shots/settings-sender-identities.png" target="_blank" rel="noopener">
      <img src="screen-shots/settings-sender-identities.png" alt="Sender identities settings" loading="lazy" decoding="async">
    </a>
    <div class="tour-body">
      <div class="tour-title">Sender Identities</div>
      <p>Verified sender addresses that connect authenticated domains to campaign sending workflows.</p>
      <div class="tour-meta"><code>platform/client/src/app/(platform)/[tenantId]/settings/sender-identities/page.tsx</code></div>
    </div>
  </div>
  <div class="tour-card">
    <a class="tour-thumb" href="screen-shots/settings-api-keys.png" target="_blank" rel="noopener">
      <img src="screen-shots/settings-api-keys.png" alt="API keys settings" loading="lazy" decoding="async">
    </a>
    <div class="tour-body">
      <div class="tour-title">API Keys</div>
      <p>Token creation and management for product integrations and programmatic access to the platform.</p>
      <div class="tour-meta"><code>platform/client/src/app/(platform)/[tenantId]/settings/api-keys/page.tsx</code></div>
    </div>
  </div>
</div>

## Personal Account Center

<div class="tour-grid">
  <div class="tour-card">
    <a class="tour-thumb" href="screen-shots/account-center.png" target="_blank" rel="noopener">
      <img src="screen-shots/account-center.png" alt="Account center" loading="lazy" decoding="async">
    </a>
    <div class="tour-body">
      <div class="tour-title">Workspace Selection Portal</div>
      <p>A cross-tenant hub where a user can choose a workspace, inspect invitations, or create a new workspace.</p>
      <div class="tour-meta"><code>platform/client/src/app/(platform)/account/page.tsx</code></div>
    </div>
  </div>
  <div class="tour-card">
    <a class="tour-thumb" href="screen-shots/account-personal-details.png" target="_blank" rel="noopener">
      <img src="screen-shots/account-personal-details.png" alt="Personal profile settings" loading="lazy" decoding="async">
    </a>
    <div class="tour-body">
      <div class="tour-title">Personal Profile</div>
      <p>User-level profile details such as names, avatar settings, and personal account preferences.</p>
      <div class="tour-meta"><code>platform/client/src/app/(platform)/account/profile/page.tsx</code></div>
    </div>
  </div>
  <div class="tour-card">
    <a class="tour-thumb" href="screen-shots/account-security.png" target="_blank" rel="noopener">
      <img src="screen-shots/account-security.png" alt="Security center" loading="lazy" decoding="async">
    </a>
    <div class="tour-body">
      <div class="tour-title">Security Center</div>
      <p>Password, session, and MFA-related controls for a user's personal security posture.</p>
      <div class="tour-meta"><code>platform/client/src/app/(platform)/account/security/page.tsx</code></div>
    </div>
  </div>
  <div class="tour-card">
    <a class="tour-thumb" href="screen-shots/account-deletion-modal.png" target="_blank" rel="noopener">
      <img src="screen-shots/account-deletion-modal.png" alt="Account deletion modal" loading="lazy" decoding="async">
    </a>
    <div class="tour-body">
      <div class="tour-title">Account Deletion Modal</div>
      <p>The destructive-account path for irreversible profile removal and tenant access revocation workflows.</p>
      <div class="tour-meta"><code>platform/client/src/app/(platform)/account/security/components/DeletionModal.tsx</code></div>
    </div>
  </div>
</div>
