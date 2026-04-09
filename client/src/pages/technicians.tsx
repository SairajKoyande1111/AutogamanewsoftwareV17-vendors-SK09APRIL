import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Wrench, Phone as PhoneIcon, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Technician } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function TechniciansPage() {
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: technicians = [] } = useQuery<Technician[]>({
    queryKey: [api.technicians.list.path],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/technicians/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.technicians.list.path] });
      toast({ title: "Success", description: "Technician deleted successfully" });
    },
  });

  const filteredTechnicians = technicians
    .filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.specialty.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "specialty") return a.specialty.localeCompare(b.specialty);
      return 0;
    });

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
              Technicians
            </h1>
            <p className="text-muted-foreground">
              Manage notes and reminders linked to customers
            </p>
          </div>
          <Button onClick={() => setIsAddOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Technician
          </Button>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by Name" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="specialty">Sort by Specialty</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredTechnicians.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Wrench className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg">No technicians yet. Add your first technician!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTechnicians.map((technician) => (
              <Card key={technician.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{technician.name}</h3>
                      <p className="text-sm text-muted-foreground">{technician.specialty}</p>
                      {technician.phone && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                          <PhoneIcon className="h-3 w-3" />
                          {technician.phone}
                        </div>
                      )}
                      <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                        technician.status === "active" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {technician.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditingTechnician(technician)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => {
                        if (confirm("Are you sure you want to delete this technician?")) {
                          deleteMutation.mutate(technician.id!);
                        }
                      }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Technician</DialogTitle>
            </DialogHeader>
            <TechnicianForm onClose={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingTechnician} onOpenChange={(open) => !open && setEditingTechnician(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Technician</DialogTitle>
            </DialogHeader>
            {editingTechnician && (
              <TechnicianForm 
                onClose={() => setEditingTechnician(null)} 
                initialData={editingTechnician} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

function TechnicianForm({ onClose, initialData }: { onClose: () => void; initialData?: Technician }) {
  const { toast } = useToast();
  const [name, setName] = useState(initialData?.name || "");
  const [specialty, setSpecialty] = useState(initialData?.specialty || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [status, setStatus] = useState<"active" | "inactive">(initialData?.status || "active");
  const [phoneError, setPhoneError] = useState("");

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (initialData?.id) {
        return apiRequest("PATCH", `/api/technicians/${initialData.id}`, data);
      }
      return apiRequest("POST", api.technicians.create.path, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.technicians.list.path] });
      toast({ 
        title: "Success", 
        description: initialData ? "Technician updated successfully" : "Technician added successfully" 
      });
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save technician", variant: "destructive" });
    }
  });

  const validatePhone = (value: string) => {
    if (!value) {
      setPhoneError("");
      return true;
    }
    if (!/^\d+$/.test(value)) {
      setPhoneError("Phone number must contain only digits");
      return false;
    }
    if (value.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhone(value);
    validatePhone(value);
  };

  const handleSubmit = () => {
    if (!name.trim() || !specialty.trim()) {
      toast({ title: "Error", description: "Name and Specialty are required", variant: "destructive" });
      return;
    }
    if (phone && !validatePhone(phone)) {
      return;
    }
    mutation.mutate({ name, specialty, phone: phone || undefined, status });
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Name <span className="text-destructive">*</span></Label>
        <Input 
          placeholder="Technician name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
      </div>
      <div className="space-y-2">
        <Label>Specialty <span className="text-destructive">*</span></Label>
        <Input 
          placeholder="e.g., General Mechanic, Detailing Expert" 
          value={specialty} 
          onChange={(e) => setSpecialty(e.target.value)} 
        />
      </div>
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input 
          placeholder="9876543210" 
          value={phone}
          maxLength={10}
          onChange={handlePhoneChange}
          className={phoneError ? "border-destructive" : ""}
        />
        {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
      </div>
      <div className="flex items-center justify-between py-2">
        <Label>Status</Label>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${status === "inactive" ? "text-muted-foreground" : "text-muted-foreground/50"}`}>Inactive</span>
          <Switch 
            checked={status === "active"} 
            onCheckedChange={(checked) => setStatus(checked ? "active" : "inactive")}
          />
          <span className={`text-sm ${status === "active" ? "text-green-600 font-medium" : "text-muted-foreground/50"}`}>Active</span>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button onClick={handleSubmit} disabled={mutation.isPending} className="w-full bg-primary hover:bg-primary/90">
          {mutation.isPending ? "Saving..." : (initialData ? "Update Technician" : "Add Technician")}
        </Button>
      </div>
    </div>
  );
}
