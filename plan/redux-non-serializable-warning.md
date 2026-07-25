# Redux Non-Serializable Warning

## Context
During frontend tests, Redux Toolkit emits warnings like:
- A non-serializable value was detected in state
- Path: frameStack.stack.0.callbackReceiver

## Meaning
A function is being stored in Redux state (`callbackReceiver`), which violates Redux serializability expectations.

## Is it only about tests?
No. Tests expose it because they execute reducer/action paths, but the same warning can appear in normal development runtime.

## Risk level
Usually not an immediate runtime failure, but it can degrade:
- Redux DevTools reliability (time travel/replay)
- state persistence/rehydration safety
- debugging confidence

## Difficulty to fix
- Quick suppression (ignore path in serializable check): low effort
- Proper fix (remove callbacks from Redux state and keep only serializable data): low to medium effort

Estimated effort:
- suppression: 10-20 minutes
- proper refactor for one feature area: 1-3 hours (depends on callback usage spread)

## Current decision
No action for now.
