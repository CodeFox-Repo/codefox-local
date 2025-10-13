import { NextRequest, NextResponse } from 'next/server';
import { ProjectManager } from '@/lib/project-manager';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

const projectManager = ProjectManager.getInstance();

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || '',
});

async function buildTitle(prompt: string): Promise<string | null> {
  if (!prompt) return null;

  try {
    const result = await generateText({
      model: openrouter.chat('openai/gpt-5-nano'),
      prompt: `Generate a concise, descriptive title (max 60 characters) for a web project based on this user query: "${prompt}". Return ONLY the title text, nothing else. Do not use quotes or punctuation at the end.`,
      temperature: 0.7,
    });

    const title = result.text.trim();
    return title || null;
  } catch (error) {
    console.error('Failed to generate title with AI:', error);
    return null;
  }
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

    const title = await buildTitle(prompt);

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
