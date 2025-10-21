import type { SandpackFiles } from "@codesandbox/sandpack-react";

// Base template - Simple React setup without Vite
export const CODEFOX_SANDPACK_TEMPLATE: SandpackFiles = {
  // Entry HTML (Tailwind loaded via SandpackProvider externalResources)
  "/public/index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeFox App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
  // Main App component
  "/App.tsx": `// Main App Component
// This is the root component of your application
export default function App(): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
            Hello World
          </h1>
          <p className="text-xl text-gray-600">
            Start building with CodeFox
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <button className="px-6 py-3 bg-orange-600 text-white font-medium rounded-lg shadow-lg hover:bg-orange-700 transition-colors duration-200">
            Get Started
          </button>
          <button className="px-6 py-3 bg-white text-orange-600 font-medium rounded-lg shadow-lg border-2 border-orange-600 hover:bg-orange-50 transition-colors duration-200">
            Learn More
          </button>
        </div>

        <div className="mt-8 p-6 bg-white rounded-xl shadow-md">
          <p className="text-sm text-gray-500 mb-2">Powered by Tailwind CSS</p>
          <div className="flex gap-2 justify-center">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">React</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">TypeScript</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Tailwind</span>
          </div>
        </div>
      </div>
    </div>
  )
}
`,
  // React entry point
  "/index.tsx": `import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

import App from "./App";

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
`,

  // Base styles - custom CSS variables only
  "/styles.css": `:root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(0 0% 3.9%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(0 0% 3.9%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(0 0% 3.9%);
  --primary: hsl(0 0% 9%);
  --primary-foreground: hsl(0 0% 98%);
  --secondary: hsl(0 0% 96.1%);
  --secondary-foreground: hsl(0 0% 9%);
  --muted: hsl(0 0% 96.1%);
  --muted-foreground: hsl(0 0% 45.1%);
  --accent: hsl(0 0% 96.1%);
  --accent-foreground: hsl(0 0% 9%);
  --destructive: hsl(0 84.2% 60.2%);
  --destructive-foreground: hsl(0 0% 98%);
  --border: hsl(0 0% 89.8%);
  --input: hsl(0 0% 89.8%);
  --ring: hsl(0 0% 3.9%);
  --radius: 0.5rem;
}

.dark {
  --background: hsl(0 0% 3.9%);
  --foreground: hsl(0 0% 98%);
  --card: hsl(0 0% 3.9%);
  --card-foreground: hsl(0 0% 98%);
  --popover: hsl(0 0% 3.9%);
  --popover-foreground: hsl(0 0% 98%);
  --primary: hsl(0 0% 98%);
  --primary-foreground: hsl(0 0% 9%);
  --secondary: hsl(0 0% 14.9%);
  --secondary-foreground: hsl(0 0% 98%);
  --muted: hsl(0 0% 14.9%);
  --muted-foreground: hsl(0 0% 63.9%);
  --accent: hsl(0 0% 14.9%);
  --accent-foreground: hsl(0 0% 98%);
  --destructive: hsl(0 62.8% 30.6%);
  --destructive-foreground: hsl(0 0% 98%);
  --border: hsl(0 0% 14.9%);
  --input: hsl(0 0% 14.9%);
  --ring: hsl(0 0% 83.1%);
}

* {
  border-color: hsl(var(--border));
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: sans-serif;
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
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["./**/*"]
}
`,

  // Package.json with Tailwind CSS and common packages
  "/package.json": `{
  "name": "codefox-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "class-variance-authority": "^0.7.1",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "typescript": "^5.6.2",
    "tailwindcss": "^4.0.0",
    "tailwindcss-animate": "^1.0.7"
  }
}
`,
};

