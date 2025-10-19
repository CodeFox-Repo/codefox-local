import { useCallback } from 'react';
import { useSandpack } from '@codesandbox/sandpack-react';

export function useSandpackFiles() {
  const { sandpack } = useSandpack();

  // Write or update a file
  const writeFile = useCallback((path: string, content: string) => {
    try {
      // Ensure path starts with /
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      
      // Update file in Sandpack
      sandpack.updateFile(normalizedPath, content);
      
      return { success: true, path: normalizedPath };
    } catch (error) {
      console.error('[useSandpackFiles] Write file error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to write file' 
      };
    }
  }, [sandpack]);

  // Execute command (no-op in Sandpack, just for compatibility)
  const executeCommand = useCallback((_command: string) => {
    // Sandpack doesn't support executing commands
    // This is just a stub for API compatibility
    return { 
      success: true, 
      message: 'Commands are not executed in Sandpack environment' 
    };
  }, []);

  return {
    writeFile,
    executeCommand,
  };
}

