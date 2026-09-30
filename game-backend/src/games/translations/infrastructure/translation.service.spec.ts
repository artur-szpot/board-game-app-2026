import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  const repository = { getTranslations: jest.fn() };
  const service = new TranslationService(repository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns found translations and lists missing keys', async () => {
    repository.getTranslations.mockResolvedValue([
      { label: 'helper.general.firstPlayer', value: 'Pierwszy gracz' },
    ]);

    await expect(
      service.lookup({
        keys: [
          'helper.general.firstPlayer',
          'helper.general.firstPlayer',
          'helper.missing',
        ],
        language: 'pl',
      }),
    ).resolves.toEqual({
      translations: { 'helper.general.firstPlayer': 'Pierwszy gracz' },
      missing: ['helper.missing'],
    });
    expect(repository.getTranslations).toHaveBeenCalledWith(
      ['helper.general.firstPlayer', 'helper.missing'],
      'pl',
      'en',
    );
  });
});
