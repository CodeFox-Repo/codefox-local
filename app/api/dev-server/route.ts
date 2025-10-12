import { exec } from 'child_process';
import { promisify } from 'util';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

// Store running dev servers in memory
const runningServers = new Map<string, { pid: number; url: string }>();

/**
 * Extract dev server URL from command output
 */
function extractDevServerUrl(output: string): string | null {
  const patterns = [
    /Local:\s+(https?:\/\/[^\s]+)/i,
    /url:\s+(https?:\/\/[^\s]+)/i,
    /(https?:\/\/localhost:\d+)/i,
    /Local:\s+http:\/\/localhost:(\d+)/i, // Extract port and construct URL
  ];

  for (const pattern of patterns) {
    const match = output.match(pattern);
    if (match) {
      return match[1].replace(/\/$/, '');
    }
  }
  return null;
}

/**
 * Start dev server for a project
 * POST /api/dev-server/start
 */
export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    // If server already running for this project, return existing info
    if (runningServers.has(projectId)) {
      const existing = runningServers.get(projectId)!;
      return NextResponse.json({
        url: existing.url,
        pid: existing.pid,
        status: 'running',
        cached: true,
      });
    }

    // Construct project path
    const projectPath = path.join(process.env.HOME || process.cwd(), '.codefox-local', 'projects', projectId);

    // Check if project exists
    try {
      await fs.access(projectPath);
    } catch {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if package.json exists
    const packageJsonPath = path.join(projectPath, 'package.json');
    try {
      await fs.access(packageJsonPath);
    } catch {
      return NextResponse.json(
        { error: 'No package.json found in project' },
        { status: 400 }
      );
    }

    // Install dependencies first
    console.log(`[dev-server] Installing dependencies for ${projectId}...`);
    try {
      await execAsync('bun install', { cwd: projectPath });
    } catch (error) {
      console.error(`[dev-server] Failed to install dependencies:`, error);
      return NextResponse.json(
        { error: 'Failed to install dependencies' },
        { status: 500 }
      );
    }

    // Start dev server in background
    console.log(`[dev-server] Starting dev server for ${projectId}...`);
    const childProcess = exec('bun dev', {
      cwd: projectPath,
    });

    let url: string | null = null;
    let resolved = false;

    // Create promise to wait for URL detection
    const urlPromise = new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          reject(new Error('Timeout waiting for dev server to start'));
        }
      }, 30000); // 30 second timeout

      // Listen to stdout
      childProcess.stdout?.on('data', (data: Buffer) => {
        const output = data.toString();
        console.log(`[dev-server] stdout: ${output}`);

        if (!resolved) {
          const detectedUrl = extractDevServerUrl(output);
          if (detectedUrl) {
            resolved = true;
            clearTimeout(timeout);
            resolve(detectedUrl);
          }
        }
      });

      // Listen to stderr (some frameworks output to stderr)
      childProcess.stderr?.on('data', (data: Buffer) => {
        const output = data.toString();
        console.log(`[dev-server] stderr: ${output}`);

        if (!resolved) {
          const detectedUrl = extractDevServerUrl(output);
          if (detectedUrl) {
            resolved = true;
            clearTimeout(timeout);
            resolve(detectedUrl);
          }
        }
      });

      // Handle process errors
      childProcess.on('error', (error) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          reject(error);
        }
      });

      // Handle process exit
      childProcess.on('exit', (code) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          reject(new Error(`Process exited with code ${code}`));
        }
      });
    });

    try {
      url = await urlPromise;
    } catch (error) {
      console.error(`[dev-server] Failed to detect URL:`, error);

      // Kill the process if it's still running
      if (childProcess.pid) {
        try {
          process.kill(childProcess.pid);
        } catch {
          // Ignore kill errors
        }
      }

      return NextResponse.json(
        { error: 'Failed to start dev server or detect URL' },
        { status: 500 }
      );
    }

    if (!url || !childProcess.pid) {
      return NextResponse.json(
        { error: 'Failed to get URL or PID' },
        { status: 500 }
      );
    }

    // Store running server info
    runningServers.set(projectId, {
      pid: childProcess.pid,
      url,
    });

    console.log(`[dev-server] Successfully started dev server for ${projectId} at ${url} (PID: ${childProcess.pid})`);

    return NextResponse.json({
      url,
      pid: childProcess.pid,
      status: 'running',
    });

  } catch (error) {
    console.error('[dev-server] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Stop dev server for a project
 * DELETE /api/dev-server
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    const server = runningServers.get(projectId);
    if (!server) {
      return NextResponse.json(
        { error: 'No running server found for this project' },
        { status: 404 }
      );
    }

    // Kill the process
    try {
      process.kill(server.pid);
      runningServers.delete(projectId);
      console.log(`[dev-server] Stopped dev server for ${projectId} (PID: ${server.pid})`);

      return NextResponse.json({
        success: true,
        message: 'Dev server stopped',
      });
    } catch (error) {
      console.error(`[dev-server] Failed to kill process:`, error);
      // Remove from map anyway since process might be dead
      runningServers.delete(projectId);

      return NextResponse.json(
        { error: 'Failed to stop dev server' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[dev-server] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get dev server status for a project
 * GET /api/dev-server
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    const server = runningServers.get(projectId);
    if (!server) {
      return NextResponse.json({
        status: 'idle',
        url: null,
        pid: null,
      });
    }

    // Check if process is still alive
    try {
      process.kill(server.pid, 0); // Signal 0 checks if process exists
      return NextResponse.json({
        status: 'running',
        url: server.url,
        pid: server.pid,
      });
    } catch {
      // Process is dead, remove from map
      runningServers.delete(projectId);
      return NextResponse.json({
        status: 'idle',
        url: null,
        pid: null,
      });
    }

  } catch (error) {
    console.error('[dev-server] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
