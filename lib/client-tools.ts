// Client-side helper for project creation

import type { ProjectInfo } from './project-manager';

// Create a project via API
export async function createProject(name: string): Promise<ProjectInfo> {
  const response = await fetch('/api/project/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
    }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to create project');
  }

  return data.project;
}
