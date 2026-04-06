// All mutation mocks are no-ops — mock mode simulates success without touching data.
// In mock mode, React Query cache invalidation still fires so the UI refreshes from mock_data.

export async function mockUploadProject(): Promise<void> { return; }

export async function mockUploadProjectTask(): Promise<{ success: boolean }> {
  return { success: true };
}

export async function mockDeleteProjectTask(): Promise<void> { return; }

export async function mockAddProjectTaskComment(): Promise<void> { return; }

export async function mockDeleteProjectTaskComment(): Promise<void> { return; }
