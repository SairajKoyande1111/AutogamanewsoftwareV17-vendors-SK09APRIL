import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Clock, Package, ClipboardList, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format, subDays, isAfter } from "date-fns";
import { Link } from "wouter";
import { JobCard, Inquiry } from "@shared/schema";

export function Notifications() {
  const { data: jobCards = [] } = useQuery<JobCard[]>({
    queryKey: ["/api/job-cards"],
  });

  const { data: inquiries = [] } = useQuery<Inquiry[]>({
    queryKey: ["/api/inquiries"],
  });

  const notifications = useMemo(() => {
    const list: any[] = [];
    const now = new Date();
    const threeDaysAgo = subDays(now, 3);

    // Recent Pending Job Cards
    jobCards
      .filter(j => j.status === "Pending" && isAfter(new Date(j.date), threeDaysAgo))
      .forEach(j => {
        list.push({
          id: `job-${j.id}`,
          type: "JOB",
          title: "New Job Card",
          description: `${j.customerName} - ${j.jobNo}`,
          time: new Date(j.date),
          href: `/job-cards/${j.id}`,
          icon: ClipboardList,
          color: "text-blue-600"
        });
      });

    // Recent Inquiries
    inquiries
      .filter(i => i.status === "NEW" && isAfter(new Date(i.createdAt), threeDaysAgo))
      .forEach(i => {
        list.push({
          id: `inq-${i.id}`,
          type: "INQUIRY",
          title: "New Inquiry",
          description: `${i.customerName} (${i.phone})`,
          time: new Date(i.createdAt),
          href: "/inquiry",
          icon: Package,
          color: "text-orange-600"
        });
      });

    return list.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 10);
  }, [jobCards, inquiries]);

  const unreadCount = notifications.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden shadow-xl border-border">
        <div className="p-4 border-b border-border bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Notifications</span>
          </div>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-slate-200">
              {unreadCount} New
            </Badge>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No recent notifications</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <Link key={notif.id} href={notif.href}>
                <DropdownMenuItem className="p-4 cursor-pointer focus:bg-slate-50 border-b border-border last:border-0 flex items-start gap-3">
                  <div className={`mt-1 p-1.5 rounded-full bg-slate-100 ${notif.color}`}>
                    <notif.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col gap-0.5 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm truncate">{notif.title}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
                        <Clock className="h-2.5 w-2.5" />
                        {format(notif.time, "HH:mm")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">{notif.description}</p>
                    <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                      {format(notif.time, "MMM dd")}
                    </span>
                  </div>
                </DropdownMenuItem>
              </Link>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="m-0" />
            <div className="p-2 bg-slate-50/50">
              <Link href="/job-cards">
                <Button variant="ghost" size="sm" className="w-full text-xs text-primary font-medium hover:bg-white flex items-center gap-1">
                  View all activity <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
