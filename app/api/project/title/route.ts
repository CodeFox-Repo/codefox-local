import { NextRequest, NextResponse } from 'next/server';
import { ProjectManager } from '@/lib/project-manager';

const projectManager = ProjectManager.getInstance();

const MAX_TITLE_LENGTH = 60;

function buildTitle(prompt: string): string | null {
  if (!prompt) return null;

  const cleaned = prompt.replace(/\s+/g, ' ').replace(/[^\w\s-:,.'"]/g, '').trim();
  if (!cleaned) return null;

  let candidate = cleaned.slice(0, MAX_TITLE_LENGTH).trim();
  if (cleaned.length > MAX_TITLE_LENGTH) {
    candidate = candidate.replace(/[,.:;!?-]+$/, '').trim();
    candidate = `${candidate}…`;
  } else {
    candidate = candidate.replace(/[,.:;!?-]+$/, '').trim();
  }

  if (!candidate) {
    return null;
  }

  return candidate.charAt(0).toUpperCase() + candidate.slice(1);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, prompt } = body ?? {};

    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'projectId is required' },
        { status: 400 }
      );
    }

    if (typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'prompt must be a string' },
        { status: 400 }
      );
    }

    const title = buildTitle(prompt);

    projectManager.setProjectTitle(projectId, title);

    return NextResponse.json({
      success: true,
      title,
    });
  } catch (error) {
    console.error('[api/project/title] Error generating project title:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
