BEGIN;

INSERT INTO tags (id, name, description, parent_id)
VALUES
	('test-tag-01', 'Test Tag 01', 'Family-friendly board game tag.', NULL),
	('test-tag-02', 'Test Tag 02', 'Light strategy tag for test data.', NULL),
	('test-tag-03', 'Test Tag 03', 'Cooperative game tag for test data.', NULL),
	('test-tag-04', 'Test Tag 04', 'Abstract game tag for test data.', NULL),
	('test-tag-05', 'Test Tag 05', 'Party game tag for test data.', NULL),
	('test-tag-06', 'Test Tag 06', 'Deck-building game tag for test data.', NULL),
	('test-tag-07', 'Test Tag 07', 'Worker placement tag for test data.', NULL),
	('test-tag-08', 'Test Tag 08', 'Area control tag for test data.', NULL),
	('test-tag-09', 'Test Tag 09', 'Engine-building tag for test data.', NULL),
	('test-tag-10', 'Test Tag 10', 'Solo-friendly game tag for test data.', NULL)
ON CONFLICT (id)
DO UPDATE
SET
	name = EXCLUDED.name,
	description = EXCLUDED.description,
	parent_id = EXCLUDED.parent_id,
	updated_on = CURRENT_TIMESTAMP;

INSERT INTO locations (id, name, description, parent_id, is_game_id)
VALUES
	('test-location-01', 'Test Location 01', 'Main shelf A for test games.', NULL, false),
	('test-location-02', 'Test Location 02', 'Main shelf B for test games.', NULL, false),
	('test-location-03', 'Test Location 03', 'Closet top section for test games.', NULL, false),
	('test-location-04', 'Test Location 04', 'Closet middle section for test games.', NULL, false),
	('test-location-05', 'Test Location 05', 'Closet bottom section for test games.', NULL, false),
	('test-location-06', 'Test Location 06', 'Living room cabinet left side.', NULL, false),
	('test-location-07', 'Test Location 07', 'Living room cabinet right side.', NULL, false),
	('test-location-08', 'Test Location 08', 'Travel bag storage location.', NULL, false),
	('test-location-09', 'Test Location 09', 'Guest room shelf for overflow.', NULL, false),
	('test-location-10', 'Test Location 10', 'Office shelf for prototypes.', NULL, false)
ON CONFLICT (id)
DO UPDATE
SET
	name = EXCLUDED.name,
	description = EXCLUDED.description,
	parent_id = EXCLUDED.parent_id,
	is_game_id = EXCLUDED.is_game_id,
	updated_on = CURRENT_TIMESTAMP;

INSERT INTO games (id, name, description, length)
VALUES
	('test-game-01', 'Test Game 01', 'Small-box card drafting game for tests.', 'FILLER'),
	('test-game-02', 'Test Game 02', 'Fast tactical skirmish game for tests.', 'SHORT'),
	('test-game-03', 'Test Game 03', 'Resource management game for tests.', 'MEDIUM'),
	('test-game-04', 'Test Game 04', 'Epic campaign game for tests.', 'LONG'),
	('test-game-05', 'Test Game 05', 'Push-your-luck dice game for tests.', 'FILLER'),
	('test-game-06', 'Test Game 06', 'Two-player duel game for tests.', 'SHORT'),
	('test-game-07', 'Test Game 07', 'Economic strategy game for tests.', 'MEDIUM'),
	('test-game-08', 'Test Game 08', 'Civilization game for tests.', 'LONG'),
	('test-game-09', 'Test Game 09', 'Tile-laying puzzle game for tests.', 'SHORT'),
	('test-game-10', 'Test Game 10', 'Narrative adventure game for tests.', 'MEDIUM')
ON CONFLICT (id)
DO UPDATE
SET
	name = EXCLUDED.name,
	description = EXCLUDED.description,
	length = EXCLUDED.length,
	updated_on = CURRENT_TIMESTAMP;

INSERT INTO game_tags (game_id, tag_id)
VALUES
	('test-game-01', 'test-tag-01'),
	('test-game-01', 'test-tag-02'),
	('test-game-02', 'test-tag-02'),
	('test-game-02', 'test-tag-05'),
	('test-game-03', 'test-tag-03'),
	('test-game-03', 'test-tag-07'),
	('test-game-04', 'test-tag-04'),
	('test-game-04', 'test-tag-09'),
	('test-game-05', 'test-tag-05'),
	('test-game-05', 'test-tag-10'),
	('test-game-06', 'test-tag-01'),
	('test-game-06', 'test-tag-06'),
	('test-game-07', 'test-tag-07'),
	('test-game-07', 'test-tag-09'),
	('test-game-08', 'test-tag-04'),
	('test-game-08', 'test-tag-08'),
	('test-game-09', 'test-tag-03'),
	('test-game-09', 'test-tag-08'),
	('test-game-10', 'test-tag-06'),
	('test-game-10', 'test-tag-10')
ON CONFLICT (game_id, tag_id)
DO UPDATE
SET
	updated_on = CURRENT_TIMESTAMP;

INSERT INTO game_locations (game_id, location_id, note)
VALUES
	('test-game-01', 'test-location-01', 'Primary storage slot for quick access.'),
	('test-game-02', 'test-location-02', 'Stored next to other short games.'),
	('test-game-03', 'test-location-03', 'Top shelf near strategy titles.'),
	('test-game-04', 'test-location-04', 'Middle shelf due to box size.'),
	('test-game-05', 'test-location-05', 'Bottom shelf travel-friendly section.'),
	('test-game-06', 'test-location-06', 'Cabinet left section for duel games.'),
	('test-game-07', 'test-location-07', 'Cabinet right section for medium games.'),
	('test-game-08', 'test-location-08', 'Packed in travel bag backup slot.'),
	('test-game-09', 'test-location-09', 'Guest room overflow game shelf.'),
	('test-game-10', 'test-location-10', 'Office prototype and narrative shelf.')
ON CONFLICT (game_id, location_id)
DO UPDATE
SET
	note = EXCLUDED.note,
	updated_on = CURRENT_TIMESTAMP;

COMMIT;
