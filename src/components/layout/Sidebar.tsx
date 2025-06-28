
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Settings,
  Database,
  Upload,
  MessageSquare,
  Lightbulb,
  CreditCard,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  isActive: boolean;
  isMobileOpen: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, path, isActive, isMobileOpen, onClick }: SidebarItemProps) => {
  return (
    <Link
      to={path}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
      )}
      onClick={onClick}
    >
      <Icon size={20} />
      {isMobileOpen && <span>{label}</span>}
    </Link>
  );
};

export function Sidebar() {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const routes = [
    { path: "/dashboard", label: "Dashboard", icon: BarChart },
    { path: "/inventory", label: "Inventory", icon: Database },
    { path: "/upload", label: "Upload", icon: Upload },
    { path: "/queries", label: "Client Queries", icon: MessageSquare },
    { path: "/insights", label: "AI Insights", icon: Lightbulb },
    { path: "/payments", label: "Payments & Leads", icon: CreditCard },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  return (
    <>
      {/* Mobile toggle button with enhanced visibility and animations */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-diamond-100 hover:bg-diamond-200 text-diamond-700 hover:text-diamond-900 hover:scale-110 transition-all duration-300 shadow-md hover:shadow-lg border border-diamond-200"
        onClick={toggleMobile}
      >
        {isMobileOpen ? <X size={20} className="animate-fade-in" /> : <Menu size={20} className="animate-fade-in" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-sidebar flex flex-col w-16 transition-all duration-300 md:relative md:w-64",
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 md:w-16 md:hover:w-64"
        )}
      >
        <div className="p-4 border-b border-sidebar-border flex items-center h-16">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-diamond-500 flex items-center justify-center text-white font-bold">
              D
            </div>
            <h1 className={cn(
              "font-bold text-sidebar-foreground whitespace-nowrap transition-opacity",
              isMobileOpen ? "opacity-100" : "opacity-0 md:group-hover:opacity-100"
            )}>
              Diamond Muzzle
            </h1>
          </div>
        </div>

        <nav className="flex-1 py-6 px-2 space-y-1 overflow-y-auto">
          {routes.map((route) => (
            <SidebarItem
              key={route.path}
              icon={route.icon}
              label={route.label}
              path={route.path}
              isActive={location.pathname === route.path}
              isMobileOpen={isMobileOpen}
              onClick={() => setIsMobileOpen(false)}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className={cn(
            "text-xs text-sidebar-foreground/70 transition-opacity",
            isMobileOpen ? "opacity-100" : "opacity-0 md:group-hover:opacity-100"
          )}>
            v1.0.0
          </div>
        </div>
      </aside>
    </>
  );
}
