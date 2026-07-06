// Client-side helper for project creation and preview management

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

export async function requestProjectTitle(projectId: string, prompt: string): Promise<string | null> {
  const response = await fetch('/api/project/title', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      projectId,
      prompt,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to generate project title');
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to generate project title');
  }

  return data.title ?? null;
}
