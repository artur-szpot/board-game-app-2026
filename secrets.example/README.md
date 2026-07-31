# Secrets Templates

These templates are commit-safe placeholders.

## Setup

1. Copy secrets.example/backend.env.example to secrets/backend.env.
2. Copy secrets.example/postgres-db.example.txt to secrets/postgres-db.txt.
3. Copy secrets.example/postgres-superuser.example.txt to secrets/postgres-superuser.txt.
4. Copy secrets.example/postgres-password.example.txt to secrets/postgres-password.txt.
5. Replace placeholder values with local secrets.

The secrets/ directory is ignored by git; commit only files under secrets.example/.
