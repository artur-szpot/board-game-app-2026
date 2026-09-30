import { validateSetData } from './set-data.validator';

describe('validateSetData', () => {
  it('accepts items with unique integer values and label tuples', () => {
    expect(
      validateSetData({
        items: [
          { value: 1, label: ['a.b'] },
          { value: 2, label: ['a.c', { n: 2 }] },
        ],
      }),
    ).toEqual([]);
  });

  it('reports shape problems per item', () => {
    expect(
      validateSetData({
        items: [
          { value: 1, label: ['a'] },
          { value: 1, label: 'plain' },
          { value: 1.5, label: [''] },
        ],
      }),
    ).toEqual([
      'data.items[1].value 1 is not unique',
      'data.items[1].label must be a label tuple',
      'data.items[2].value must be an integer',
      'data.items[2].label must be a label tuple',
    ]);
  });

  it('requires a non-empty items array', () => {
    expect(validateSetData({ items: [] })).toEqual([
      'data.items must be a non-empty array',
    ]);
    expect(validateSetData(null)).toEqual(['data must be an object']);
  });
});
