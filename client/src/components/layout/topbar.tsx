import { Bell, Menu, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpcomingAppointments } from "./upcoming-appointments";
import { Notifications } from "./notifications";

interface TopbarProps {
  toggleSidebar?: () => void;
}

export function Topbar({ toggleSidebar }: TopbarProps) {
  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 lg:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 lg:hidden">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-6 w-6 text-foreground" />
        </Button>
        <span className="font-display font-bold text-xl tracking-tight">
          Auto<span className="text-primary">Gamma</span>
        </span>
      </div>
      
      {/* Spacer for desktop layout where sidebar is fixed */}
      <div className="hidden lg:block"></div>

      <div className="flex items-center gap-4">
        <UpcomingAppointments />
        <Notifications />
        
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-foreground">Admin User</p>
            <p className="text-xs text-muted-foreground">Manager</p>
          </div>
          <div className="h-9 w-9 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
            <UserCircle className="h-6 w-6" />
          </div>
        </div>
      </div>
    </header>
  );
}
