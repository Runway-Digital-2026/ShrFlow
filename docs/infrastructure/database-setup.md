# Database & RLS Setup

The platform is **Postgres-Agnostic** and can be hosted on any standard PostgreSQL instance. However, the current production implementation is hosted on **Supabase**.

## 1. Initializing the Database

To initialize the database, ensure your instance is running, then apply the migrations using our utility script:

```bash
python3 scripts/apply_all_migrations.py
```

## 2. Row Level Security (RLS)

To enforce multi-tenant isolation, apply the RLS policies:

```bash
python3 scripts/apply_rls.py
```

> [!IMPORTANT]
> Multi-tenancy is enforced at the database level. Failure to apply RLS policies will result in data leakage between tenants.
