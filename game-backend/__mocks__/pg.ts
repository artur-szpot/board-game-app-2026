/* eslint-disable @typescript-eslint/no-unused-vars */

type QueryResult<T> = { rows: T[] };

class MockClient {
  public async query<T>(
    _query: string,
    _args?: any[],
  ): Promise<QueryResult<T>> {
    return { rows: [] };
  }

  public release(): void {
    // no-op for unit tests
  }
}

export class Pool {
  public connect(
    callback?: (err: any, client: MockClient, release: () => void) => void,
  ): Promise<MockClient> | void {
    if (callback) {
      // Unit tests do not need startup handshake behavior.
      return;
    }
    const client = new MockClient();
    return Promise.resolve(client);
  }
}
