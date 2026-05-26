# Repository Structure

Welcome to the ShrFlow Email Engine Platform. This repository contains the core infrastructure, API, and worker services for high-scale email orchestration.

## Directories

*   **`platform/api`**: FastAPI backend for managing campaigns, contacts, and domains.
*   **`platform/worker`**: Python Celery workers for processing email dispatch jobs.
*   **`migrations/`**: Full versioned history of the database schema.
*   **`scripts/`**: Automation tools for deployment and database management.
*   **`docker-compose.yml`**: Local development environment setup.

## Workflow Alignment
Note: The migration `055_handover_alignment.sql` has been included to ensure the schema matches the target enterprise delivery requirements exactly.
