import { Transform } from 'class-transformer';

/**
 * Serializes Date/string values to ISO-8601 (UTC) for API responses.
 */
export function ToIsoDateString(): PropertyDecorator {
  return Transform(
    ({ value }) => (value ? new Date(value as string).toISOString() : null),
    { toClassOnly: true },
  );
}
