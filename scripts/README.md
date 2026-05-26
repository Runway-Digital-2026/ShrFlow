# Project Utility Scripts

This folder contains the scripts that still look like reusable project utilities. They should be run from the repository root and reviewed before use in shared environments.

## Keepers

| Script | Purpose | How to Run |
|---|---|---|
| `apply_sql.py` | Apply a SQL file using the Supabase RPC helper | `python scripts/apply_sql.py path/to/file.sql` |
| `apply_sql_direct.py` | Apply a SQL file using `DATABASE_URL` directly | `python scripts/apply_sql_direct.py path/to/file.sql` |
| `check_db.py` | Quick database inspection helper | `python scripts/check_db.py` |
| `e2e_readiness_check.py` | Environment readiness check for local infrastructure | `python scripts/e2e_readiness_check.py` |
| `install_vps.sh` | VPS bootstrap helper for reverse-proxy deployment | `bash scripts/install_vps.sh <domain> <email>` |
| `region_monitor.py` | Region heartbeat and task reclamation worker | `python scripts/region_monitor.py` |
| `reputation_sync.py` | Domain reputation recalculation worker | `python scripts/reputation_sync.py` |
| `run_migration.sh` | Apply a targeted onboarding migration | `bash scripts/run_migration.sh` |
| `run_template_migration.sh` | Apply the template table migration | `bash scripts/run_template_migration.sh` |
| `schema.sql` | Database schema snapshot for reference | View only |
| `seed_dev_data.py` | Development seeding scaffold | `python scripts/seed_dev_data.py` |
| `seed_templates.py` | Seed starter templates into the database | `python scripts/seed_templates.py` |
| `start_tunnel.sh` | Reverse tunnel helper for a local-to-VPS connection | `bash scripts/start_tunnel.sh user@host` |

## Cleanup Notes

- Removed duplicate `*_scratch.py` utilities.
- Removed one-off diagnostic files from `scratch/`.
- Removed scripts with hardcoded or environment-specific connection details that should not live in the repo.

> Make sure you have the required environment variables in your local `.env` before running any database or infrastructure scripts.
