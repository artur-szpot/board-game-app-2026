# Pool Connection Noise

## Context
In backend unit test runs, logs may show messages like:
- "Error connecting to the database"
- "AggregateError"

Even when this appears, tests can still pass.

## What it means
This is usually startup/log noise from `PostgresConnector` attempting a real `pg.Pool` connection in test context where a DB is not required or not reachable.

## Why tests still pass
Service/repository behavior under test is typically mocked or not dependent on a successful live DB connection, so assertions can pass even though connector startup logs an error.

## Current decision
No action for now.

## Future options (if we decide to address it)
1. Refactor connector to lazy-connect instead of connecting during construction.
2. Mock `pg.Pool` in unit tests.
3. Keep real DB connections only in integration tests.
4. Reduce/mute DB connection logging in test environment (secondary option).
