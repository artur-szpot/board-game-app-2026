GAME_LENGTH (enum)
    FILLER
    SHORT
    MEDIUM
    LONG

General note: all tables should have audit fields (createdOn, updatedOn). Skipping updatedBy since all data is personal, no admins.

games
    id VARCHAR NOT NULL PK
    name VARCHAR NOT NULL
    description VARCHAR
    length GAME_LENGTH

locations
    id VARCHAR NOT NULL PK
    name VARCHAR NOT NULL
    description VARCHAR
    parent_id VARCHAR FK(locations, id) -- locations can be nested, eg. box A on shelf B in case C
    is_game_id BOOLEAN DEFAULT FALSE -- if true, location name is treated as game ID and understood as the box for this game. Sidenote to capture: fake boxes (not containing the game itself) need to have this FALSE and a name describing it

game_locations (composite PK)
    game_id VARCHAR NOT NULL FK(games, id)
    location_id VARCHAR NOT NULL FK(locations, id)
    note VARCHAR -- e.g. "this box has cards"

tags
    id VARCHAR NOT NULL PK
    name VARCHAR NOT NULL
    parent_id VARCHAR FK(tags, id) -- tags can be nested to allow granular searches

game_tags (composite PK)
    game_id VARCHAR NOT NULL FK(games, id)
    tag_id VARCHAR NOT NULL FK(tags, id)

game_scores
    game_id VARCHAR NOT NULL FK(games, id)
    played_on TIMESTAMP
    schema VARCHAR NOT NULL FK(scoring_schemas, id)
    scores JSON -- per-players list of values as per the linked schema

scoring_schemas
    id VARCHAR NOT NULL PK
    schema JSON NOT NULL
    name VARCHAR NOT NULL

game_scoring_schemas (composite PK)
    game_id VARCHAR NOT NULL FK(games, id)
    schema_id VARCHAR NOT NULL

helpers
    id VARCHAR NOT NULL PK
    logic JSON NOT NULL -- this will later be transformed into "apps" to randomize setups, throw dice, decide first players etc.
    name VARCHAR NOT NULL

game_helpers (composite PK)
    game_id VARCHAR NOT NULL FK(games, id)
    helper_id VARCHAR NOT NULL FK(helpers, id)
    helper_args JSON -- can configure a generic helper, e.g. min and max total players