import { NextRequest, NextResponse } from 'next/server';
import { ProjectManager } from '@/lib/project-manager';

const projectManager = ProjectManager.getInstance();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid project name' },
        { status: 400 }
      );
    }

    const project = await projectManager.createProject(name);
    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error('Project creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
