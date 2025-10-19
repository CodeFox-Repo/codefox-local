// Client-side helper for project creation and preview management

import type { ProjectInfo } from './project-manager';
import { getRightPanelRef } from './preview-ref';

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

// Set the preview URL via RightPanel ref
export async function setPreviewUrl(url: string): Promise<{
  success: boolean;
  message: string;
}> {
  const rightPanelRef = getRightPanelRef();
  
  if (!rightPanelRef) {
    throw new Error('RightPanel ref not available');
  }

  // Update preview URL through ref
  rightPanelRef.setUrl(url);

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
