import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { BarChart3, FileText, MessageSquareText, Settings, ShieldAlert, Sparkle } from "lucide-react";

export const Route = createFileRoute("/parent")({
  component: ParentLayout,
});

const NAV = [
  { to: "/parent", label: "Overview", icon: BarChart3, exact: true },
  { to: "/parent/safety", label: "Safety & Alerts", icon: ShieldAlert },
  { to: "/parent/vault", label: "Conversation Vault", icon: MessageSquareText },
  { to: "/parent/settings", label: "Personalization & Notes", icon: Settings },
  { to: "/parent/reports", label: "Development Reports", icon: FileText },
] as const;

function ParentLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="lg:w-64 lg:shrink-0">
          <Link to="/chat" className="flex items-center gap-2 px-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-koda text-koda-foreground">
              <Sparkle className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold text-foreground">Koda Parent Hub</span>
          </Link>
          <nav className="mt-5 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: "exact" in item ? item.exact : false }}
                activeProps={{ className: "bg-secondary text-foreground font-semibold" }}
                inactiveProps={{ className: "text-muted-foreground hover:bg-secondary/60" }}
                className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
