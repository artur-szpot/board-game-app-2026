BEGIN;

INSERT INTO tags (id, owner_id, private, name, description, parent_id)
VALUES
	('test-tag-01', 'SYSTEM', false, 'Test Tag 01', 'Family-friendly board game tag.', NULL),
	('test-tag-02', 'SYSTEM', false, 'Test Tag 02', 'Light strategy tag for test data.', NULL),
	('test-tag-03', 'SYSTEM', false, 'Test Tag 03', 'Cooperative game tag for test data.', NULL),
	('test-tag-04', 'SYSTEM', false, 'Test Tag 04', 'Abstract game tag for test data.', NULL),
	('test-tag-05', 'SYSTEM', false, 'Test Tag 05', 'Party game tag for test data.', NULL),
	('test-tag-06', 'SYSTEM', false, 'Test Tag 06', 'Deck-building game tag for test data.', NULL),
	('test-tag-07', 'SYSTEM', false, 'Test Tag 07', 'Worker placement tag for test data.', NULL),
	('test-tag-08', 'SYSTEM', false, 'Test Tag 08', 'Area control tag for test data.', NULL),
	('test-tag-09', 'SYSTEM', false, 'Test Tag 09', 'Engine-building tag for test data.', NULL),
	('test-tag-10', 'SYSTEM', false, 'Test Tag 10', 'Solo-friendly game tag for test data.', NULL)
ON CONFLICT (id)
DO UPDATE
SET
	owner_id = EXCLUDED.owner_id,
	private = EXCLUDED.private,
	name = EXCLUDED.name,
	description = EXCLUDED.description,
	parent_id = EXCLUDED.parent_id,
	updated_on = CURRENT_TIMESTAMP;

INSERT INTO locations (id, owner_id, private, name, description, parent_id, path, path_ids)
VALUES
	('test-location-01', '123-abc', true, 'Test Location 01', 'Main shelf A for test games.', NULL, ARRAY['Test Location 02', 'Test Location 01']::TEXT[], ARRAY['test-location-02']::VARCHAR(40)[]),
	('test-location-02', '123-abc', true, 'Test Location 02', 'Main shelf B for test games.', NULL, ARRAY['Test Location 02']::TEXT[], ARRAY[]::VARCHAR(40)[]),
	('test-location-03', '123-abc', true, 'Test Location 03', 'Closet top section for test games.', NULL, ARRAY['Test Location 03']::TEXT[], ARRAY[]::VARCHAR(40)[]),
	('test-location-04', '123-abc', true, 'Test Location 04', 'Closet middle section for test games.', NULL, ARRAY['Test Location 04']::TEXT[], ARRAY[]::VARCHAR(40)[]),
	('test-location-05', '123-abc', true, 'Test Location 05', 'Closet bottom section for test games.', NULL, ARRAY['Test Location 05']::TEXT[], ARRAY[]::VARCHAR(40)[]),
	('test-location-06', '123-abc', true, 'Test Location 06', 'Living room cabinet left side.', NULL, ARRAY['Test Location 06']::TEXT[], ARRAY[]::VARCHAR(40)[]),
	('test-location-07', '123-abc', true, 'Test Location 07', 'Living room cabinet right side.', NULL, ARRAY['Test Location 07']::TEXT[], ARRAY[]::VARCHAR(40)[]),
	('test-location-08', '123-abc', true, 'Test Location 08', 'Travel bag storage location.', NULL, ARRAY['Test Location 08']::TEXT[], ARRAY[]::VARCHAR(40)[]),
	('test-location-09', '123-abc', true, 'Test Location 09', 'Guest room shelf for overflow.', NULL, ARRAY['Test Location 09']::TEXT[], ARRAY[]::VARCHAR(40)[]),
	('test-location-10', '123-abc', true, 'Test Location 10', 'Office shelf for prototypes.', NULL, ARRAY['Test Location 10']::TEXT[], ARRAY[]::VARCHAR(40)[])
ON CONFLICT (id)
DO UPDATE
SET
	owner_id = EXCLUDED.owner_id,
	private = EXCLUDED.private,
	name = EXCLUDED.name,
	description = EXCLUDED.description,
	parent_id = EXCLUDED.parent_id,
	path = EXCLUDED.path,
	path_ids = EXCLUDED.path_ids,
	updated_on = CURRENT_TIMESTAMP;

INSERT INTO games (id, owner_id, private, name, description, length, min_players, max_players)
VALUES
	('test-game-01', '123-abc', true, 'Test Game 01', 'Small-box card drafting game for tests.', 'FILLER', 2, 5),
	('test-game-02', '123-abc', true, 'Test Game 02', 'Fast tactical skirmish game for tests.', 'SHORT', 2, 4),
	('test-game-03', '123-abc', true, 'Test Game 03', 'Resource management game for tests.', 'MEDIUM', 3, 6),
	('test-game-04', '123-abc', true, 'Test Game 04', 'Epic campaign game for tests.', 'LONG', 4, 8),
	('test-game-05', '123-abc', true, 'Test Game 05', 'Push-your-luck dice game for tests.', 'FILLER', 2, 6),
	('test-game-06', '123-abc', true, 'Test Game 06', 'Two-player duel game for tests.', 'SHORT', 2, 2),
	('test-game-07', '123-abc', true, 'Test Game 07', 'Economic strategy game for tests.', 'MEDIUM', 2, 5),
	('test-game-08', '123-abc', true, 'Test Game 08', 'Civilization game for tests.', 'LONG', 3, 6),
	('test-game-09', '123-abc', true, 'Test Game 09', 'Tile-laying puzzle game for tests.', 'SHORT', 1, 4),
	('test-game-10', '123-abc', true, 'Test Game 10', 'Narrative adventure game for tests.', 'MEDIUM', 2, 6)
ON CONFLICT (id)
DO UPDATE
SET
	owner_id = EXCLUDED.owner_id,
	private = EXCLUDED.private,
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

INSERT INTO game_game_locations (game_id, location_id, note)
VALUES
	('test-game-10', 'test-game-01', 'Stored in the same crate as Test Game 01.'),
	('test-game-08', 'test-game-03', 'Kept together with Test Game 03 expansion pieces.')
ON CONFLICT (game_id, location_id)
DO UPDATE
SET
	note = EXCLUDED.note,
	updated_on = CURRENT_TIMESTAMP;

COMMIT;
