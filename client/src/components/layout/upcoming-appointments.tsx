import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Appointment } from "@shared/schema";
import { 
  Calendar, 
  ChevronRight, 
  Clock, 
  ExternalLink 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format, isAfter, isBefore, addDays, startOfDay } from "date-fns";
import { Link } from "wouter";

export function UpcomingAppointments() {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: [api.appointments.list.path],
  });

  const upcoming = useMemo(() => {
    const now = new Date();
    const twoDaysLater = addDays(now, 2);
    
    return appointments
      .filter((a) => {
        if (a.status !== "SCHEDULED") return false;
        const apptDate = new Date(a.date);
        return isAfter(apptDate, startOfDay(now)) && isBefore(apptDate, startOfDay(addDays(twoDaysLater, 1)));
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments]);

  const closeCount = useMemo(() => {
    const today = startOfDay(new Date());
    const tomorrowEnd = startOfDay(addDays(today, 2));
    return upcoming.filter(a => isBefore(new Date(a.date), tomorrowEnd)).length;
  }, [upcoming]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
            <Calendar className="h-5 w-5" />
            {closeCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-[10px] font-bold text-white rounded-full border-2 border-white flex items-center justify-center">
                {closeCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden shadow-xl border-border">
          <div className="p-4 border-b border-border bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Upcoming Appointments</span>
            </div>
            <Link href="/appointments">
              <span className="text-xs text-primary hover:underline cursor-pointer font-medium flex items-center gap-1">
                View all <ChevronRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {upcoming.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No appointments in the next 2 days</p>
              </div>
            ) : (
              upcoming.map((appt) => {
                const isClose = isBefore(new Date(appt.date), addDays(new Date(), 1));
                return (
                  <DropdownMenuItem
                    key={appt.id}
                    className={`p-4 cursor-pointer focus:bg-slate-50 border-b border-border last:border-0 ${
                      isClose ? "bg-red-50/30" : ""
                    }`}
                    onClick={() => setSelectedAppointment(appt)}
                  >
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{appt.customerName}</span>
                        {isClose && (
                          <Badge variant="destructive" className="text-[10px] h-4 px-1.5 leading-none">
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {format(new Date(appt.date), "MMM dd")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {appt.time}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-slate-600 truncate">
                        {appt.serviceType}
                      </span>
                    </div>
                  </DropdownMenuItem>
                );
              })
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={!!selectedAppointment} onOpenChange={(open) => !open && setSelectedAppointment(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Appointment Details
            </DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</p>
                  <p className="font-semibold text-slate-900">{selectedAppointment.customerName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</p>
                  <p className="font-medium text-slate-700">{selectedAppointment.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Vehicle</p>
                  <p className="font-medium text-slate-700">{selectedAppointment.vehicleInfo}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Service</p>
                  <p className="font-medium text-slate-700">{selectedAppointment.serviceType}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</p>
                  <p className="font-medium text-slate-700">{format(new Date(selectedAppointment.date), "MMMM dd, yyyy")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</p>
                  <p className="font-medium text-slate-700">{selectedAppointment.time}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border flex justify-between items-center">
                <Badge className="bg-blue-100 text-blue-700 border-0">{selectedAppointment.status}</Badge>
                <Link href="/appointments">
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" /> Manage
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
