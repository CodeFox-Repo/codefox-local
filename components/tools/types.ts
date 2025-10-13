export interface RenderResult {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

