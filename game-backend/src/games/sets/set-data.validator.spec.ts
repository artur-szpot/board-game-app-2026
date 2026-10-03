import { validateSetData } from './set-data.validator';

describe('validateSetData', () => {
  const valid = () => ({
    properties: ['occupation', 'homeTown'],
    items: [
      { name: 'alice', properties: { occupation: 'Engineer', homeTown: '' } },
    ],
  });

  it('accepts named items with declared string properties, including empty values', () => {
    expect(validateSetData(valid())).toEqual([]);
  });

  it.each(['Alice', 'home town', 'home-town', '2people', ''])(
    'rejects invalid property and item identifiers: %s',
    (name) => {
      expect(
        validateSetData({
          properties: [name],
          items: [{ name, properties: { [name]: '' } }],
        }),
      ).toEqual([
        'data.properties[0] must be camelCase',
        'data.items[0].name must be camelCase',
      ]);
    },
  );

  it('requires unique property and item names', () => {
    const data = valid();
    data.properties.push('occupation');
    data.items.push(data.items[0]);
    expect(validateSetData(data)).toEqual(
      expect.arrayContaining([
        'data.properties must be unique',
        'data.items[1].name "alice" is not unique',
      ]),
    );
  });

  it('requires exactly the declared keys and string values', () => {
    expect(
      validateSetData({
        properties: ['occupation'],
        items: [
          { name: 'alice', properties: {} },
          { name: 'bob', properties: { occupation: '', extra: '' } },
          { name: 'cid', properties: { occupation: 1 } },
          { name: 'dee', properties: [] },
          [],
        ],
      }),
    ).toEqual([
      'data.items[0].properties must have exactly the declared keys',
      'data.items[1].properties must have exactly the declared keys',
      'data.items[2].properties values must be strings',
      'data.items[3].properties must be an object',
      'data.items[4] must be an object',
    ]);
  });

  it('requires non-empty properties and items', () => {
    expect(validateSetData({ properties: [], items: [] })).toEqual([
      'data.properties must be a non-empty array',
      'data.items must be a non-empty array',
    ]);
    expect(validateSetData(null)).toEqual(['data must be an object']);
  });

  it('rejects the old integer/label payload', () => {
    expect(
      validateSetData({ items: [{ value: 1, label: ['helper.card'] }] }),
    ).toEqual([
      'data.properties must be a non-empty array',
      'data.items[0].name must be camelCase',
      'data.items[0].properties must be an object',
    ]);
  });
});
