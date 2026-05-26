---
title: 'Database & RLS Setup'
description: 'How ShrFlow enforces data isolation at the infrastructure level.'
icon: 'database'
---

ShrFlow uses a multi-tenant database architecture where data from all customers is stored in the same tables but strictly isolated using PostgreSQL **Row-Level Security (RLS)**.

## Architectural Decision: Shared Schema

We chose a shared schema (one table for all tenants) over separate schemas for several reasons:
1. **Simplified Migrations:** Updating the schema happens once for the entire platform.
2. **Resource Efficiency:** Connection pooling is significantly more efficient with a single schema.
3. **Scalability:** It is easier to shard a single large table than to manage thousands of tiny schemas.

## RLS Enforcement

The "magic" of ShrFlow's security lies in the RLS policies. Every table in the system (contacts, campaigns, templates, etc.) has RLS enabled.

### How it works in code:

1. **The Request:** A user makes an API request with a JWT.
2. **The Middleware:** The `jwt_middleware.py` extracts the `tenant_id`.
3. **The Session:** The database connection is initialized with a local variable:
   ```sql
   SET LOCAL app.current_tenant_id = 'tenant_uuid_here';
   ```
4. **The Policy:** The database evaluates the policy for every row:
   ```sql
   CREATE POLICY tenant_isolation_policy ON campaigns
   USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
   ```

### Why this is Bulletproof:
Even if a developer writes `SELECT * FROM contacts` without a `WHERE` clause, the database will **only** return contacts belonging to the tenant set in the session variable. If the variable isn't set, it returns zero rows.

## The `asyncpg` Connection Manager

Because Supabase's PostgREST (the default API) does not support setting `SET LOCAL` session variables easily within a transaction, ShrFlow uses a custom **`asyncpg` Engine Manager**.

This manager:
- Maintains a high-performance connection pool.
- Automatically injects the `tenant_id` into the session on every checkout.
- Ensures that read/write operations are cryptographically isolated.

## Manual Schema Updates

When adding a new table, you must always run the security initialization:

```sql
-- 1. Enable RLS
ALTER TABLE new_table_name ENABLE ROW LEVEL SECURITY;

-- 2. Create the Isolation Policy
CREATE POLICY "Tenant Isolation" ON new_table_name
AS PERMISSIVE FOR ALL
TO authenticated
USING (tenant_id = (current_setting('app.current_tenant_id'::text))::uuid)
WITH CHECK (tenant_id = (current_setting('app.current_tenant_id'::text))::uuid);
```
