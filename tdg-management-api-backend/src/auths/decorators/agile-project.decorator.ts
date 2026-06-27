import { SetMetadata } from '@nestjs/common';

export const AGILE_PROJECT_KEY = 'agileProjectParam';

/**
 * Custom decorator to specify which route parameter contains the projectId
 * for the AgileOnlyGuard to check
 *
 * @param paramName - The name of the route parameter containing the projectId
 *
 * @example
 * ```
 * @AgileProject('projectId')
 * ```
 */
export const AgileProject = (paramName: string) =>
  SetMetadata(AGILE_PROJECT_KEY, paramName);
