'use client';

import { 
  SandpackLayout,
  SandpackCodeEditor,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import type { SandpackEditorProps } from "./types";
import "./sandpack-custom.css";

export function SandpackEditor({ projectId: _projectId }: SandpackEditorProps) {
  return (
    <div className="w-full h-full overflow-hidden">
      <SandpackLayout style={{ height: '100%', width: '100%', borderRadius: 0 }}>
        <SandpackFileExplorer 
          className="sandpack-custom-explorer"
          style={{ minWidth: 150, maxWidth: 150 }} 
        />
        <SandpackCodeEditor 
          className="sandpack-custom-editor"
          showTabs
          showLineNumbers
          showInlineErrors
          closableTabs
          style={{ borderRadius: 0 }}
        />
      </SandpackLayout>
    </div>
  );
}