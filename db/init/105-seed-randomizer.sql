BEGIN;

INSERT INTO teams (id, owner_id, private, name)
VALUES
   ('team-abc', 'SYSTEM', false, 'ABC'),
   ('team-123', 'SYSTEM', false, '123')
ON CONFLICT (id)
DO UPDATE
SET
   owner_id = EXCLUDED.owner_id,
   private = EXCLUDED.private,
   name = EXCLUDED.name;

INSERT INTO players (id, owner_id, name)
VALUES
   ('player-abc-a', 'SYSTEM', 'A'),
   ('player-abc-b', 'SYSTEM', 'B'),
   ('player-abc-c', 'SYSTEM', 'C'),
   ('player-abc-d', 'SYSTEM', 'D'),
   ('player-abc-e', 'SYSTEM', 'E'),
   ('player-abc-f', 'SYSTEM', 'F'),
   ('player-abc-g', 'SYSTEM', 'G'),
   ('player-abc-h', 'SYSTEM', 'H'),
   ('player-abc-i', 'SYSTEM', 'I'),
   ('player-abc-j', 'SYSTEM', 'J'),
   ('player-abc-k', 'SYSTEM', 'K'),
   ('player-abc-l', 'SYSTEM', 'L'),
   ('player-abc-m', 'SYSTEM', 'M'),
   ('player-abc-n', 'SYSTEM', 'N'),
   ('player-abc-o', 'SYSTEM', 'O'),
   ('player-abc-p', 'SYSTEM', 'P'),
   ('player-abc-q', 'SYSTEM', 'Q'),
   ('player-abc-r', 'SYSTEM', 'R'),
   ('player-abc-s', 'SYSTEM', 'S'),
   ('player-abc-t', 'SYSTEM', 'T'),
   ('player-abc-u', 'SYSTEM', 'U'),
   ('player-abc-v', 'SYSTEM', 'V'),
   ('player-abc-w', 'SYSTEM', 'W'),
   ('player-abc-x', 'SYSTEM', 'X'),
   ('player-abc-y', 'SYSTEM', 'Y'),
   ('player-abc-z', 'SYSTEM', 'Z'),
   ('player-123-1', 'SYSTEM', '1'),
   ('player-123-2', 'SYSTEM', '2'),
   ('player-123-3', 'SYSTEM', '3'),
   ('player-123-4', 'SYSTEM', '4'),
   ('player-123-5', 'SYSTEM', '5'),
   ('player-123-6', 'SYSTEM', '6'),
   ('player-123-7', 'SYSTEM', '7'),
   ('player-123-8', 'SYSTEM', '8'),
   ('player-123-9', 'SYSTEM', '9'),
   ('player-123-10', 'SYSTEM', '10'),
   ('player-123-11', 'SYSTEM', '11'),
   ('player-123-12', 'SYSTEM', '12')
ON CONFLICT (id)
DO UPDATE
SET
   owner_id = EXCLUDED.owner_id,
   name = EXCLUDED.name;

INSERT INTO team_players (team_id, player_id)
VALUES
   ('team-abc', 'player-abc-a'),
   ('team-abc', 'player-abc-b'),
   ('team-abc', 'player-abc-c'),
   ('team-abc', 'player-abc-d'),
   ('team-abc', 'player-abc-e'),
   ('team-abc', 'player-abc-f'),
   ('team-abc', 'player-abc-g'),
   ('team-abc', 'player-abc-h'),
   ('team-abc', 'player-abc-i'),
   ('team-abc', 'player-abc-j'),
   ('team-abc', 'player-abc-k'),
   ('team-abc', 'player-abc-l'),
   ('team-abc', 'player-abc-m'),
   ('team-abc', 'player-abc-n'),
   ('team-abc', 'player-abc-o'),
   ('team-abc', 'player-abc-p'),
   ('team-abc', 'player-abc-q'),
   ('team-abc', 'player-abc-r'),
   ('team-abc', 'player-abc-s'),
   ('team-abc', 'player-abc-t'),
   ('team-abc', 'player-abc-u'),
   ('team-abc', 'player-abc-v'),
   ('team-abc', 'player-abc-w'),
   ('team-abc', 'player-abc-x'),
   ('team-abc', 'player-abc-y'),
   ('team-abc', 'player-abc-z'),
   ('team-123', 'player-123-1'),
   ('team-123', 'player-123-2'),
   ('team-123', 'player-123-3'),
   ('team-123', 'player-123-4'),
   ('team-123', 'player-123-5'),
   ('team-123', 'player-123-6'),
   ('team-123', 'player-123-7'),
   ('team-123', 'player-123-8'),
   ('team-123', 'player-123-9'),
   ('team-123', 'player-123-10'),
   ('team-123', 'player-123-11'),
   ('team-123', 'player-123-12')
ON CONFLICT (team_id, player_id)
DO NOTHING;

COMMIT;