import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsValidKanbanSettings(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isValidKanbanSettings',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (value === null || value === undefined) {
            return true;
          }

          if (typeof value !== 'object' || Array.isArray(value)) {
            return false;
          }

          const entries = Object.entries(value as Record<string, unknown>);

          if (entries.length === 0) {
            return true;
          }

          return entries.every(([key, limit]) => {
            const trimmedKey = key.trim();

            if (trimmedKey.length === 0 || trimmedKey.length > 50) {
              return false;
            }

            if (typeof limit !== 'number' || !Number.isInteger(limit)) {
              return false;
            }

            return limit >= 1;
          });
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must be null or an object of { statusName: positiveInteger } with non-empty status names`;
        },
      },
    });
  };
}
