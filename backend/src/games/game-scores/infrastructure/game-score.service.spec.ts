import { GameScoreService } from './game-score.service';

describe('GameScoreService', () => {
  it('creates the service', () => {
    expect(new GameScoreService({} as never)).toBeInstanceOf(GameScoreService);
  });
});
