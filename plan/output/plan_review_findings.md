# Plan Review Findings

## Summary
The plan under `plan/` captures a useful high-level structure for template-driven screens, entity screens, relational tables, and a basic window stack model. However, it is currently incomplete in several key areas that are important for implementation, UX, and data integrity.

---

## 1. Screen Template Completeness

### What is present
- Form, Search, and Options template types
- Basic field config for text, dropdown, search, and options
- Some behaviors like `CHOSE_ONE`, `CHOSE_MIN_MAX`, `ACTION`, and `anyNumber`

### Missing considerations
- Validation rules and error messages
  - required fields, min/max lengths, numeric ranges, custom validation logic
  - form-level validation and cross-field validation
  RESPONSE: considerations for the future. For MVP, it will be enough to have simple unchecked inputs.
  RESPONSE: configs to be created from builders, not written directly, for now we presume data is always of the right shape, will add safety afterwards.
- Save / cancel semantics for forms
  - how does a user abort input?
  - are there confirmation/dirty-state warnings?
  RESPONSE: every screen's UI will have three buttons:
    BACK (close top frame and return undefined result for callbacks)
    SHUFFLE (different behavior in different screens, may be disabled/replaced with something else in some screens)
    CONFIRM (close top frame and return result for callbacks, button will be disabled until screen's requirements (like number of chosen items) are met; may also be disabled/hidden on screens where it is useless (e.g. VIEW_GAME))
- Loading state and async behavior
  - how are search result loads shown?
  - what happens while an API query is pending?
  RESPONSE: when search text is changed and sent (enter or icon click), refetch from backend (URL and filters based on data type, which has to be supplied)
- No-results and empty-state UX
  - how should `SEARCH` and `OPTIONS` behave when nothing exists?
  RESPONSE: if OPTIONS evaluate to empty list (e.g. too restrictire blacklist), show "No available choices", the navigation will allow quitting the screen; for SEARCH show "No results found", there is logic to dictate whether enough items have been selected and CONFIRM can be chosen.
- Field visibility and dependent fields
  - support for conditionally showing fields based on other values
  RESPONSE: not needed for now, except empty lists mapping to no OPTION buttons, which is covered automatically
- Field metadata and UI hints
  - placeholders, helper text, icons, multiline text, auto-complete
  RESPONSE: far future considerations
- Error handling for callbacks/actions
  - what happens if an action fails or returns invalid data?
  RESPONSE: for now, just log and throw, we'll add error handling once basic strtucture is in place
- Data typing and normalization for dropdown/search results
  - `dataType` is defined, but there is no schema for what a result item contains
  RESPONSE: backend needs full CRUD support for each of these data types. Implementation plan needs to cover adding repositories, services, controllers and modules that allow to GET, POST, PUT, DELETE and GET with filters (search)
- Multi-type search support is noted only in comments
  - define how `SEARCH` handles mixed `dataType` arrays explicitly
  RESPONSE: if more than one type is specified, the SEARCH screen will have to perform a separate search per data type and display combined results from both. Details to be added later.
- Reusable field templates and shared config
  - no mention of shared field definitions or component reuse
  RESPONSE: UI design not covered, for MVP needs to be very minimal (OPTIONS rendering as <p> or <button>, form using typical <input>s, search results shown as <p>s with GET details listed). This will be made pretty in next big ticket.

---

## 2. Screen Definitions and Navigation

### What is present
- `ADD_GAME`, `ADD_LOCATION`, `ADD_TAG`, list screens, and a `MAIN_MENU`
- `VIEW_GAME` is sketched as an options-driven detail page
- Some nested open-frame callback structure

### Missing considerations
- Several important screens are referenced but not defined
  - `VIEW_LOCATION`, `VIEW_TAG`, `SCOREPAD`, `HELPER`
  RESPONSE: `VIEW_LOCATION` and `VIEW_TAG` are defined. SCOREPAD and HELPER will be more difficult, for now they can just show a <p>This will be a helper/scorepad</p>
- Edit flows are implied but not specified
  - `ADD_GAME` says `editId` works, but there is no explicit `EDIT_GAME` behavior or UI differences
  RESPONSE: the difference is that if editId is provided, the screen will fetch the relevant data and set it in the form. The difference in what happens is driven by screen config, as callback will have { action: UPSERT_GAME, payload: <data from the form> }
- Delete and destructive actions are not mentioned
  - deletion of games, locations, tags, scores, helpers, and relations
  RESPONSE: the implementations of Redux actions such as UPSERT_GAME, DELETE_GAME, UPSERT_TAG etc. will need to cover adding/removing relations.
- Back navigation and cancel behavior are absent
  - how does the user return from a frame? how are callbacks canceled?
  RESPONSE: UI described in another response. For callbacks: when Redux processes a CLOSE_FRAME action, it will consider the payload and use it inside the new top frame's callback (conversely, processing an OPEN_FRAME action needs to save the relevant callback in the now-second-form-the-top frame)
- Search result interaction details are missing
  - can items be created directly from search when not found?
  - what about sorting, filtering, and pagination?
  RESPONSE: for now no sorting and pagination. Filtering only works by supplying a single text argument from the input box to the search API, where it will be used to compare against name and description of the relevant data type. More complex logic will be added later.
- No screen for settings, import/export, or app-level preferences
RESPONSE: far future
- No mobile/responsive layout considerations
RESPONSE: far future
- No error page / global error state guidance
RESPONSE: this is MVP, no need for this yet

---

## 3. Table / DB Model Completeness

### What is present
- core entities: games, locations, tags, helpers, scoring schemas
- join tables for many-to-many relationships
- audit field note and some relationship comments

### Missing considerations
- Missing required uniqueness and constraints
  - unique `name` or slug constraints for tags, locations, games? RESPONSE: yes, names need to be unique
  - composite PKs are described, but foreign key and cascade rules are not fully specified RESPONSE: I found one missing foreign key, please advise if more exist. For delete always cascade.
- No explicit `createdOn` / `updatedOn` field definitions per table
  - audit fields are mentioned but not shown in each table schema
  RESPONSE: every table should have these two fields, to be set when data operations happen
- No soft delete or active-state strategy
  - how are removed items handled? `deletedAt`? `archived`?
  RESPONSE: for MVP, hard delete is enough
- Score recording is insufficient
  - `game_scores` only tracks schema usage and date, not actual player results or scores
  RESPONSE: added the column
  - no table for score entries / scoreboard rows / player names
  RESPONSE: these will be kept in a JSON object, as above
- No play session or game history table
  - this feels important for a board game app and is absent
  RESPONSE: this is what game_scores is for: what was played, when, and what were the scores (players result from the scores, since they are kept per player)
- `helpers` model is too generic
  - `logic JSON` is vague, and the relationship to `game_helpers` is not fully normalized
  - `helper_args` is open-ended with no schema guidance
  RESPONSE: helpers will be fleshed out much later, for MVP very generic is enough.
- `locations.parent_id` and `tags.parent_id` permit nesting, but there is no plan for cycle prevention or search semantics across hierarchies
RESPONSE: agreed, search needs to accept a blacklist parameter to prevent cycling. Similarly, backend API needs to reject an operation with 400 if it is asked to set self as parent.
- `game_scoring_schemas` is redundant with `game_scores.schema` if schema is an ID; the relationship should be clarified
RESPONSE: scoring schemas will have to be immutable for the end user. This way, the relation as dictated by FK game_scores.schema will point to a record in game_scoring_schemas which contains a schema JSON which will match the shape of data in game_scores.scores
- No indexes or performance guidance for search-heavy tables
RESPONSE: propose sensible indexes when fleshing out the implementation plan.
- No user / auth model at all, even for personal ownership or future multi-user support
RESPONSE: basic auth is in place already, this is a plan for adding a more specialized functionality to it. No multi-user interactions expected, this will be a personal-use app.
- No metadata for ordering, display priority, or labels
RESPONSE: future consideration

---

## 4. Window Stack and App State

### What is present
- stack of open windows with top-frame rendering
- bottom frame is always `MAIN_MENU`
- frame open/close result passing and callback handling
- initial state opens `MAIN_MENU` + `LIST_GAMES`

### Missing considerations
- Lifecycle semantics for windows are underspecified
  - how are nested callbacks mapped to return values exactly?
  RESPONSE: responded above about Redux handling OPEN_FRAME and CLOSE_FRAME actions.
  - how is `close` payload distinguished from successful return data in shared code?
  RESPONSE: close will have undefined data
- No mention of modal vs full-screen frame behavior
  - are all frames equal, or are some dialogs/modal overlays?
  RESPONSE: for now, all frames are fullscreen, no modals
- No explicit state structure for pending return targets, params, and callback contexts
- No mention of duplicate/opened frame prevention
  - what if the same frame is opened twice with different context?
  RESPONSE: if it makes sense, why not? The stack order will dictate how a frame will use the data from the next frame over.
- No support for deep-linking or restoring state after reload
RESPONSE: all data to be persisted in the database. It is expected that refreshing the page or navigating away from it will lose the state; upon return user will have to find the game they're interested in again. Saving uncompleted form data or preventing navigation away from a dirty form is a nice-to-have future consideration.
- No error/retry handling for window actions that rely on backend data
RESPONSE: this will of course have to be considered during implementation.
- No event or analytics hooks for navigation flow
RESPONSE: no analytics needed in MVP
- No concurrency or async transition considerations
  - if a search result arrives after the window closes, how is that handled?
  RESPONSE: when stack changes, so does the rendered frame. If an API response doesn't arrive until after a frame changed, the component will have been unloaded and should not perform any logic on the response.

---

## 5. Suggested Missing Considerations

### Implementation and architecture
- define a minimal API contract or DTO shape to align frontend screens with backend entities
RESPONSE: yes, needs to be part of the initial design and result directly from table structures
- define UI state vs domain state clearly, especially for forms and search results
RESPONSE: form state will need to be a part of the SEARCH frame's state so that a user can navigate away from the form (e.g. open another DROPDOWN), then return to their dirty data
- add explicit validation and error strategy at screen/component level
RESPONSE: future consideration, I think
- define whether the app uses Redux Toolkit, Zustand, or another state container; screen plan should reflect that
RESPONSE: Redux, since again: this will extend the existing app living in sister directores (backend, frontend)

### UX and edge cases
- empty states, loading states, and error states for search and form screens
RESPONSE: need to be implemented
- confirm dialogs for destructive changes
RESPONSE: need to be implemented
- unsaved-change warnings for forms
RESPONSE: future consideration
- handling of no-results and create-new flows from search
RESPONSE: covered in other comments
- keyboard navigation and accessibility concerns for options/search UI
RESPONSE: none for MVP

### Data and domain completeness
- actual game play logging and scoring detail tables
RESPONSE: not for MVP
- more explicit modeling for helper behavior and argument validation
RESPONSE: not for MVP
- versioning of scoring schemas and helper definitions
RESPONSE: not for MVP
- unique names and slug constraints for key entities
RESPONSE: agreed in another comment
- explicit handling of nested tag/location taxes and tree traversal
RESPONSE: covered enough for MVP

### Maintenance and extension
- notes on documentation of the template model for future screen authors
RESPONSE: not for MVP
- separation of generic frame definitions from app-specific screen definitions
RESPONSE: not needed, all screens to be generic
- planned extensibility for new entity types and actions
RESPONSE: not for MVP

---

## Recommendation
Create a short follow-up plan that closes these gaps before implementation:
1. define missing screens and actions (`VIEW_LOCATION`, `VIEW_TAG`, `SCOREPAD`, `HELPER`, edit/delete flows)
2. add validation, loading, and error states to screen templates
3. refine the DB model with score details, audit fields, uniqueness, and cascade rules
4. expand window stack semantics for callback mapping, close/back, and deep state restore

These items are the highest-value gaps in the current plan.
