import { Pool, PoolClient } from 'pg';

const runDbTests = process.env.RUN_DB_INTEGRATION === '1';
const describeDb = runDbTests ? describe : describe.skip;

describeDb('DB cycle-prevention triggers', () => {
  let pool: Pool;
  let client: PoolClient;

  const dbConfig = {
    host: process.env.DATABASE_HOST ?? '127.0.0.1',
    port: Number.parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  };

  const makeId = (prefix: string) =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  beforeAll(async () => {
    if (!dbConfig.database || !dbConfig.user || !dbConfig.password) {
      throw new Error(
        'Missing DB env vars. Set DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD (and optionally DATABASE_HOST, DATABASE_PORT).',
      );
    }

    pool = new Pool(dbConfig);
  });

  beforeEach(async () => {
    client = await pool.connect();
    await client.query('BEGIN');
  });

  afterEach(async () => {
    await client.query('ROLLBACK');
    client.release();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('rejects self-parent and cycles in locations', async () => {
    const idA = makeId('location-a');
    const idB = makeId('location-b');

    await client.query(
      `INSERT INTO locations (id, name, parent_id, path, path_ids)
       VALUES ($1, $2, NULL, ARRAY[$2]::TEXT[], ARRAY[]::VARCHAR(40)[])`,
      [idA, `Location A ${idA}`],
    );

    await expect(
      client.query('UPDATE locations SET parent_id = $2 WHERE id = $1', [
        idA,
        idA,
      ]),
    ).rejects.toThrow('Location cannot be its own parent');

    await client.query(
      `INSERT INTO locations (id, name, parent_id, path, path_ids)
       VALUES ($1, $2, $3, ARRAY[$2]::TEXT[], ARRAY[$3]::VARCHAR(40)[])`,
      [idB, `Location B ${idB}`, idA],
    );

    await expect(
      client.query('UPDATE locations SET parent_id = $2 WHERE id = $1', [
        idA,
        idB,
      ]),
    ).rejects.toThrow('Location parent relationship would create a cycle');
  });

  it('rejects self-parent and cycles in tags', async () => {
    const idA = makeId('tag-a');
    const idB = makeId('tag-b');

    await client.query(
      'INSERT INTO tags (id, name, parent_id) VALUES ($1, $2, NULL)',
      [idA, `Tag A ${idA}`],
    );

    await expect(
      client.query('UPDATE tags SET parent_id = $2 WHERE id = $1', [idA, idA]),
    ).rejects.toThrow('Tag cannot be its own parent');

    await client.query(
      'INSERT INTO tags (id, name, parent_id) VALUES ($1, $2, $3)',
      [idB, `Tag B ${idB}`, idA],
    );

    await expect(
      client.query('UPDATE tags SET parent_id = $2 WHERE id = $1', [idA, idB]),
    ).rejects.toThrow('Tag parent relationship would create a cycle');
  });

  it('rejects self-link and graph cycles in game_game_locations', async () => {
    const gameA = makeId('game-a');
    const gameB = makeId('game-b');
    const gameC = makeId('game-c');

    await client.query(
      `INSERT INTO games (id, name, length, min_players, max_players)
       VALUES ($1, $2, 'SHORT', 1, 4), ($3, $4, 'SHORT', 1, 4), ($5, $6, 'SHORT', 1, 4)`,
      [
        gameA,
        `Game A ${gameA}`,
        gameB,
        `Game B ${gameB}`,
        gameC,
        `Game C ${gameC}`,
      ],
    );

    await expect(
      client.query(
        'INSERT INTO game_game_locations (game_id, location_id) VALUES ($1, $2)',
        [gameA, gameA],
      ),
    ).rejects.toThrow('Game cannot reference itself as a location');

    await client.query(
      'INSERT INTO game_game_locations (game_id, location_id) VALUES ($1, $2), ($2, $3)',
      [gameA, gameB, gameC],
    );

    await expect(
      client.query(
        'INSERT INTO game_game_locations (game_id, location_id) VALUES ($1, $2)',
        [gameC, gameA],
      ),
    ).rejects.toThrow('Game location relationship would create a cycle');
  });
});
