import { readFile } from 'node:fs/promises';
import { Pool, PoolClient } from 'pg';

jest.unmock('pg');

const runDbTests = process.env.RUN_DB_INTEGRATION === '1';
const describeDb = runDbTests ? describe : describe.skip;

describeDb('DB cycle-prevention triggers', () => {
  let pool: Pool;
  let client: PoolClient;
  let ownerScopedTables: Set<string>;

  const dbConfig = {
    host: process.env.DATABASE_HOST ?? '127.0.0.1',
    port: Number.parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  };

  const makeId = (prefix: string) =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const expectQueryToThrow = async (
    query: () => Promise<unknown>,
    message: string,
  ) => {
    await client.query('SAVEPOINT expected_error');
    try {
      await expect(query()).rejects.toThrow(message);
    } finally {
      await client.query('ROLLBACK TO SAVEPOINT expected_error');
      await client.query('RELEASE SAVEPOINT expected_error');
    }
  };

  beforeAll(async () => {
    if (!dbConfig.database || !dbConfig.user || !dbConfig.password) {
      throw new Error(
        'Missing DB env vars. Set DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD (and optionally DATABASE_HOST, DATABASE_PORT).',
      );
    }

    pool = new Pool(dbConfig);
    const triggerSql = await readFile(
      process.env.CYCLE_TRIGGER_SQL_PATH ??
        '../db/init/016-install-cycle-triggers.sql',
      'utf8',
    );
    await pool.query(triggerSql);
    const ownerColumns = await pool.query<{ table_name: string }>(
      `SELECT table_name
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND column_name = 'owner_id'
         AND table_name = ANY($1::TEXT[])`,
      [['games', 'locations', 'tags']],
    );
    ownerScopedTables = new Set(
      ownerColumns.rows.map(({ table_name }) => table_name),
    );
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

    const locationOwnerColumn = ownerScopedTables.has('locations')
      ? 'owner_id, '
      : '';
    const locationOwnerValue = ownerScopedTables.has('locations')
      ? "'SYSTEM', "
      : '';

    await client.query(
      `INSERT INTO locations (id, ${locationOwnerColumn}name, parent_id, path, path_ids)
       VALUES ($1, ${locationOwnerValue}$2, NULL, ARRAY[$2]::TEXT[], ARRAY[]::VARCHAR(40)[])`,
      [idA, `Location A ${idA}`],
    );

    await expectQueryToThrow(
      () =>
        client.query('UPDATE locations SET parent_id = $2 WHERE id = $1', [
          idA,
          idA,
        ]),
      'Location cannot be its own parent',
    );

    await client.query(
      `INSERT INTO locations (id, ${locationOwnerColumn}name, parent_id, path, path_ids)
       VALUES ($1, ${locationOwnerValue}$2, $3, ARRAY[$2]::TEXT[], ARRAY[$3]::VARCHAR(40)[])`,
      [idB, `Location B ${idB}`, idA],
    );

    await expectQueryToThrow(
      () =>
        client.query('UPDATE locations SET parent_id = $2 WHERE id = $1', [
          idA,
          idB,
        ]),
      'Location parent relationship would create a cycle',
    );
  });

  it('rejects self-parent and cycles in tags', async () => {
    const idA = makeId('tag-a');
    const idB = makeId('tag-b');

    const tagOwnerColumn = ownerScopedTables.has('tags') ? 'owner_id, ' : '';
    const tagOwnerValue = ownerScopedTables.has('tags') ? "'SYSTEM', " : '';

    await client.query(
      `INSERT INTO tags (id, ${tagOwnerColumn}name, parent_id) VALUES ($1, ${tagOwnerValue}$2, NULL)`,
      [idA, `Tag A ${idA}`],
    );

    await expectQueryToThrow(
      () =>
        client.query('UPDATE tags SET parent_id = $2 WHERE id = $1', [
          idA,
          idA,
        ]),
      'Tag cannot be its own parent',
    );

    await client.query(
      `INSERT INTO tags (id, ${tagOwnerColumn}name, parent_id) VALUES ($1, ${tagOwnerValue}$2, $3)`,
      [idB, `Tag B ${idB}`, idA],
    );

    await expectQueryToThrow(
      () =>
        client.query('UPDATE tags SET parent_id = $2 WHERE id = $1', [
          idA,
          idB,
        ]),
      'Tag parent relationship would create a cycle',
    );
  });

  it('rejects self-link and graph cycles in game_game_locations', async () => {
    const gameA = makeId('game-a');
    const gameB = makeId('game-b');
    const gameC = makeId('game-c');

    const gameOwnerColumn = ownerScopedTables.has('games') ? 'owner_id, ' : '';
    const gameOwnerValue = ownerScopedTables.has('games') ? "'SYSTEM', " : '';

    await client.query(
      `INSERT INTO games (id, ${gameOwnerColumn}name, length, min_players, max_players)
       VALUES ($1, ${gameOwnerValue}$2, 'SHORT', 1, 4), ($3, ${gameOwnerValue}$4, 'SHORT', 1, 4), ($5, ${gameOwnerValue}$6, 'SHORT', 1, 4)`,
      [
        gameA,
        `Game A ${gameA}`,
        gameB,
        `Game B ${gameB}`,
        gameC,
        `Game C ${gameC}`,
      ],
    );

    await expectQueryToThrow(
      () =>
        client.query(
          'INSERT INTO game_game_locations (game_id, location_id) VALUES ($1, $2)',
          [gameA, gameA],
        ),
      'Game cannot reference itself as a location',
    );

    await client.query(
      'INSERT INTO game_game_locations (game_id, location_id) VALUES ($1, $2), ($2, $3)',
      [gameA, gameB, gameC],
    );

    await expectQueryToThrow(
      () =>
        client.query(
          'INSERT INTO game_game_locations (game_id, location_id) VALUES ($1, $2)',
          [gameC, gameA],
        ),
      'Game location relationship would create a cycle',
    );
  });
});
