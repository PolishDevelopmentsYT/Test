import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Swords, Trophy, History, Cpu, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Navigation() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logged out successfully");
      window.location.href = "/";
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const navItems = [
    { path: "/", label: "Home", icon: null },
    { path: "/arena", label: "Battle Arena", icon: Swords },
    { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { path: "/history", label: "History", icon: History },
    { path: "/models", label: "AI Models", icon: Cpu },
  ];

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="relative">
                <div className="w-10 h-10 border-2 border-primary rounded-lg rotate-45 absolute"></div>
                <div className="w-10 h-10 border-2 border-secondary rounded-lg -rotate-45"></div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">AI BATTLE</h1>
                <p className="text-xs font-mono tracking-wider text-muted-foreground uppercase">Arena</p>
              </div>
            </a>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <a>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="gap-2"
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      {item.label}
                    </Button>
                  </a>
                </Link>
              );
            })}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold">{user.name}</span>
                  <span className="text-xs font-mono text-muted-foreground">{user.email}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <Button asChild size="sm">
                <a href={getLoginUrl()}>Login</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
