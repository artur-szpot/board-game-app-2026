# 10 Implement frame stack navigation state

## Description
Implement the frontend frame stack and navigation callback handling for the app.

## Acceptance criteria
- Frame stack state exists in frontend state management.
- `OPEN_FRAME` and `CLOSE_FRAME` actions are supported.
- `BACK`, `CONFIRM`, and `SHUFFLE` behaviors are implemented.
- Frame callback metadata is persisted in the stack entry for transitions.
- Behavior follows `plan/output/frame_action_spec.md`.

## Notes
This is foundational for screen-to-screen navigation.
