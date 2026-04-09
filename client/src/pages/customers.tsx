import { Layout } from "@/components/layout/layout";
import { useQuery } from "@tanstack/react-query";
import { JobCard } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Search, Loader2, Car, Phone, Mail, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();

  const { data: jobCards = [], isLoading } = useQuery<JobCard[]>({
    queryKey: ["/api/job-cards"],
  });

  const customers = useMemo(() => {
    const customerMap = new Map<string, { 
      name: string; 
      phone: string; 
      email?: string; 
      totalSpent: number; 
      totalJobs: number;
      lastVisit: string;
      vehicleCount: number;
      vehicles: Set<string>;
    }>();

    jobCards.forEach(job => {
      const key = job.phoneNumber;
      const existing = customerMap.get(key);
      const vehicleKey = `${job.make}-${job.model}-${job.licensePlate}`;

      if (!existing) {
        customerMap.set(key, {
          name: job.customerName,
          phone: job.phoneNumber,
          email: job.emailAddress,
          totalSpent: job.estimatedCost || 0,
          totalJobs: 1,
          lastVisit: job.date,
          vehicleCount: 1,
          vehicles: new Set([vehicleKey])
        });
      } else {
        existing.totalJobs += 1;
        existing.totalSpent += (job.estimatedCost || 0);
        existing.vehicles.add(vehicleKey);
        existing.vehicleCount = existing.vehicles.size;
        if (new Date(job.date) > new Date(existing.lastVisit)) {
          existing.lastVisit = job.date;
        }
      }
    });

    let result = Array.from(customerMap.values());

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(lower) || 
        c.phone.includes(searchTerm) || 
        (c.email && c.email.toLowerCase().includes(lower))
      );
    }

    return result;
  }, [jobCards, searchTerm]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Customers</h1>
            <p className="text-sm text-slate-500">Manage your customer database</p>
          </div>
          <Button onClick={() => setLocation("/add-job")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search customers..." 
            className="pl-9 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground bg-white rounded-lg border">
              No customers found
            </div>
          ) : (
            customers.map((c, idx) => (
              <Card key={idx} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-lg font-bold text-red-600 shrink-0">
                        {c.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg leading-tight">{c.name}</h3>
                        <p className="text-sm text-slate-500 mt-1">
                          Since {new Date(c.lastVisit).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{c.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="truncate">{c.email || "No email"}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Car className="h-4 w-4 text-slate-400" />
                          <span>{c.vehicleCount} {c.vehicleCount === 1 ? 'vehicle' : 'vehicles'}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{c.totalJobs} total jobs</p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-600 font-bold text-lg">₹{c.totalSpent} <span className="text-xs font-normal text-slate-400">spent</span></p>
                        <button 
                          onClick={() => setLocation(`/customers/${encodeURIComponent(c.phone)}`)}
                          className="text-xs text-red-600 font-semibold flex items-center gap-1 ml-auto mt-1 hover:underline"
                        >
                          View history <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
