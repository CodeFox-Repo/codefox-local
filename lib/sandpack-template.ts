import type { SandpackFiles } from "@codesandbox/sandpack-react";

// Base template based on your /template directory
export const CODEFOX_SANDPACK_TEMPLATE: SandpackFiles = {
  // Entry point
  "/index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/codefox.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CodeFox App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>`,

  // Main entry
  "/src/index.tsx": `import ReactDOM from 'react-dom/client';
import './index.css';

const App = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center space-y-6">
      <h1 className="text-6xl font-bold text-gray-900">
        Welcome to CodeFox
      </h1>
      <p className="text-xl text-gray-600">
        Start building amazing things with AI
      </p>
      <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Get Started
      </button>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
`,

  // Styles
  "/src/index.css": `@import "tailwindcss";

@theme {
  --color-background: #ffffff;
  --color-foreground: #0a0a0a;
  --color-primary: #2563eb;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}
`,

  // Utilities
  "/src/lib/utils.ts": `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`,

  // TypeScript config
  "/tsconfig.json": `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
`,

  // Package.json - simplified for Sandpack
  "/package.json": `{
  "name": "codefox-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "lucide-react": "^0.445.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "~5.6.2",
    "vite": "^6.0.1"
  }
}
`,
};

// Sandpack setup configuration
export const CODEFOX_SANDPACK_SETUP = {
  dependencies: {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "lucide-react": "^0.445.0",
    // Add more dependencies as needed by AI
  },
  devDependencies: {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "~5.6.2",
  },
  entry: "/src/index.tsx",
  environment: "vite" as const,
};

// Helper to get minimal starter template
export function getMinimalTemplate(): SandpackFiles {
  return {
    "/App.tsx": CODEFOX_SANDPACK_TEMPLATE["/src/index.tsx"],
    "/styles.css": CODEFOX_SANDPACK_TEMPLATE["/src/index.css"],
  };
}

// Helper to merge user files with template
export function mergeWithTemplate(userFiles: SandpackFiles): SandpackFiles {
  return {
    ...CODEFOX_SANDPACK_TEMPLATE,
    ...userFiles,
  };
}

