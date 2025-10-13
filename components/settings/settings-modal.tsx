"use client";

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Settings, Sparkles, FolderOpen, Wrench, Eye, EyeOff } from 'lucide-react';
import { useSettingsStore } from '@/lib/settings-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { id: 'general' as const, label: 'General', icon: Settings },
  { id: 'ai' as const, label: 'AI Settings', icon: Sparkles },
  { id: 'projects' as const, label: 'Projects', icon: FolderOpen },
  { id: 'advanced' as const, label: 'Advanced', icon: Wrench },
];

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  variant?: 'default' | 'danger';
}

function SettingRow({ label, description, children, variant = 'default' }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b last:border-b-0">
      <div className="flex-1 pr-4">
        <Label className={cn("text-base font-medium", variant === 'danger' && 'text-destructive')}>
          {label}
        </Label>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="w-64">{children}</div>
    </div>
  );
}

function GeneralSettings() {
  const { theme, setTheme: setThemeInStore } = useTheme();
  const { fontSize, setFontSize } = useSettingsStore();

  return (
    <div className="space-y-0">
      <SettingRow label="Theme" description="Choose your interface theme">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setThemeInStore('light')}
            className={cn(
              "px-3 py-1.5 rounded-md border text-sm transition-colors",
              theme === 'light' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            )}
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => setThemeInStore('dark')}
            className={cn(
              "px-3 py-1.5 rounded-md border text-sm transition-colors",
              theme === 'dark' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            )}
          >
            Dark
          </button>
          <button
            type="button"
            onClick={() => setThemeInStore('system')}
            className={cn(
              "px-3 py-1.5 rounded-md border text-sm transition-colors",
              theme === 'system' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            )}
          >
            System
          </button>
        </div>
      </SettingRow>

      <SettingRow label="Font Size" description="Adjust text size across the app">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFontSize('small')}
            className={cn(
              "px-3 py-1.5 rounded-md border text-sm transition-colors",
              fontSize === 'small' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            )}
          >
            Small
          </button>
          <button
            type="button"
            onClick={() => setFontSize('medium')}
            className={cn(
              "px-3 py-1.5 rounded-md border text-sm transition-colors",
              fontSize === 'medium' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            )}
          >
            Medium
          </button>
          <button
            type="button"
            onClick={() => setFontSize('large')}
            className={cn(
              "px-3 py-1.5 rounded-md border text-sm transition-colors",
              fontSize === 'large' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            )}
          >
            Large
          </button>
        </div>
      </SettingRow>
    </div>
  );
}

function AISettings() {
  const {
    aiProvider,
    setAIProvider,
    apiKey,
    setAPIKey,
    model,
    setModel,
    temperature,
    setTemperature,
    maxTokens,
    setMaxTokens,
  } = useSettingsStore();

  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="space-y-0">
      <SettingRow label="AI Provider" description="Select your AI service provider">
        <select
          value={aiProvider}
          onChange={(e) => setAIProvider(e.target.value as typeof aiProvider)}
          className="w-full px-3 py-2 border rounded-md bg-background"
        >
          <option value="openai">OpenAI</option>
          <option value="openrouter">OpenRouter</option>
        </select>
      </SettingRow>

      <SettingRow label="API Key" description="Your API key (stored locally)">
        <div className="flex gap-2">
          <Input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setAPIKey(e.target.value)}
            placeholder="sk-..."
            className="flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowApiKey(!showApiKey)}
            type="button"
          >
            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </SettingRow>

      <SettingRow label="Model ID" description="Enter the model ID (e.g., claude-sonnet-4-20250514, gpt-4o)">
        <Input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="claude-sonnet-4-20250514"
          className="w-full"
        />
      </SettingRow>

      <SettingRow label="Temperature" description={`Controls randomness (${temperature})`}>
        <div className="space-y-2">
          <Slider
            value={[temperature]}
            onValueChange={([value]) => setTemperature(value)}
            min={0}
            max={2}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>
      </SettingRow>

      <SettingRow label="Max Tokens" description="Maximum response length (100-8192)">
        <Input
          type="number"
          value={maxTokens}
          onChange={(e) => setMaxTokens(Number(e.target.value))}
          min={100}
          max={8192}
          step={100}
        />
      </SettingRow>
    </div>
  );
}

function ProjectsSettings() {
  const {
    defaultProjectPath,
    setDefaultProjectPath,
    autoSave,
    setAutoSave,
    autoPreview,
    setAutoPreview,
  } = useSettingsStore();

  return (
    <div className="space-y-0">
      <SettingRow label="Default Project Path" description="Where new projects are created">
        <Input
          value={defaultProjectPath}
          onChange={(e) => setDefaultProjectPath(e.target.value)}
          placeholder="~/Projects"
        />
      </SettingRow>

      <SettingRow label="Auto Save" description="Automatically save changes">
        <Switch checked={autoSave} onCheckedChange={setAutoSave} />
      </SettingRow>

      <SettingRow label="Auto Preview" description="Open preview after generation">
        <Switch checked={autoPreview} onCheckedChange={setAutoPreview} />
      </SettingRow>
    </div>
  );
}

function AdvancedSettings() {
  const {
    defaultPort,
    setDefaultPort,
    autoOpenBrowser,
    setAutoOpenBrowser,
  } = useSettingsStore();

  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  return (
    <div className="space-y-0">
      <SettingRow label="Default Port" description="Development server port (1024-65535)">
        <Input
          type="number"
          value={defaultPort}
          onChange={(e) => setDefaultPort(Number(e.target.value))}
          min={1024}
          max={65535}
        />
      </SettingRow>

      <SettingRow label="Auto Open Browser" description="Open browser when server starts">
        <Switch checked={autoOpenBrowser} onCheckedChange={setAutoOpenBrowser} />
      </SettingRow>

      <SettingRow
        label="Clear Chat History"
        description="⚠️ Cannot be undone"
        variant="danger"
      >
        <Button variant="destructive" onClick={() => setShowClearDialog(true)}>
          Clear History
        </Button>
      </SettingRow>

      <SettingRow
        label="Reset All Settings"
        description="⚠️ Cannot be undone"
        variant="danger"
      >
        <Button variant="destructive" onClick={() => setShowResetDialog(true)}>
          Reset All
        </Button>
      </SettingRow>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Chat History?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your conversation history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                // TODO: Implement clear chat history
                console.log('Clearing chat history...');
                setShowClearDialog(false);
              }}
            >
              Clear History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset All Settings?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore all settings to their default values. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                useSettingsStore.getState().resetToDefaults();
                setShowResetDialog(false);
              }}
            >
              Reset Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function SettingsModal() {
  const { isSettingsOpen, setIsSettingsOpen, currentTab, setCurrentTab } = useSettingsStore();

  const renderContent = () => {
    switch (currentTab) {
      case 'general':
        return <GeneralSettings />;
      case 'ai':
        return <AISettings />;
      case 'projects':
        return <ProjectsSettings />;
      case 'advanced':
        return <AdvancedSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
      <DialogContent className="!max-w-4xl sm:!max-w-4xl h-[600px] p-0 gap-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Navigation */}
          <aside className="w-48 border-r bg-muted/30 p-4">
            <nav className="space-y-1">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setCurrentTab(id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    currentTab === id
                      ? 'bg-background text-foreground font-medium shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Right Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </main>
        </div>

        <div className="flex flex-row justify-end gap-2 px-6 pb-4 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsSettingsOpen(false)}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
