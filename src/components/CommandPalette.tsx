"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  FileText,
  Home,
  Building2,
  TrendingUp,
  AlertTriangle,
  Activity,
  Users,
  Settings,
  Search,
  Upload,
  BarChart3,
  Shield,
  Brain,
  Zap,
  Sparkles,
  CreditCard,
  Key,
  LifeBuoy,
  PieChart,
  FolderOpen,
  FileSearch,
  GitCompare,
  Workflow,
  Database,
  Bell,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

interface Command {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  keywords?: string[];
  action: () => void;
  group: string;
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  // Keyboard shortcut handler
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const commands: Command[] = [
    // Navigation
    {
      id: "nav-home",
      label: "Go to Dashboard",
      icon: Home,
      shortcut: "⌘H",
      keywords: ["dashboard", "home", "overview"],
      action: () => {
        router.push("/dashboard");
        setOpen(false);
      },
      group: "Navigation",
    },
    {
      id: "nav-portfolio",
      label: "Go to Portfolio",
      icon: PieChart,
      shortcut: "⌘P",
      keywords: ["portfolio", "investments", "holdings"],
      action: () => {
        router.push("/dashboard/portfolio");
        setOpen(false);
      },
      group: "Navigation",
    },
    {
      id: "nav-companies",
      label: "Go to Companies",
      icon: Building2,
      shortcut: "⌘C",
      keywords: ["companies", "organizations", "businesses"],
      action: () => {
        router.push("/dashboard/companies");
        setOpen(false);
      },
      group: "Navigation",
    },
    {
      id: "nav-documents",
      label: "Go to Documents",
      icon: FileText,
      shortcut: "⌘D",
      keywords: ["documents", "files", "uploads"],
      action: () => {
        router.push("/dashboard");
        setOpen(false);
        setTimeout(() => {
          const event = new CustomEvent("navigate-to-section", { detail: "documents" });
          window.dispatchEvent(event);
        }, 100);
      },
      group: "Navigation",
    },
    {
      id: "nav-analytics",
      label: "Go to Analytics",
      icon: TrendingUp,
      shortcut: "⌘A",
      keywords: ["analytics", "insights", "reports"],
      action: () => {
        router.push("/dashboard/ai-analytics");
        setOpen(false);
      },
      group: "Navigation",
    },
    {
      id: "nav-alerts",
      label: "Go to Alerts",
      icon: AlertTriangle,
      keywords: ["alerts", "notifications", "warnings"],
      action: () => {
        router.push("/dashboard");
        setOpen(false);
        setTimeout(() => {
          const event = new CustomEvent("navigate-to-section", { detail: "alerts" });
          window.dispatchEvent(event);
        }, 100);
      },
      group: "Navigation",
    },
    {
      id: "nav-ai-tools",
      label: "Go to AI Tools",
      icon: Activity,
      keywords: ["ai", "tools", "automation", "agents"],
      action: () => {
        router.push("/dashboard");
        setOpen(false);
        setTimeout(() => {
          const event = new CustomEvent("navigate-to-section", { detail: "ai-tools" });
          window.dispatchEvent(event);
        }, 100);
      },
      group: "Navigation",
    },

    // Actions
    {
      id: "action-upload",
      label: "Upload Document",
      icon: Upload,
      shortcut: "⌘U",
      keywords: ["upload", "document", "file", "new"],
      action: () => {
        router.push("/dashboard");
        setOpen(false);
        toast.info("Navigate to Documents to upload files");
      },
      group: "Actions",
    },
    {
      id: "action-search",
      label: "Search Documents",
      icon: Search,
      shortcut: "⌘F",
      keywords: ["search", "find", "lookup"],
      action: () => {
        router.push("/dashboard");
        setOpen(false);
        toast.info("Navigate to Documents to search");
      },
      group: "Actions",
    },
    {
      id: "action-multi-agent",
      label: "Multi-Agent Analysis",
      icon: Brain,
      shortcut: "⌘⇧A",
      keywords: ["ai", "analysis", "multi-agent", "analyze"],
      action: () => {
        router.push("/dashboard");
        setOpen(false);
        toast.success("Opening Multi-Agent Analysis");
      },
      group: "Actions",
    },
    {
      id: "action-generate-report",
      label: "Generate Report",
      icon: FileText,
      shortcut: "⌘R",
      keywords: ["report", "generate", "create", "export"],
      action: () => {
        router.push("/dashboard");
        setOpen(false);
        setTimeout(() => {
          const event = new CustomEvent("navigate-to-section", { detail: "analytics" });
          window.dispatchEvent(event);
        }, 100);
        toast.success("Opening Report Generator");
      },
      group: "Actions",
    },
    {
      id: "action-batch-upload",
      label: "Batch Upload Documents",
      icon: FolderOpen,
      keywords: ["batch", "upload", "multiple", "bulk"],
      action: () => {
        toast.success("Opening Batch Upload");
        setOpen(false);
      },
      group: "Actions",
    },
    {
      id: "action-compare-docs",
      label: "Compare Documents",
      icon: GitCompare,
      keywords: ["compare", "diff", "contrast", "documents"],
      action: () => {
        toast.success("Opening Document Comparison");
        setOpen(false);
      },
      group: "Actions",
    },

    // AI Tools
    {
      id: "ai-semantic-search",
      label: "Semantic Search",
      icon: FileSearch,
      keywords: ["semantic", "search", "ai", "smart"],
      action: () => {
        router.push("/dashboard");
        setOpen(false);
        setTimeout(() => {
          const event = new CustomEvent("navigate-to-section", { detail: "semantic-search" });
          window.dispatchEvent(event);
        }, 100);
      },
      group: "AI Tools",
    },
    {
      id: "ai-fraud-detection",
      label: "Fraud Detection",
      icon: Shield,
      keywords: ["fraud", "detection", "security", "anomaly"],
      action: () => {
        router.push("/dashboard");
        setOpen(false);
        setTimeout(() => {
          const event = new CustomEvent("navigate-to-section", { detail: "fraud" });
          window.dispatchEvent(event);
        }, 100);
      },
      group: "AI Tools",
    },
    {
      id: "ai-explainable",
      label: "Explainable AI",
      icon: Brain,
      keywords: ["explainable", "explain", "ai", "transparency"],
      action: () => {
        router.push("/dashboard");
        setOpen(false);
        setTimeout(() => {
          const event = new CustomEvent("navigate-to-section", { detail: "explainable" });
          window.dispatchEvent(event);
        }, 100);
      },
      group: "AI Tools",
    },
    {
      id: "ai-workflow",
      label: "Workflow Automation",
      icon: Workflow,
      keywords: ["workflow", "automation", "automate", "process"],
      action: () => {
        toast.success("Opening Workflow Builder");
        setOpen(false);
      },
      group: "AI Tools",
    },

    // Enterprise
    {
      id: "enterprise-features",
      label: "Enterprise Features",
      icon: Sparkles,
      keywords: ["enterprise", "premium", "advanced"],
      action: () => {
        router.push("/enterprise-features");
        setOpen(false);
      },
      group: "Enterprise",
    },

    // Settings
    {
      id: "settings-team",
      label: "Team Management",
      icon: Users,
      keywords: ["team", "members", "users", "invite"],
      action: () => {
        router.push("/dashboard/settings/team");
        setOpen(false);
      },
      group: "Settings",
    },
    {
      id: "settings-org",
      label: "Organization Settings",
      icon: Building2,
      keywords: ["organization", "company", "settings"],
      action: () => {
        router.push("/dashboard/settings/organization");
        setOpen(false);
      },
      group: "Settings",
    },
    {
      id: "settings-billing",
      label: "Billing & Plans",
      icon: CreditCard,
      keywords: ["billing", "payment", "subscription", "plan"],
      action: () => {
        router.push("/dashboard/settings/billing");
        setOpen(false);
      },
      group: "Settings",
    },
    {
      id: "settings-api",
      label: "API Keys",
      icon: Key,
      keywords: ["api", "keys", "integration", "developer"],
      action: () => {
        router.push("/dashboard/settings/api-keys");
        setOpen(false);
      },
      group: "Settings",
    },
    {
      id: "settings-support",
      label: "Support & Help",
      icon: LifeBuoy,
      keywords: ["support", "help", "contact", "ticket"],
      action: () => {
        router.push("/dashboard/support");
        setOpen(false);
      },
      group: "Settings",
    },
  ];

  // Group commands
  const groupedCommands = commands.reduce((acc, cmd) => {
    if (!acc[cmd.group]) {
      acc[cmd.group] = [];
    }
    acc[cmd.group].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {Object.entries(groupedCommands).map(([group, cmds], index) => (
          <React.Fragment key={group}>
            {index > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {cmds.map((cmd) => (
                <CommandItem
                  key={cmd.id}
                  onSelect={cmd.action}
                  keywords={cmd.keywords}
                >
                  <cmd.icon className="mr-2 h-4 w-4" />
                  <span>{cmd.label}</span>
                  {cmd.shortcut && (
                    <CommandShortcut>{cmd.shortcut}</CommandShortcut>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
