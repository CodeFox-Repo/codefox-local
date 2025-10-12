import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const TEMPLATE_REPO = 'https://github.com/Sma1lboy/hetagon-template.git';
const PROJECTS_DIR = path.join(process.env.HOME || process.cwd(), '.codefox-local', 'projects');

export interface ProjectInfo {
  id: string;
  name: string;
  path: string;
  createdAt: Date;
}

export class ProjectManager {
  private static instance: ProjectManager;
  private projects: Map<string, ProjectInfo> = new Map();

  private constructor() {}

  static getInstance(): ProjectManager {
    if (!ProjectManager.instance) {
      ProjectManager.instance = new ProjectManager();
    }
    return ProjectManager.instance;
  }

  async initializeProjectsDir(): Promise<void> {
    try {
      await fs.access(PROJECTS_DIR);
    } catch {
      await fs.mkdir(PROJECTS_DIR, { recursive: true });
    }
  }

  async createProject(name: string): Promise<ProjectInfo> {
    await this.initializeProjectsDir();

    const projectId = `project-${Date.now()}`;
    const projectPath = path.join(PROJECTS_DIR, projectId);

    try {
      // Clone template repository
      await execAsync(`git clone ${TEMPLATE_REPO} ${projectPath}`);

      // Remove .git directory to make it a fresh project
      await execAsync(`rm -rf ${projectPath}/.git`);

      const projectInfo: ProjectInfo = {
        id: projectId,
        name,
        path: projectPath,
        createdAt: new Date(),
      };

      this.projects.set(projectId, projectInfo);
      return projectInfo;
    } catch (error) {
      throw new Error(`Failed to create project: ${error}`);
    }
  }

  getProject(projectId: string): ProjectInfo | undefined {
    return this.projects.get(projectId);
  }

  getProjectPath(projectId: string): string {
    const project = this.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }
    return project.path;
  }

  async writeFile(projectId: string, filePath: string, content: string): Promise<void> {
    const project = this.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const fullPath = path.join(project.path, filePath);
    const dir = path.dirname(fullPath);

    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  async readFile(projectId: string, filePath: string): Promise<string> {
    const project = this.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const fullPath = path.join(project.path, filePath);
    return await fs.readFile(fullPath, 'utf-8');
  }

  async executeCommand(projectId: string, command: string): Promise<{ stdout: string; stderr: string }> {
    const project = this.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    try {
      const result = await execAsync(command, {
        cwd: project.path,
        timeout: 30000, // 30 seconds timeout
      });
      return result;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return {
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
      };
    }
  }

  async listFiles(projectId: string, dirPath: string = '.'): Promise<string[]> {
    const project = this.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const fullPath = path.join(project.path, dirPath);
    const entries = await fs.readdir(fullPath, { withFileTypes: true });

    const files: string[] = [];
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue; // Skip hidden files

      const relativePath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const subFiles = await this.listFiles(projectId, relativePath);
        files.push(...subFiles);
      } else {
        files.push(relativePath);
      }
    }

    return files;
  }

  async getProjectContext(projectId: string): Promise<string> {
    const project = this.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const files = await this.listFiles(projectId);
    const context: string[] = ['Project Structure:', ''];

    for (const file of files) {
      context.push(`- ${file}`);
    }

    return context.join('\n');
  }

  async deleteProject(projectId: string): Promise<void> {
    const project = this.getProject(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    await execAsync(`rm -rf ${project.path}`);
    this.projects.delete(projectId);
  }
}
