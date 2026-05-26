---
title: 'RBAC & Security'
description: 'Enterprise-grade tenant isolation and access control.'
icon: 'shield-check'
---

Security is a foundational pillar of the ShrFlow architecture. Our system is built to handle highly sensitive customer data across thousands of isolated workspaces using a "Defense in Depth" strategy.

## Tenant Isolation (Row-Level Security)

ShrFlow uses PostgreSQL **Row-Level Security (RLS)** to enforce strict tenant isolation at the database layer. 

Every database session is initialized with `SET LOCAL app.current_tenant_id = '...'`. This ensures that even if an application-level bug forgets a `WHERE tenant_id = ...` clause, the database itself will refuse to return, update, or delete data that does not belong to the authenticated workspace. This provides a cryptographically secure boundary between customers.

## Role-Based Access Control (RBAC)

Within a single workspace, access is gated by granular permissions mapped to four primary roles:

| Feature | Owner | Admin | Creator | Viewer |
| :--- | :---: | :---: | :---: | :---: |
| **Manage Billing** | ✅ | ❌ | ❌ | ❌ |
| **Delete Workspace** | ✅ | ❌ | ❌ | ❌ |
| **Invite Members** | ✅ | ✅ | ❌ | ❌ |
| **Export Contacts** | ✅ | ✅ | ❌ | ❌ |
| **Send Campaigns** | ✅ | ✅ | ❌ | ❌ |
| **Edit Templates** | ✅ | ✅ | ✅ | ❌ |
| **View Analytics** | ✅ | ✅ | ✅ | ✅ |

### Role Definitions

* **Owner:** The ultimate authority. Can manage billing, rename or delete the workspace, and transfer ownership.
* **Admin:** Operational lead. Can manage the team, verify domains, and dispatch high-volume campaigns.
* **Creator:** Content focused. Can design templates and prepare campaigns but cannot trigger a live dispatch to the full audience.
* **Viewer:** Read-only access. Ideal for stakeholders who need to monitor analytics and performance without altering data.

## JWT Security & Invalidation

ShrFlow utilizes a stateless JWT (JSON Web Token) strategy with a server-side **Token Versioning** mechanism.

1. **Short-Lived Tokens:** Access tokens are short-lived to minimize the window of risk.
2. **Versioned Revocation:** Every user has a `token_version` in the database. 
3. **Global Logout:** If a user resets their password or is removed from a workspace, the version is incremented. This instantly invalidates every active JWT held by that user across all devices, providing a "Global Kill Switch" for security breaches.
