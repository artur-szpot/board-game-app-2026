import { validate } from 'class-validator';
import { CreateSetDto } from './create-set.dto';
import { UpdateSetDto } from './update-set.dto';

describe('Set DTO naming', () => {
  it.each(['camelCase', 'player2', 'alice'])('accepts %s', async (name) => {
    expect(
      await validate(Object.assign(new CreateSetDto(), { name, data: {} })),
    ).toEqual([]);
    expect(await validate(Object.assign(new UpdateSetDto(), { name }))).toEqual(
      [],
    );
  });
  it.each(['Alice', '', 'with space', 'special!', '2first'])(
    'rejects %s',
    async (name) => {
      expect(
        await validate(Object.assign(new CreateSetDto(), { name, data: {} })),
      ).not.toEqual([]);
      expect(
        await validate(Object.assign(new UpdateSetDto(), { name })),
      ).not.toEqual([]);
    },
  );
});
