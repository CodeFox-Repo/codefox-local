import { NextRequest, NextResponse } from 'next/server';
import { ProjectManager } from '@/lib/project-manager';

const projectManager = ProjectManager.getInstance();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const filePath = searchParams.get('filePath');

    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'projectId is required' },
        { status: 400 }
      );
    }

    if (!filePath || typeof filePath !== 'string') {
      return NextResponse.json(
        { success: false, error: 'filePath is required' },
        { status: 400 }
      );
    }

    const content = await projectManager.readFile(projectId, filePath);
    
    return NextResponse.json({ 
      success: true, 
      content 
    });
  } catch (error) {
    console.error('[api/project/file] Error reading file:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

