import { plainToInstance } from 'class-transformer';
import { ToIsoDateString } from './iso-date.transform';

class TestDto {
  @ToIsoDateString()
  date!: string;
}

describe('ToIsoDateString', () => {
  it('serializes Date values to ISO-8601 UTC strings', () => {
    const input = new Date('2026-03-31T00:00:00.000Z');
    const result = plainToInstance(TestDto, { date: input }, {
      enableImplicitConversion: true,
    });
    expect(result.date).toBe('2026-03-31T00:00:00.000Z');
    expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
  });

  it('returns null for empty values', () => {
    const result = plainToInstance(TestDto, { date: null });
    expect(result.date).toBeNull();
  });
});
