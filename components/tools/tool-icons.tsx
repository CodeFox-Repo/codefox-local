import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export function getStateIcon(state: "pending" | "completed" | "error") {
  switch (state) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }
}
