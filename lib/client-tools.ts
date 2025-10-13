// Client-side helper for project creation and preview management

import type { ProjectInfo } from './project-manager';
import { useProjectStore } from './store';

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

// Set the preview URL in the iframe
export async function setPreviewUrl(url: string): Promise<{
  success: boolean;
  message: string;
}> {
  // Validate URL format (must be localhost)
  if (!url.match(/^https?:\/\/localhost:\d+/)) {
    throw new Error('Invalid preview URL format. Must be http://localhost:port');
  }

  // Update store
  useProjectStore.getState().setIframeUrl(url);

  return {
    success: true,
    message: `Preview URL updated to ${url}`,
  };
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
