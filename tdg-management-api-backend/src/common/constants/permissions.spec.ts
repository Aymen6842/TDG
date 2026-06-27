import { UserType } from '@prisma/client';

import { PERMISSIONS, PERMISSIONS_FOR_ROLE } from './permissions';

describe('project manager project permissions', () => {
  it('grants PROJECT_DELETE to TawerDev project managers', () => {
    expect(PERMISSIONS_FOR_ROLE[UserType.TawerDevProjectManager]).toContain(
      PERMISSIONS.PROJECTS.PROJECT_DELETE,
    );
  });

  it('grants PROJECT_DELETE to TawerCreative project managers', () => {
    expect(
      PERMISSIONS_FOR_ROLE[UserType.TawerCreativeProjectManager],
    ).toContain(PERMISSIONS.PROJECTS.PROJECT_DELETE);
  });
});
