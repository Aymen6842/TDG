import { PipeTransform } from '@nestjs/common';

export class TransformStringToArray implements PipeTransform {
  transform(value?: string) {
    return (value as string)?.split(',') ?? [];
  }
}
