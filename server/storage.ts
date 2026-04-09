import mongoose from "mongoose";
import { 
  User, 
  InsertUser, 
  DashboardData, 
  ServiceMaster, 
  InsertServiceMaster, 
  PPFMaster,
  InsertPPFMaster,
  AccessoryMaster,
  InsertAccessoryMaster,
  AccessoryCategory,
  VehicleType,
  Technician,
  InsertTechnician,
  Appointment,
  InsertAppointment,
  JobCard,
  InsertJobCard,
  Inquiry,
  InsertInquiry,
  Invoice,
  Vendor,
  InsertVendor,
  VendorPurchase,
  InsertVendorPurchase,
} from "@shared/schema";
import session from "express-session";
// @ts-ignore
import MongoStore from "connect-mongodb-session";

const MongoDBStore = MongoStore(session);

// Mongoose Schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
});

export const UserModel = mongoose.model("User", userSchema);

const serviceMasterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pricingByVehicleType: [{
    vehicleType: String,
    price: Number
  }]
});

export const ServiceMasterModel = mongoose.model("ServiceMaster", serviceMasterSchema);

const ppfMasterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pricingByVehicleType: [{
    vehicleType: String,
    options: [{
      warrantyName: String,
      price: Number
    }]
  }],
  rolls: [{
    name: String,
    stock: Number
  }]
});

export const PPFMasterModel = mongoose.model("PPFMaster", ppfMasterSchema);

const vehicleTypeSchema = new mongoose.Schema({
  name: { type: String, required: true }
});

export const VehicleTypeModel = mongoose.model("VehicleType", vehicleTypeSchema);

const accessoryCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

export const AccessoryCategoryModel = mongoose.model("AccessoryCategory", accessoryCategorySchema);

const accessoryMasterSchema = new mongoose.Schema({
  category: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

export const AccessoryMasterModel = mongoose.model("AccessoryMaster", accessoryMasterSchema);

const technicianMongoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  phone: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" }
});

export const TechnicianModel = mongoose.model("Technician", technicianMongoSchema);

const appointmentSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  vehicleInfo: { type: String, required: true },
  serviceType: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  priority: { type: String, enum: ["HIGH", "MEDIUM", "LOW"], default: "MEDIUM" },
  status: { type: String, enum: ["SCHEDULED", "DONE", "CANCELLED"], default: "SCHEDULED" },
  cancelReason: { type: String },
});

export const AppointmentModel = mongoose.model("Appointment", appointmentSchema);

const inquiryMongoSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  services: [{
    serviceId: String,
    serviceName: String,
    vehicleType: String,
    warrantyName: String,
    price: Number,
    customerPrice: Number
  }],
  accessories: [{
    accessoryId: String,
    accessoryName: String,
    category: String,
    price: Number,
    customerPrice: Number
  }],
  notes: { type: String },
  ourPrice: { type: Number, default: 0 },
  customerPrice: { type: Number, default: 0 },
  status: { type: String, enum: ["NEW", "FOLLOW_UP", "CONVERTED", "LOST"], default: "NEW" },
  priority: { type: String, enum: ["HIGH", "MEDIUM", "LOW"], default: "MEDIUM" },
  date: { type: String, required: true },
  inquiryId: { type: String, required: true },
  isConverted: { type: Boolean, default: false },
  createdAt: { type: String }
});

export const InquiryModel = mongoose.model("Inquiry", inquiryMongoSchema);

const jobCardMongoSchema = new mongoose.Schema({
  jobNo: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  emailAddress: { type: String },
  referralSource: { type: String },
  referrerName: { type: String },
  referrerPhone: { type: String },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: String },
  licensePlate: { type: String, required: true },
  vin: { type: String },
  services: [{ id: String, name: String, price: Number, technician: String, business: { type: String, default: "Auto Gamma" } }],
  ppfs: [{ id: String, name: String, price: Number, technician: String, rollId: String, rollUsed: Number, business: { type: String, default: "Auto Gamma" } }],
  accessories: [{ id: String, name: String, price: Number, quantity: Number, business: { type: String, default: "Auto Gamma" } }],
  laborCharge: { type: Number, default: 0 },
  laborBusiness: { type: String, default: "Auto Gamma" },
  autoGammaDiscount: { type: Number, default: 0 },
  agnxDiscount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  gst: { type: Number, default: 18 },
  serviceNotes: { type: String },
  status: { type: String, enum: ["Pending", "In Progress", "Completed", "Cancelled"], default: "Pending" },
  date: { type: String, required: true },
  estimatedCost: { type: Number, required: true },
  technician: { type: String },
  vehicleType: { type: String },
  isPaid: { type: Boolean, default: false },
  payments: [{
    amount: Number,
    method: String,
    date: String
  }]
});

export const JobCardModel = mongoose.model("JobCard", jobCardMongoSchema);

const invoiceMongoSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  jobCardId: { type: String, required: true },
  business: { type: String, enum: ["Auto Gamma", "AGNX"], required: true },
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  emailAddress: { type: String },
  vehicleInfo: { type: String },
  vehicleMake: { type: String },
  vehicleModel: { type: String },
  vehicleYear: { type: String },
  licensePlate: { type: String },
  vehicleType: { type: String },
  items: [{
    name: String,
    price: Number,
    quantity: { type: Number, default: 1 },
    type: { type: String, enum: ["Service", "PPF", "Accessory", "Labor"] },
    category: String,
    warranty: String,
    vehicleType: String,
    rollUsed: Number,
    technician: String
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  laborCharge: { type: Number, default: 0 },
  gstPercentage: { type: Number, default: 18 },
  gstAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  date: { type: String, required: true },
  isPaid: { type: Boolean, default: false },
  paymentMethod: { type: String },
  paymentDate: { type: String },
  payments: [{
    amount: Number,
    method: String,
    date: String
  }]
});

export const InvoiceModel = mongoose.model("Invoice", invoiceMongoSchema);

const ticketMongoSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  note: { type: String, required: true },
  createdAt: { type: String, required: true }
});

export const TicketModel = mongoose.model("Ticket", ticketMongoSchema);

const oldCustomerMongoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  notes: { type: String, default: "NA" },
  createdAt: { type: String, required: true }
});

export const OldCustomerModel = mongoose.model("OldCustomer", oldCustomerMongoSchema);

const vendorMongoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactPerson: { type: String, default: "" },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  address: { type: String, default: "" },
  category: { type: String, default: "" },
  notes: { type: String, default: "" },
  createdAt: { type: String, required: true },
});

export const VendorModel = mongoose.model("Vendor", vendorMongoSchema);

const vendorPurchaseMongoSchema = new mongoose.Schema({
  vendorId: { type: String, required: true },
  vendorName: { type: String, default: "" },
  items: [{
    name: String,
    quantity: Number,
    unit: { type: String, default: "pcs" },
    unitPrice: Number,
  }],
  totalAmount: { type: Number, default: 0 },
  purchaseDate: { type: String, required: true },
  receivedDate: { type: String, default: "" },
  status: { type: String, enum: ["ordered", "received", "partial"], default: "ordered" },
  notes: { type: String, default: "" },
  createdAt: { type: String, required: true },
});

export const VendorPurchaseModel = mongoose.model("VendorPurchase", vendorPurchaseMongoSchema);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getDashboardData(): Promise<DashboardData>;
  
  // Masters
  getServices(): Promise<ServiceMaster[]>;
  createService(service: InsertServiceMaster): Promise<ServiceMaster>;
  updateService(id: string, service: Partial<ServiceMaster>): Promise<ServiceMaster | undefined>;
  deleteService(id: string): Promise<boolean>;

  getPPFs(): Promise<PPFMaster[]>;
  createPPF(ppf: InsertPPFMaster): Promise<PPFMaster>;
  updatePPF(id: string, ppf: Partial<PPFMaster>): Promise<PPFMaster | undefined>;
  deletePPF(id: string): Promise<boolean>;

  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  createInvoice(invoice: any): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: string): Promise<boolean>;
  getCustomers(): Promise<any[]>;

  getAccessories(): Promise<AccessoryMaster[]>;
  createAccessory(accessory: InsertAccessoryMaster): Promise<AccessoryMaster>;
  updateAccessory(id: string, accessory: Partial<AccessoryMaster>): Promise<AccessoryMaster | undefined>;
  deleteAccessory(id: string): Promise<boolean>;

  getVehicleTypes(): Promise<VehicleType[]>;
  createVehicleType(name: string): Promise<VehicleType>;

  // Accessory Categories
  getAccessoryCategories(): Promise<AccessoryCategory[]>;
  createAccessoryCategory(name: string): Promise<AccessoryCategory>;
  updateAccessoryCategory(id: string, name: string): Promise<AccessoryCategory | undefined>;
  deleteAccessoryCategory(id: string): Promise<boolean>;

  // Technicians
  getTechnicians(): Promise<Technician[]>;
  createTechnician(technician: InsertTechnician): Promise<Technician>;
  updateTechnician(id: string, technician: Partial<Technician>): Promise<Technician | undefined>;
  deleteTechnician(id: string): Promise<boolean>;

  // User
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;

  // Appointments
  getAppointments(): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: string): Promise<boolean>;

  // Inquiries
  getInquiries(): Promise<Inquiry[]>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  updateInquiry(id: string, inquiry: Partial<Inquiry>): Promise<Inquiry | undefined>;
  deleteInquiry(id: string): Promise<boolean>;

  // Tickets
  getTickets(): Promise<any[]>;
  createTicket(ticket: any): Promise<any>;
  updateTicket(id: string, ticket: any): Promise<any | undefined>;
  deleteTicket(id: string): Promise<boolean>;

  // Job Cards
  getJobCard(id: string): Promise<JobCard | undefined>;
  getJobCards(): Promise<JobCard[]>;
  createJobCard(jobCard: InsertJobCard): Promise<JobCard>;
  updateJobCard(id: string, jobCard: Partial<JobCard>): Promise<JobCard | undefined>;
  deleteJobCard(id: string): Promise<boolean>;

  // Old Customers
  getOldCustomers(page: number, limit: number): Promise<{ customers: any[], total: number }>;
  createOldCustomer(customer: any): Promise<any>;

  // Vendor Management
  getVendors(): Promise<Vendor[]>;
  getVendor(id: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: string, vendor: Partial<InsertVendor>): Promise<Vendor | undefined>;
  deleteVendor(id: string): Promise<boolean>;

  getVendorPurchases(vendorId?: string): Promise<VendorPurchase[]>;
  getVendorPurchase(id: string): Promise<VendorPurchase | undefined>;
  createVendorPurchase(purchase: InsertVendorPurchase): Promise<VendorPurchase>;
  updateVendorPurchase(id: string, purchase: Partial<InsertVendorPurchase>): Promise<VendorPurchase | undefined>;
  deleteVendorPurchase(id: string): Promise<boolean>;

  sessionStore: session.Store;
}

export class MongoStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MongoDBStore({
      uri: process.env.MONGODB_URI || "mongodb://localhost:27017/autogamma",
      collection: "sessions",
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id);
    if (!user) return undefined;
    return { 
      id: user._id.toString(), 
      email: user.email, 
      password: user.password as string | undefined, 
      name: user.name as string | undefined 
    };
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email });
    if (!user) return undefined;
    return { 
      id: user._id.toString(), 
      email: user.email, 
      password: user.password as string | undefined, 
      name: user.name as string | undefined 
    };
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = new UserModel(insertUser);
    await user.save();
    return { id: user._id.toString(), email: user.email, password: user.password };
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const user = await UserModel.findByIdAndUpdate(id, data, { new: true });
    if (!user) return undefined;
    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password as string | undefined,
      name: user.name as string | undefined
    };
  }

  async getDashboardData(): Promise<DashboardData> {
    const inquiries = await InquiryModel.find();
    const jobCards = await JobCardModel.find();
    const invoices = await InvoiceModel.find();
    const tickets = await TicketModel.find();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const inquiriesToday = await InquiryModel.countDocuments({
      createdAt: { $gte: startOfToday.toISOString() }
    });

    // Calculate total balance from all invoices (partial + unpaid)
    const totalBalance = invoices.reduce((acc, inv) => {
      const paidAmount = (inv.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
      const balance = inv.totalAmount - paidAmount;
      return acc + (balance > 0 ? balance : 0);
    }, 0);

    const twoDaysLater = new Date();
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);
    twoDaysLater.setHours(23, 59, 59, 999);

    const upcomingAppointments = await AppointmentModel.find({
      status: "SCHEDULED",
      date: { 
        $gte: new Date().toISOString().split('T')[0],
        $lte: twoDaysLater.toISOString().split('T')[0]
      }
    }).sort({ date: 1, time: 1 }).limit(10);

    return {
      stats: [
        { label: "Inquiries Today", value: inquiriesToday.toString(), subtext: "Inquiries received today", icon: "MessageCircle" },
        { label: "Balance Amount", value: totalBalance.toLocaleString(), subtext: "Unpaid + Partial balances", icon: "IndianRupee" },
      ],
      salesTrends: [],
      customerStatus: [],
      customerGrowth: [],
      inventoryByCategory: [],
      activeJobs: tickets.map(t => ({
        id: t._id.toString(),
        customerName: t.customerName,
        vehicleInfo: t.note,
        status: "Open",
      })),
      upcomingAppointments: upcomingAppointments.map(a => ({
        id: a._id.toString(),
        customerName: a.customerName,
        vehicleInfo: a.vehicleInfo,
        date: a.date,
        time: a.time,
        serviceType: a.serviceType,
      })),
    };
  }

  async getServices(): Promise<ServiceMaster[]> {
    const services = await ServiceMasterModel.find();
    return services.map(s => ({
      id: s._id.toString(),
      name: s.name,
      pricingByVehicleType: s.pricingByVehicleType as any
    }));
  }

  async createService(service: InsertServiceMaster): Promise<ServiceMaster> {
    const s = new ServiceMasterModel(service);
    await s.save();
    return {
      id: s._id.toString(),
      name: s.name,
      pricingByVehicleType: s.pricingByVehicleType as any
    };
  }

  async updateService(id: string, service: Partial<ServiceMaster>): Promise<ServiceMaster | undefined> {
    const s = await ServiceMasterModel.findByIdAndUpdate(id, service, { new: true });
    if (!s) return undefined;
    return {
      id: s._id.toString(),
      name: s.name,
      pricingByVehicleType: s.pricingByVehicleType as any
    };
  }

  async deleteService(id: string): Promise<boolean> {
    const result = await ServiceMasterModel.findByIdAndDelete(id);
    return !!result;
  }

  async getPPFs(): Promise<PPFMaster[]> {
    const ppfs = await PPFMasterModel.find();
    return ppfs.map(s => ({
      id: s._id.toString(),
      name: s.name,
      pricingByVehicleType: s.pricingByVehicleType as any,
      rolls: s.rolls as any
    }));
  }

  async createPPF(ppf: InsertPPFMaster): Promise<PPFMaster> {
    const s = new PPFMasterModel(ppf);
    await s.save();
    return {
      id: s._id.toString(),
      name: s.name,
      pricingByVehicleType: s.pricingByVehicleType as any,
      rolls: s.rolls as any
    };
  }

  async updatePPF(id: string, ppf: Partial<PPFMaster>): Promise<PPFMaster | undefined> {
    const s = await PPFMasterModel.findByIdAndUpdate(id, ppf, { new: true });
    if (!s) return undefined;
    return {
      id: s._id.toString(),
      name: s.name,
      pricingByVehicleType: s.pricingByVehicleType as any,
      rolls: s.rolls as any
    };
  }

  async deletePPF(id: string): Promise<boolean> {
    const result = await PPFMasterModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAccessories(): Promise<AccessoryMaster[]> {
    const accessories = await AccessoryMasterModel.find();
    return accessories.map(a => ({
      id: a._id.toString(),
      category: a.category,
      name: a.name,
      quantity: a.quantity,
      price: a.price
    }));
  }

  async createAccessory(accessory: InsertAccessoryMaster): Promise<AccessoryMaster> {
    const a = new AccessoryMasterModel(accessory);
    await a.save();
    return {
      id: a._id.toString(),
      category: a.category,
      name: a.name,
      quantity: a.quantity,
      price: a.price
    };
  }

  async updateAccessory(id: string, accessory: Partial<AccessoryMaster>): Promise<AccessoryMaster | undefined> {
    const a = await AccessoryMasterModel.findByIdAndUpdate(id, accessory, { new: true });
    if (!a) return undefined;
    return {
      id: a._id.toString(),
      category: a.category,
      name: a.name,
      quantity: a.quantity,
      price: a.price
    };
  }

  async deleteAccessory(id: string): Promise<boolean> {
    const result = await AccessoryMasterModel.findByIdAndDelete(id);
    return !!result;
  }

  async getVehicleTypes(): Promise<VehicleType[]> {
    const types = await VehicleTypeModel.find();
    return types.map(t => ({
      id: t._id.toString(),
      name: t.name
    }));
  }

  async createVehicleType(name: string): Promise<VehicleType> {
    const t = new VehicleTypeModel({ name });
    await t.save();
    return {
      id: t._id.toString(),
      name: t.name
    };
  }

  async getAccessoryCategories(): Promise<AccessoryCategory[]> {
    const categories = await AccessoryCategoryModel.find();
    return categories.map(c => ({
      id: c._id.toString(),
      name: c.name
    }));
  }

  async createAccessoryCategory(name: string): Promise<AccessoryCategory> {
    const c = new AccessoryCategoryModel({ name });
    await c.save();
    return {
      id: c._id.toString(),
      name: c.name
    };
  }

  async updateAccessoryCategory(id: string, name: string): Promise<AccessoryCategory | undefined> {
    const c = await AccessoryCategoryModel.findByIdAndUpdate(id, { name }, { new: true });
    if (!c) return undefined;
    return {
      id: c._id.toString(),
      name: c.name
    };
  }

  async deleteAccessoryCategory(id: string): Promise<boolean> {
    const result = await AccessoryCategoryModel.findByIdAndDelete(id);
    return !!result;
  }

  async getTechnicians(): Promise<Technician[]> {
    const technicians = await TechnicianModel.find();
    return technicians.map(t => ({
      id: t._id.toString(),
      name: t.name,
      specialty: t.specialty,
      phone: t.phone || undefined,
      status: t.status as "active" | "inactive"
    }));
  }

  async createTechnician(technician: InsertTechnician): Promise<Technician> {
    const t = new TechnicianModel(technician);
    await t.save();
    return {
      id: t._id.toString(),
      name: t.name,
      specialty: t.specialty,
      phone: t.phone || undefined,
      status: t.status as "active" | "inactive"
    };
  }

  async updateTechnician(id: string, technician: Partial<Technician>): Promise<Technician | undefined> {
    const t = await TechnicianModel.findByIdAndUpdate(id, technician, { new: true });
    if (!t) return undefined;
    return {
      id: t._id.toString(),
      name: t.name,
      specialty: t.specialty,
      phone: t.phone || undefined,
      status: t.status as "active" | "inactive"
    };
  }

  async deleteTechnician(id: string): Promise<boolean> {
    const result = await TechnicianModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAppointments(): Promise<Appointment[]> {
    const appointments = await AppointmentModel.find();
    return appointments.map(a => ({
      id: a._id.toString(),
      customerName: a.customerName,
      phone: a.phone,
      vehicleInfo: a.vehicleInfo,
      serviceType: a.serviceType,
      date: a.date,
      time: a.time,
      priority: a.priority as any,
      status: a.status as any,
      cancelReason: a.cancelReason || undefined
    }));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const a = new AppointmentModel(appointment);
    await a.save();
    return {
      id: a._id.toString(),
      customerName: a.customerName,
      phone: a.phone,
      vehicleInfo: a.vehicleInfo,
      serviceType: a.serviceType,
      date: a.date,
      time: a.time,
      priority: a.priority as any,
      status: a.status as any
    };
  }

  async updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment | undefined> {
    const a = await AppointmentModel.findByIdAndUpdate(id, appointment, { new: true });
    if (!a) return undefined;
    return {
      id: a._id.toString(),
      customerName: a.customerName,
      phone: a.phone,
      vehicleInfo: a.vehicleInfo,
      serviceType: a.serviceType,
      date: a.date,
      time: a.time,
      priority: a.priority as any,
      status: a.status as any,
      cancelReason: a.cancelReason || undefined
    };
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const result = await AppointmentModel.findByIdAndDelete(id);
    return !!result;
  }

  // Job Cards
  async getJobCard(id: string): Promise<JobCard | undefined> {
    const j = await JobCardModel.findById(id);
    if (!j) return undefined;
    return {
      ...j.toObject(),
      id: j._id.toString(),
      services: (j as any).services?.map((s: any) => ({
        ...s,
        id: s.id || s._id?.toString() || s.serviceId,
        serviceId: s.serviceId || s.id || s._id?.toString(),
        name: s.name || s.serviceName || "Unnamed Service",
        price: s.price || 0
      })) || [],
      ppfs: (j as any).ppfs?.map((p: any) => ({
        ...p,
        id: p.id || p._id?.toString() || p.ppfId || p.pId,
        ppfId: p.ppfId || p.id || p._id?.toString() || p.pId,
        name: p.name || p.ppfName || "Unnamed PPF",
        price: p.price || 0
      })) || [],
      accessories: (j as any).accessories?.map((a: any) => ({
        ...a,
        id: a.id || a._id?.toString() || a.accessoryId,
        accessoryId: a.accessoryId || a.id || a._id?.toString(),
        name: a.name || a.accessoryName || "Unnamed Accessory",
        price: a.price || 0,
        quantity: a.quantity || 1
      })) || [],
      vehicleType: (j as any).vehicleType
    } as JobCard;
  }

  async getJobCards(): Promise<JobCard[]> {
    const jobs = await JobCardModel.find().sort({ date: -1 });
    return jobs.map(j => ({
      ...j.toObject(),
      id: j._id.toString(),
      services: (j as any).services?.map((s: any) => ({
        ...s,
        id: s.id || s._id?.toString() || s.serviceId,
        serviceId: s.serviceId || s.id || s._id?.toString(),
        name: s.name || s.serviceName || "Unnamed Service",
        price: s.price || 0
      })) || [],
      ppfs: (j as any).ppfs?.map((p: any) => ({
        ...p,
        id: p.id || p._id?.toString() || p.ppfId || p.pId,
        ppfId: p.ppfId || p.id || p._id?.toString() || p.pId,
        name: p.name || p.ppfName || "Unnamed PPF",
        price: p.price || 0
      })) || [],
      accessories: (j as any).accessories?.map((a: any) => ({
        ...a,
        id: a.id || a._id?.toString() || a.accessoryId,
        accessoryId: a.accessoryId || a.id || a._id?.toString(),
        name: a.name || a.accessoryName || "Unnamed Accessory",
        price: a.price || 0,
        quantity: a.quantity || 1
      })) || [],
      vehicleType: (j as any).vehicleType
    })) as JobCard[];
  }

  async getCustomers(): Promise<any[]> {
    try {
      // Fetch latest job cards and old customers
      const [jobCards, oldCustomers] = await Promise.all([
        JobCardModel.find({}, 'customerName phoneNumber emailAddress date').sort({ date: -1 }).limit(100),
        OldCustomerModel.find({}, 'name number createdAt').sort({ createdAt: -1 }).limit(100)
      ]);

      const customersMap = new Map();

      // Merge and sort by latest activity
      const allEntries = [
        ...jobCards.map(jc => ({
          id: jc._id.toString(),
          name: jc.customerName,
          phone: jc.phoneNumber,
          email: jc.emailAddress,
          timestamp: jc.date
        })),
        ...oldCustomers.map(oc => ({
          id: oc._id.toString(),
          name: oc.name,
          phone: oc.number,
          email: "",
          timestamp: oc.createdAt
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      allEntries.forEach(entry => {
        if (!customersMap.has(entry.phone)) {
          customersMap.set(entry.phone, entry);
        }
      });

      return Array.from(customersMap.values());
    } catch (error) {
      console.error("Error in getCustomers:", error);
      throw error;
    }
  }

  async getJobCardsByPhone(phone: string): Promise<JobCard | null> {
    try {
      const jobCard = await JobCardModel.findOne({ phoneNumber: phone })
        .sort({ date: -1 })
        .select('customerName phoneNumber emailAddress make model year licensePlate vehicleType');
      return jobCard ? jobCard.toObject() : null;
    } catch (error) {
      console.error("Error fetching job card by phone:", error);
      return null;
    }
  }

  async getOldCustomers(page: number, limit: number): Promise<{ customers: any[], total: number }> {
    const skip = (page - 1) * limit;
    const [customers, total] = await Promise.all([
      OldCustomerModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      OldCustomerModel.countDocuments()
    ]);
    return {
      customers: customers.map(c => ({ ...c.toObject(), id: c._id.toString() })),
      total
    };
  }

  async createOldCustomer(customer: any): Promise<any> {
    const oc = new OldCustomerModel({
      ...customer,
      createdAt: new Date().toISOString()
    });
    await oc.save();
    return { ...oc.toObject(), id: oc._id.toString() };
  }

  async createJobCard(jobCard: InsertJobCard): Promise<JobCard> {
    const year = new Date().getFullYear();
    let jobNo = jobCard.jobNo;

    if (!jobNo) {
      const count = await JobCardModel.countDocuments();
      jobNo = `JC-${year}-${(count + 1).toString().padStart(3, "0")}`;
    }

    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const existing = await JobCardModel.findOne({ jobNo });
      if (!existing) break;

      const parts = jobNo.split("-");
      if (parts.length === 3) {
        const num = parseInt(parts[2]);
        jobNo = `JC-${parts[1]}-${(num + 1).toString().padStart(3, "0")}`;
      } else {
        jobNo = `${jobNo}-${Math.floor(Math.random() * 1000)}`;
      }
      attempts++;
    }

    const j = new JobCardModel({
      ...jobCard,
      jobNo,
      date: jobCard.date || new Date().toISOString()
    });
    await j.save();

    // Generate invoices for new job card
    const businesses = ["Auto Gamma", "AGNX"] as const;
    const yearInvoice = new Date().getFullYear();

    for (const biz of businesses) {
      const bizItems: any[] = [];
      let bizLaborCharge = 0;

      j.services?.forEach((s: any) => {
        if (s.business === biz) {
          bizItems.push({
            name: s.name,
            price: s.price,
            type: "Service",
            technician: s.technician,
            vehicleType: (j as any).vehicleType
          });
        }
      });

      j.ppfs?.forEach((p: any) => {
        if (p.business === biz) {
          bizItems.push({
            name: p.name,
            price: p.price,
            type: "PPF",
            warranty: p.warranty || p.warrantyName,
            vehicleType: (j as any).vehicleType,
            rollUsed: p.rollUsed,
            technician: p.technician,
            category: p.ppfId || p.id
          });
        }
      });

        // Accessories with category
        j.accessories?.forEach((a: any) => {
          if (a.business === biz) {
            bizItems.push({
              name: a.name,
              price: a.price,
              quantity: a.quantity || 1,
              type: "Accessory",
              category: a.accessoryId || a.id
            });
          }
        });

      if ((j as any).laborBusiness === biz && j.laborCharge > 0) {
        bizLaborCharge = j.laborCharge;
        bizItems.push({ name: "Labor Charge", price: j.laborCharge, type: "Labor" });
      }

      if (bizItems.length > 0) {
        const itemsSubtotal = bizItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
        
        let discountAmount = 0;
        const autoGammaDiscount = (j as any).autoGammaDiscount || 0;
        const agnxDiscount = (j as any).agnxDiscount || 0;
        const totalDiscount = j.discount || 0;

        const bizCount = [
          ...(j.services || []), 
          ...(j.ppfs || []), 
          ...(j.accessories || [])
        ].reduce((acc, item) => acc.add((item as any).business), new Set<string>()).size;

        if (biz === "Auto Gamma") {
          discountAmount = autoGammaDiscount || (bizCount === 1 ? totalDiscount : 0);
        } else {
          discountAmount = agnxDiscount || (bizCount === 1 ? totalDiscount : 0);
        }

        const subtotalAfterDiscount = itemsSubtotal - discountAmount;
        const gstRate = j.gst || 18;
        
        // Accurate inclusive GST calculation: Total = Base + (Base * Rate/100)
        // Base = Total / (1 + Rate/100)
        // GST = Total - Base
        const basePrice = subtotalAfterDiscount / (1 + gstRate / 100);
        const gstAmount = subtotalAfterDiscount - basePrice;
        const totalAmount = subtotalAfterDiscount;

        const invCount = await InvoiceModel.countDocuments({ business: biz });
        const bizPrefix = biz === "Auto Gamma" ? "AG" : "AGNX";
        const invoiceNo = `${bizPrefix}-${yearInvoice}-${(invCount + 1).toString().padStart(4, "0")}`;

        const inv = new InvoiceModel({
          invoiceNo,
          jobCardId: j._id.toString(),
          business: biz,
          customerName: j.customerName,
          phoneNumber: j.phoneNumber,
          emailAddress: j.emailAddress,
          vehicleInfo: `${j.year || "NA"} ${j.make} ${j.model}`,
          vehicleMake: j.make,
          vehicleModel: j.model,
          vehicleYear: j.year || "NA",
          licensePlate: j.licensePlate,
          vehicleType: (j as any).vehicleType,
          items: bizItems,
          subtotal: itemsSubtotal,
          discount: discountAmount,
          laborCharge: bizLaborCharge,
          gstPercentage: j.gst,
          gstAmount,
          totalAmount,
          date: j.date,
          isPaid: (j as any).isPaid || false,
          payments: (j as any).payments || []
        });
        await inv.save();
      }
    }

    // Deduct accessory stock
    if (jobCard.accessories) {
      for (const acc of jobCard.accessories) {
        const accId = (acc as any).accessoryId || (acc as any).id;
        if (!accId || accId === "undefined") continue;
        const accessory = await AccessoryMasterModel.findById(accId);
        if (accessory) {
          const qtyToDeduct = Number(acc.quantity || 1);
          const currentStock = Number(accessory.quantity || 0);
          const newQty = Math.max(0, currentStock - qtyToDeduct);
          await AccessoryMasterModel.findByIdAndUpdate(accessory._id, { quantity: newQty });
          console.log(`[STORAGE CREATE JOBCARD] Deducted ${qtyToDeduct} from ${accessory.name}. Old stock: ${currentStock}, New stock: ${newQty}`);
        }
      }
    }

    // Deduct PPF roll inventory
    if (jobCard.ppfs && jobCard.ppfs.length > 0) {
      // Check if an invoice exists for each business
      const businesses = ["Auto Gamma", "AGNX"] as const;
      const invoiceStatus = new Map<string, boolean>();
      for (const biz of businesses) {
        // We can't check by ID here since it's a new job card, but we check if an invoice with this jobCardId exists
        // Wait, for createJobCard, the jobCardId is j._id which we just created.
        // So an invoice definitely doesn't exist yet for a brand new job card.
        // However, the user might be referring to "same issue" as in stock is being deducted when it shouldn't.
        // In createJobCard, we always create invoices, so we should always deduct stock.
      }

      for (const ppfItem of jobCard.ppfs) {
        const ppfId = (ppfItem as any).ppfId || ppfItem.id;
        const rollsToDeduct = (ppfItem as any).rollsUsed || (ppfItem.rollId ? [{
          rollId: ppfItem.rollId,
          rollUsed: (ppfItem as any).rollUsed
        }] : []);

        if (rollsToDeduct.length > 0 && ppfId) {
          const ppfMaster = await PPFMasterModel.findById(ppfId);
          if (ppfMaster && ppfMaster.rolls) {
            for (const entry of rollsToDeduct) {
              const roll = (ppfMaster.rolls as any[]).find(r => 
                (r._id && r._id.toString() === entry.rollId) || r.id === entry.rollId
              );
              if (roll && entry.rollUsed > 0) {
                roll.stock -= entry.rollUsed;
              }
            }
            ppfMaster.markModified("rolls");
            await ppfMaster.save();
          }
        }
      }
    }

    return {
      ...j.toObject(),
      id: j._id.toString()
    } as JobCard;
  }

  async updateJobCard(id: string, jobCard: Partial<JobCard>): Promise<JobCard | undefined> {
    const existingJob = await JobCardModel.findById(id);
    if (!existingJob) return undefined;

    // Handle Accessory stock adjustments if accessories are being updated
    if (jobCard.accessories) {
      const oldAccessories = (existingJob.accessories || []) as any[];
      const newAccessories = jobCard.accessories as any[];

      // Map of accessoryId -> quantity
      const oldMap = new Map<string, number>();
      oldAccessories.forEach(a => {
        const accId = String((a as any).accessoryId || (a as any).id || (a as any)._id);
        if (accId && accId !== "undefined") oldMap.set(accId, (oldMap.get(accId) || 0) + (Number(a.quantity) || 1));
      });

      const newMap = new Map<string, number>();
      newAccessories.forEach(a => {
        const accId = String((a as any).accessoryId || (a as any).id || (a as any)._id);
        if (accId && accId !== "undefined") newMap.set(accId, (newMap.get(accId) || 0) + (Number(a.quantity) || 1));
      });

      // Calculate diff and update stock
      const allIds = Array.from(new Set([...Array.from(oldMap.keys()), ...Array.from(newMap.keys())]));
      for (const accId of allIds) {
        const oldQty = oldMap.get(accId) || 0;
        const newQty = newMap.get(accId) || 0;
        const diff = newQty - oldQty;

        if (diff !== 0) {
          const accessory = await AccessoryMasterModel.findById(accId);
          if (accessory) {
            const currentStock = accessory.quantity || 0;
            // When updating, we apply the delta (new - old). 
            // If new > old, diff is positive, stock decreases.
            // If new < old, diff is negative, stock increases.
            const updatedStock = Math.max(0, currentStock - diff);
            accessory.quantity = updatedStock;
            await accessory.save();
            console.log(`[STORAGE UPDATE JOBCARD] Accessory ${accessory.name} stock adjusted by ${-diff}. Old: ${currentStock}, New: ${updatedStock}`);
          }
        }
      }
    }

    // Handle PPF stock adjustments if ppfs are being updated
    if (jobCard.ppfs) {
      const oldPpfs = existingJob.ppfs || [];
      const newPpfs = jobCard.ppfs;

      // Check if an invoice exists for each business
      const businesses = ["Auto Gamma", "AGNX"] as const;
      const invoiceStatus = new Map<string, boolean>();
      for (const biz of businesses) {
        const existingInvoice = await InvoiceModel.findOne({ jobCardId: id, business: biz });
        invoiceStatus.set(biz, !!existingInvoice);
      }

      // 1. Group roll adjustments by ppfId and rollId
      const adjustments = new Map<string, Map<string, number>>();

      // Deduct new quantities only if invoice doesn't exist (it will be created)
      for (const ppfItem of newPpfs) {
        const biz = (ppfItem as any).business || "Auto Gamma";
        const hasInvoice = invoiceStatus.get(biz);
        
        if (hasInvoice) {
          // Invoice already exists, skip deduction for this item
          console.log(`[UPDATE JOB CARD] Invoice exists for ${biz}, skipping PPF deduction for ${ppfItem.name}`);
          continue;
        }

        const ppfId = (ppfItem as any).ppfId || ppfItem.id;
        const rolls = (ppfItem as any).rollsUsed || [];
        
        // If rollsUsed is missing but rollId/rollUsed exist, use them
        if (rolls.length === 0 && (ppfItem as any).rollId) {
          rolls.push({
            rollId: (ppfItem as any).rollId,
            rollUsed: (ppfItem as any).rollUsed || 0
          });
        }

        if (!adjustments.has(ppfId)) adjustments.set(ppfId, new Map());
        const ppfAdjustments = adjustments.get(ppfId)!;

        for (const entry of rolls) {
          if (!entry.rollId) continue;
          const current = ppfAdjustments.get(entry.rollId) || 0;
          ppfAdjustments.set(entry.rollId, current + entry.rollUsed);
        }
      }

      // Add back old quantities - only if we actually deducted them before (i.e., invoice was deleted)
      // If the invoice was deleted, we already replenished the stock in deleteInvoice.
      // So when we "update" the job card, if the invoice is missing, we deduct the NEW quantities.
      // This part is actually correct in the current logic (only deducting for new invoices).
      
      // However, we MUST NOT add back old quantities if the invoice STILL EXISTS, 
      // because we didn't deduct them in this update call, and we shouldn't "re-deduct" or "re-add".
      // The previous code was adding back old quantities UNCONDITIONALLY, which caused issues.
      // I removed the "Add back old quantities" loop in the previous edit, which is correct for the requirement.
      
      // 2. Apply adjustments (delta = new - old)
      // Actually, since we are only deducting for NEW invoices, we don't need to "add back old" in the same way.
      // If we are updating an existing job card that already has an invoice, we do nothing to stock.
      // If we are updating an existing job card that does NOT have an invoice (user deleted it), we deduct the NEW quantities.
      for (const entry of Array.from(adjustments.entries())) {
        const ppfId = entry[0];
        const ppfAdjustments = entry[1];
        const ppfMaster = await PPFMasterModel.findById(ppfId);
        if (ppfMaster && ppfMaster.rolls) {
          let modified = false;
          for (const adjEntry of Array.from(ppfAdjustments.entries())) {
            const rollId = adjEntry[0];
            const delta = adjEntry[1];
            if (delta === 0) continue;
            const roll = (ppfMaster.rolls as any[]).find(r => 
              (r._id && r._id.toString() === rollId) || r.id === rollId
            );
            if (roll) {
              roll.stock -= delta;
              modified = true;
              console.log(`Deducted ${delta} sqft from roll ${roll.name} during JobCard update (new invoice will be created)`);
            }
          }
          if (modified) {
            ppfMaster.markModified("rolls");
            await ppfMaster.save();
          }
        }
      }
    }

    const j = await JobCardModel.findByIdAndUpdate(id, jobCard, { new: true });
    if (!j) return undefined;

    // Update associated invoices with new labor charge, discount, and GST
    const year = new Date().getFullYear();
    const businesses = ["Auto Gamma", "AGNX"] as const;
    
    for (const biz of businesses) {
      const bizItems: any[] = [];
      let bizLaborCharge = 0;
      
      // Services
      j.services?.forEach(s => {
        if ((s as any).business === biz) {
          bizItems.push({ 
            name: s.name, 
            price: s.price, 
            type: "Service",
            technician: (s as any).technician,
            vehicleType: (j as any).vehicleType
          });
        }
      });
      
      // PPFs with detailed info
      j.ppfs?.forEach(p => {
        if ((p as any).business === biz) {
          bizItems.push({ 
            name: p.name, 
            price: p.price, 
            type: "PPF",
            warranty: (p as any).warranty || (p as any).warrantyName,
            vehicleType: (j as any).vehicleType,
            rollUsed: (p as any).rollUsed,
            technician: (p as any).technician,
            category: (p as any).ppfId || p.id // Use ppfId as category for stock replenishment
          });
        }
      });
      
      // Accessories with category
      if (j.accessories) {
        for (const a of j.accessories) {
          if ((a as any).business === biz) {
            const accId = (a as any).accessoryId || (a as any).id;
            let categoryName = (a as any).category || accId;

            // Attempt to resolve category name from AccessoryMaster if it looks like an ID
            if (accId && mongoose.Types.ObjectId.isValid(accId)) {
              const accessory = await AccessoryMasterModel.findById(accId);
              if (accessory) {
                categoryName = accessory.category;
              }
            }

            bizItems.push({ 
              name: a.name, 
              price: a.price, 
              quantity: (a as any).quantity || 1, 
              type: "Accessory",
              category: categoryName
            });
          }
        }
      }
      
      // Labor - tracked separately
      if ((j as any).laborBusiness === biz && j.laborCharge > 0) {
        bizLaborCharge = j.laborCharge;
        bizItems.push({ name: "Labor Charge", price: j.laborCharge, type: "Labor" });
      }

      // Find existing invoice for this business and job card
      const existingInvoice = await InvoiceModel.findOne({ jobCardId: id, business: biz });
      
      if (bizItems.length > 0) {
        const itemsSubtotal = bizItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
        
        let discountAmount = 0;
        const autoGammaDiscount = (j as any).autoGammaDiscount || 0;
        const agnxDiscount = (j as any).agnxDiscount || 0;
        const totalDiscount = j.discount || 0;

        const bizCount = [
          ...(j.services || []), 
          ...(j.ppfs || []), 
          ...(j.accessories || [])
        ].reduce((acc, item) => acc.add((item as any).business), new Set<string>()).size;

        if (biz === "Auto Gamma") {
          discountAmount = autoGammaDiscount || (bizCount === 1 ? totalDiscount : 0);
        } else {
          discountAmount = agnxDiscount || (bizCount === 1 ? totalDiscount : 0);
        }

        const subtotalAfterDiscount = itemsSubtotal - discountAmount;
        const gstRate = j.gst || 18;
        
        // Accurate inclusive GST calculation: Total = Base + (Base * Rate/100)
        // Base = Total / (1 + Rate/100)
        // GST = Total - Base
        const basePrice = subtotalAfterDiscount / (1 + gstRate / 100);
        const gstAmount = subtotalAfterDiscount - basePrice;
        const totalAmount = subtotalAfterDiscount;
        
        if (existingInvoice) {
          // EXCEPTION - Logic for deducting incremental roll quantities when updating job card
          const oldItems = existingInvoice.items || [];
          const newItems = bizItems;

          // Group old rolls for comparison
          const oldRollMap = new Map<string, number>();
          oldItems.forEach(item => {
            if (item.type === "PPF") {
              const key = `${item.category}_${item.name}`;
              oldRollMap.set(key, (oldRollMap.get(key) || 0) + (item.rollUsed || 0));
            }
          });

          // Calculate total roll used for the updated invoice items
          for (const newItem of newItems) {
            if (newItem.type === "PPF") {
              const newItemName = newItem.name || "";
              const rollMatches = Array.from(newItemName.matchAll(/(?:Quantity:\s*)?([\d.]+)sqft\s*\(from\s*(.*?)\)/g));
              
              let totalRollUsedForItem = 0;
              for (const match of rollMatches) {
                const typedMatch = match as RegExpMatchArray;
                const qty = parseFloat(typedMatch[1]);
                totalRollUsedForItem += qty;

                const rollName = typedMatch[2].split(/[,\s)]/)[0].trim();
                
                // Construct a unique key for this specific roll under this PPF category
                const key = `${newItem.category}_${rollName}`;
                
                // Calculate total old quantity for this specific roll from existing invoice
                let oldQty = 0;
                oldItems.forEach(oldItem => {
                  if (oldItem.type === "PPF" && oldItem.category === newItem.category) {
                    const oldItemName = oldItem.name || "";
                    const oldMatches = Array.from(oldItemName.matchAll(/(?:Quantity:\s*)?([\d.]+)sqft\s*\(from\s*(.*?)\)/g));
                    oldMatches.forEach(oldMatch => {
                      if (oldMatch[2].split(/[,\s)]/)[0].trim() === rollName) {
                        oldQty += parseFloat(oldMatch[1]);
                      }
                    });
                  }
                });

                // Only deduct if new quantity is greater than old quantity
                if (qty > oldQty) {
                  const deductQty = qty - oldQty;
                  const ppfId = (newItem as any).category;
                  if (ppfId && mongoose.Types.ObjectId.isValid(ppfId)) {
                    const ppfMaster = await PPFMasterModel.findById(ppfId);
                    if (ppfMaster && ppfMaster.rolls) {
                      const roll = (ppfMaster.rolls as any[]).find(r => 
                        r.name === rollName || (r.name && rollName && r.name.toLowerCase().includes(rollName.toLowerCase()))
                      );

                      if (roll) {
                        roll.stock -= deductQty;
                        ppfMaster.markModified("rolls");
                        await ppfMaster.save();
                        console.log(`[JOB CARD UPDATE EXCEPTION] Deducted incremental ${deductQty} sqft from roll ${roll.name} (Old: ${oldQty}, New: ${qty})`);
                      }
                    }
                  }
                }
              }
              // Update the item's rollUsed field with the sum of all rolls
              newItem.rollUsed = totalRollUsedForItem;
            }
          }

          // Update existing invoice
          await InvoiceModel.findByIdAndUpdate(existingInvoice._id, {
            customerName: j.customerName,
            phoneNumber: j.phoneNumber,
            emailAddress: j.emailAddress,
            vehicleInfo: `${j.year || "NA"} ${j.make} ${j.model}`,
            vehicleMake: j.make,
            vehicleModel: j.model,
            vehicleYear: j.year || "NA",
            licensePlate: j.licensePlate,
            vehicleType: (j as any).vehicleType,
            items: bizItems,
            subtotal: itemsSubtotal,
            discount: discountAmount,
            laborCharge: bizLaborCharge,
            gstPercentage: j.gst,
            gstAmount,
            totalAmount,
            date: j.date,
            isPaid: (j as any).isPaid,
            payments: (j as any).payments || []
          });
        } else {
          // Deduct PPF roll stock before creating the first invoice for this business
          for (const ppfItem of bizItems) {
            if (ppfItem.type === "PPF") {
              const ppfId = (ppfItem as any).category;
              let ppfMaster = null;

              if (ppfId && mongoose.Types.ObjectId.isValid(ppfId)) {
                ppfMaster = await PPFMasterModel.findById(ppfId);
              }

              if (!ppfMaster && ppfItem.name) {
                const ppfName = ppfItem.name.split('(')[0].split('\n')[0].trim();
                ppfMaster = await PPFMasterModel.findOne({
                  name: { $regex: new RegExp(`^${ppfName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
                });
              }

              if (ppfMaster && ppfMaster.rolls) {
                let deducted = false;
                let totalRollUsedForItem = 0;
                
                if (ppfItem.name) {
                  // Fallback: Parse from name if no explicit roll data
                  const rollMatches = Array.from((ppfItem.name || "").matchAll(/(?:Quantity:\s*)?([\d.]+)sqft\s*\(from\s*(.*?)\)/g));
                  for (const match of rollMatches) {
                    const typedMatch = match as RegExpMatchArray;
                    const qty = parseFloat(typedMatch[1]);
                    totalRollUsedForItem += qty;
                    const rawRollName = typedMatch[2].split(/[,\s)]/)[0].trim();
                    const roll = (ppfMaster.rolls as any[]).find(r =>
                      r.name === rawRollName ||
                      (r.name && r.name.toLowerCase().includes(rawRollName.toLowerCase())) ||
                      (rawRollName.toLowerCase().includes(r.name.toLowerCase()))
                    );
                    if (roll && !isNaN(qty)) {
                      roll.stock -= qty;
                      deducted = true;
                      console.log(`Deducted ${qty} sqft from roll ${roll.name} for JobCard update (Parsed from name)`);
                    }
                  }
                  // Update the item's rollUsed field
                  ppfItem.rollUsed = totalRollUsedForItem;
                }

                if (deducted) {
                  ppfMaster.markModified("rolls");
                  await ppfMaster.save();
                }
              }
            }
          }

          // Create new invoice if it doesn't exist
          const invCount = await InvoiceModel.countDocuments({ business: biz });
          const bizPrefix = biz === "Auto Gamma" ? "AG" : "AGNX";
          const invoiceNo = `${bizPrefix}-${year}-${(invCount + 1).toString().padStart(4, "0")}`;
          
          const inv = new InvoiceModel({
            invoiceNo,
            jobCardId: id,
            business: biz,
            customerName: j.customerName,
            phoneNumber: j.phoneNumber,
            emailAddress: j.emailAddress,
            vehicleInfo: `${j.year || "NA"} ${j.make} ${j.model}`,
            vehicleMake: j.make,
            vehicleModel: j.model,
            vehicleYear: j.year || "NA",
            licensePlate: j.licensePlate,
            vehicleType: (j as any).vehicleType,
            items: bizItems,
            subtotal: itemsSubtotal,
            discount: discountAmount,
            laborCharge: bizLaborCharge,
            gstPercentage: j.gst,
            gstAmount,
            totalAmount,
            date: j.date,
            isPaid: (j as any).isPaid || false,
            payments: (j as any).payments || []
          });
          await inv.save();
        }
      } else if (existingInvoice) {
        // Remove invoice if no items for this business anymore
        await InvoiceModel.findByIdAndDelete(existingInvoice._id);
      }
    }

    return {
      ...j.toObject(),
      id: j._id.toString(),
      services: j.services || [],
      ppfs: j.ppfs || [],
      accessories: j.accessories || [],
      vehicleType: (j as any).vehicleType
    } as JobCard;
  }

  async deleteJobCard(id: string): Promise<boolean> {
    const result = await JobCardModel.findByIdAndDelete(id);
    return !!result;
  }

  // Inquiries
  async getInquiries(): Promise<Inquiry[]> {
    const inquiries = await InquiryModel.find().sort({ date: -1 });
    return inquiries.map(i => ({
      id: i._id.toString(),
      inquiryId: (i as any).inquiryId,
      customerName: i.customerName,
      phone: i.phone,
      email: i.email || undefined,
      services: (i as any).services || [],
      accessories: (i as any).accessories || [],
      notes: i.notes || undefined,
      ourPrice: (i as any).ourPrice || 0,
      customerPrice: (i as any).customerPrice || 0,
      status: (i as any).status as any,
      priority: (i as any).priority || "MEDIUM",
      isConverted: (i as any).isConverted || false,
      createdAt: (i as any).createdAt || (i as any).date 
    })) as Inquiry[];
  }

  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const nextInquiryId = `INQ-${Date.now()}`;
    const i = new InquiryModel({
      ...inquiry,
      inquiryId: nextInquiryId,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isConverted: false
    });
    await i.save();
    return {
      id: i._id.toString(),
      inquiryId: (i as any).inquiryId,
      customerName: i.customerName,
      phone: i.phone,
      email: i.email || undefined,
      services: i.services as any,
      accessories: i.accessories as any,
      notes: i.notes || undefined,
      ourPrice: (i as any).ourPrice || 0,
      customerPrice: (i as any).customerPrice || 0,
      status: (i as any).status as any,
      priority: (i as any).priority || "MEDIUM",
      isConverted: false,
      createdAt: (i as any).createdAt || (i as any).date
    };
  }

  async updateInquiry(id: string, inquiry: Partial<Inquiry>): Promise<Inquiry | undefined> {
    const i = await InquiryModel.findByIdAndUpdate(id, inquiry, { new: true });
    if (!i) return undefined;
    return {
      id: i._id.toString(),
      inquiryId: (i as any).inquiryId,
      customerName: i.customerName,
      phone: i.phone,
      email: i.email || undefined,
      services: (i as any).services as any,
      accessories: (i as any).accessories as any,
      notes: i.notes || undefined,
      ourPrice: (i as any).ourPrice || 0,
      customerPrice: (i as any).customerPrice || 0,
      status: (i as any).status as any,
      priority: (i as any).priority || "MEDIUM",
      isConverted: (i as any).isConverted || false,
      createdAt: (i as any).createdAt || (i as any).date
    };
  }

  async deleteInquiry(id: string): Promise<boolean> {
    const result = await InquiryModel.findByIdAndDelete(id);
    return !!result;
  }

  async getInquiriesByPhone(phone: string): Promise<Inquiry[]> {
    const inquiries = await InquiryModel.find({ phone }).sort({ date: -1 });
    return inquiries.map(i => ({
      id: i._id.toString(),
      inquiryId: (i as any).inquiryId,
      customerName: i.customerName,
      phone: i.phone,
      email: i.email || undefined,
      services: (i as any).services || [],
      accessories: (i as any).accessories || [],
      notes: i.notes || undefined,
      ourPrice: (i as any).ourPrice || 0,
      customerPrice: (i as any).customerPrice || 0,
      status: (i as any).status as any,
      isConverted: (i as any).isConverted || false,
      createdAt: (i as any).createdAt || (i as any).date 
    })) as Inquiry[];
  }

  // Tickets
  async getTickets(): Promise<any[]> {
    const tickets = await TicketModel.find();
    return tickets.map(t => ({
      id: t._id.toString(),
      customerId: t.customerId,
      customerName: t.customerName,
      note: t.note,
      createdAt: t.createdAt
    }));
  }

  async createTicket(ticket: any): Promise<any> {
    const t = new TicketModel({
      ...ticket,
      createdAt: new Date().toISOString()
    });
    await t.save();
    return {
      id: t._id.toString(),
      customerId: t.customerId,
      customerName: t.customerName,
      note: t.note,
      createdAt: t.createdAt
    };
  }

  async updateTicket(id: string, ticket: any): Promise<any | undefined> {
    const t = await TicketModel.findByIdAndUpdate(id, ticket, { new: true });
    if (!t) return undefined;
    return {
      id: t._id.toString(),
      customerId: t.customerId,
      customerName: t.customerName,
      note: t.note,
      createdAt: t.createdAt
    };
  }

  async deleteTicket(id: string): Promise<boolean> {
    const result = await TicketModel.findByIdAndDelete(id);
    return !!result;
  }

  async getInvoices(): Promise<Invoice[]> {
    const invoices = await InvoiceModel.find().sort({ date: -1 });
    const enrichedInvoices: Invoice[] = [];
    
    for (const inv of invoices) {
      const obj = inv.toObject();
      let enrichedInvoice: any = {
        ...obj,
        id: inv._id.toString(),
        business: inv.business as "Auto Gamma" | "AGNX",
        discount: obj.discount ?? 0,
        laborCharge: obj.laborCharge ?? 0,
        gstPercentage: obj.gstPercentage ?? 18,
        isPaid: obj.isPaid ?? false,
        paymentMethod: obj.paymentMethod,
        paymentDate: obj.paymentDate,
      };
      
      // Enrich with job card data if vehicle details are missing
      if (inv.jobCardId && (!inv.vehicleMake || !inv.licensePlate)) {
        try {
          const jobCard = await JobCardModel.findById(inv.jobCardId);
          if (jobCard) {
            enrichedInvoice.vehicleMake = enrichedInvoice.vehicleMake || jobCard.make;
            enrichedInvoice.vehicleModel = enrichedInvoice.vehicleModel || jobCard.model;
            enrichedInvoice.vehicleYear = enrichedInvoice.vehicleYear || jobCard.year || "NA";
            enrichedInvoice.licensePlate = enrichedInvoice.licensePlate || jobCard.licensePlate;
            enrichedInvoice.vehicleType = enrichedInvoice.vehicleType || jobCard.vehicleType;
            
            // Enrich items with sub-details from job card
            if (enrichedInvoice.items && enrichedInvoice.items.length > 0) {
              enrichedInvoice.items = enrichedInvoice.items.map((item: any) => {
                // PPF items - match by name and enrich with warranty, rollUsed
                if (item.type === "PPF" && jobCard.ppfs) {
                  const matchingPpf = (jobCard.ppfs as any[]).find(p => p.name === item.name);
                  if (matchingPpf) {
                    return {
                      ...item,
                      warranty: item.warranty || matchingPpf.warranty || matchingPpf.warrantyName,
                      rollUsed: item.rollUsed || matchingPpf.rollUsed,
                      vehicleType: item.vehicleType || jobCard.vehicleType,
                      technician: item.technician || matchingPpf.technician,
                    };
                  }
                }
                // Service items
                if (item.type === "Service" && jobCard.services) {
                  const matchingService = (jobCard.services as any[]).find(s => s.name === item.name);
                  if (matchingService) {
                    return {
                      ...item,
                      vehicleType: item.vehicleType || jobCard.vehicleType,
                      technician: item.technician || matchingService.technician,
                    };
                  }
                }
                // Accessory items
                if (item.type === "Accessory" && jobCard.accessories) {
                  const matchingAccessory = (jobCard.accessories as any[]).find(a => a.name === item.name);
                  if (matchingAccessory) {
                    return {
                      ...item,
                      category: item.category || matchingAccessory.category,
                      quantity: item.quantity || matchingAccessory.quantity || item.quantity || 1,
                    };
                  }
                }
                return item;
              });
            }
          }
        } catch (e) {
          console.error("Error enriching invoice with job card data:", e);
        }
      }
      
      enrichedInvoices.push(enrichedInvoice as Invoice);
    }
    
    return enrichedInvoices;
  }

  async getInvoicesByPhone(phone: string): Promise<Invoice[]> {
    const invoices = await InvoiceModel.find({ phoneNumber: phone }).sort({ date: -1 });
    const enrichedInvoices: Invoice[] = [];
    
    for (const inv of invoices) {
      const obj = inv.toObject();
      let enrichedInvoice: any = {
        ...obj,
        id: inv._id.toString(),
        business: inv.business as "Auto Gamma" | "AGNX",
        discount: obj.discount ?? 0,
        laborCharge: obj.laborCharge ?? 0,
        gstPercentage: obj.gstPercentage ?? 18,
      };
      
      // Enrich with job card data if vehicle details are missing
      if (inv.jobCardId && (!inv.vehicleMake || !inv.licensePlate)) {
        try {
          const jobCard = await JobCardModel.findById(inv.jobCardId);
          if (jobCard) {
            enrichedInvoice.vehicleMake = enrichedInvoice.vehicleMake || jobCard.make;
            enrichedInvoice.vehicleModel = enrichedInvoice.vehicleModel || jobCard.model;
            enrichedInvoice.vehicleYear = enrichedInvoice.vehicleYear || jobCard.year || "NA";
            enrichedInvoice.licensePlate = enrichedInvoice.licensePlate || jobCard.licensePlate;
            enrichedInvoice.vehicleType = enrichedInvoice.vehicleType || jobCard.vehicleType;
            
            // Enrich items with sub-details
            if (enrichedInvoice.items && enrichedInvoice.items.length > 0) {
              enrichedInvoice.items = enrichedInvoice.items.map((item: any) => {
                if (item.type === "PPF" && jobCard.ppfs) {
                  const matchingPpf = (jobCard.ppfs as any[]).find(p => p.name === item.name);
                  if (matchingPpf) {
                    return {
                      ...item,
                      warranty: item.warranty || matchingPpf.warranty || matchingPpf.warrantyName,
                      rollUsed: item.rollUsed || matchingPpf.rollUsed,
                      vehicleType: item.vehicleType || jobCard.vehicleType,
                      technician: item.technician || matchingPpf.technician,
                    };
                  }
                }
                if (item.type === "Service" && jobCard.services) {
                  const matchingService = (jobCard.services as any[]).find(s => s.name === item.name);
                  if (matchingService) {
                    return {
                      ...item,
                      vehicleType: item.vehicleType || jobCard.vehicleType,
                      technician: item.technician || matchingService.technician,
                    };
                  }
                }
                if (item.type === "Accessory" && jobCard.accessories) {
                  const matchingAccessory = (jobCard.accessories as any[]).find(a => a.name === item.name);
                  if (matchingAccessory) {
                    return {
                      ...item,
                      category: item.category || matchingAccessory.category,
                      quantity: item.quantity || matchingAccessory.quantity || item.quantity || 1,
                    };
                  }
                }
                return item;
              });
            }
          }
        } catch (e) {
          console.error("Error enriching invoice with job card data:", e);
        }
      }
      
      enrichedInvoices.push(enrichedInvoice as Invoice);
    }
    
    return enrichedInvoices;
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const inv = await InvoiceModel.findById(id);
    if (!inv) return undefined;
    const obj = inv.toObject();
    return {
      ...obj,
      id: inv._id.toString(),
      items: (inv as any).items || [],
      discount: obj.discount ?? 0,
      laborCharge: obj.laborCharge ?? 0,
      gstPercentage: obj.gstPercentage ?? 18,
      isPaid: obj.isPaid ?? false,
      paymentMethod: obj.paymentMethod,
      paymentDate: obj.paymentDate,
    } as Invoice;
  }

  async createInvoice(invoice: any): Promise<Invoice> {
    const inv = new InvoiceModel(invoice);
    await inv.save();
    const obj = inv.toObject();
    return {
      ...obj,
      id: inv._id.toString(),
      items: (inv as any).items || [],
      discount: obj.discount ?? 0,
      laborCharge: obj.laborCharge ?? 0,
      gstPercentage: obj.gstPercentage ?? 18,
      isPaid: obj.isPaid ?? false,
      paymentMethod: obj.paymentMethod,
      paymentDate: obj.paymentDate,
    } as Invoice;
  }

  async updateInvoice(id: string, invoice: Partial<Invoice>): Promise<Invoice | undefined> {
    const existingInvoice = await InvoiceModel.findById(id);
    if (!existingInvoice) return undefined;

    // EXCEPTION - Logic for deducting incremental roll quantities
    if (invoice.items) {
      const oldItems = existingInvoice.items || [];
      const newItems = invoice.items;

      for (const newItem of newItems) {
        if (newItem.type === "PPF") {
          const newItemName = newItem.name || "";
          const rollMatches = Array.from(newItemName.matchAll(/(?:Quantity:\s*)?([\d.]+)sqft\s*\(from\s*(.*?)\)/g));
          
          let totalRollUsedForItem = 0;
          for (const match of rollMatches) {
            const typedMatch = match as RegExpMatchArray;
            const qty = parseFloat(typedMatch[1]);
            totalRollUsedForItem += qty;

            const rollName = typedMatch[2].split(/[,\s)]/)[0].trim();
            
            // Calculate total old quantity for this specific roll from existing invoice
            let oldQty = 0;
            oldItems.forEach(oldItem => {
              if (oldItem.type === "PPF" && oldItem.category === newItem.category) {
                const oldItemName = oldItem.name || "";
                const oldMatches = Array.from(oldItemName.matchAll(/(?:Quantity:\s*)?([\d.]+)sqft\s*\(from\s*(.*?)\)/g));
                oldMatches.forEach(oldMatch => {
                  if (oldMatch[2].split(/[,\s)]/)[0].trim() === rollName) {
                    oldQty += parseFloat(oldMatch[1]);
                  }
                });
              }
            });

            // Only deduct if new quantity is greater than old quantity
            if (qty > oldQty) {
              const deductQty = qty - oldQty;
              const ppfId = newItem.category;
              if (ppfId && mongoose.Types.ObjectId.isValid(ppfId)) {
                const ppfMaster = await PPFMasterModel.findById(ppfId);
                if (ppfMaster && ppfMaster.rolls) {
                  const roll = (ppfMaster.rolls as any[]).find(r => 
                    r.name === rollName || (r.name && rollName && r.name.toLowerCase().includes(rollName.toLowerCase()))
                  );

                  if (roll) {
                    roll.stock -= deductQty;
                    ppfMaster.markModified("rolls");
                    await ppfMaster.save();
                    console.log(`[INVOICE UPDATE EXCEPTION] Deducted incremental ${deductQty} sqft from roll ${roll.name} (Old: ${oldQty}, New: ${qty})`);
                  }
                }
              }
            }
          }
          // Update the item's rollUsed field with the sum of all rolls
          newItem.rollUsed = totalRollUsedForItem;
        }
      }
    }

    const inv = await InvoiceModel.findByIdAndUpdate(id, invoice, { new: true });
    if (!inv) return undefined;
    const obj = inv.toObject();
    return {
      ...obj,
      id: inv._id.toString(),
      items: (inv as any).items || [],
      discount: obj.discount ?? 0,
      laborCharge: obj.laborCharge ?? 0,
      gstPercentage: obj.gstPercentage ?? 18,
      isPaid: obj.isPaid ?? false,
      paymentMethod: obj.paymentMethod,
      paymentDate: obj.paymentDate,
    } as Invoice;
  }

  async deleteInvoice(id: string): Promise<boolean> {
    try {
      const invoice = await InvoiceModel.findById(id);
      if (!invoice) {
        console.log(`[STORAGE DELETE INVOICE] Invoice not found: ${id}`);
        return false;
      }

      console.log(`[STORAGE DELETE INVOICE] Found invoice: ${invoice.invoiceNo}, jobCardId: ${invoice.jobCardId}`);

      // Replenish PPF stock if there are PPF items
      if (invoice.items && invoice.items.length > 0) {
        // Try to find the original Job Card to get exact roll used data
        const jobCard = invoice.jobCardId ? await JobCardModel.findById(invoice.jobCardId) : null;

        for (const item of invoice.items) {
          if (item.type === "PPF") {
            console.log(`[REPLENISH] Processing PPF item: ${item.name}`);
            
            let ppfMaster = null;
            // Try by category ID first (newly created invoices)
            if (item.category && mongoose.Types.ObjectId.isValid(item.category)) {
              ppfMaster = await PPFMasterModel.findById(item.category);
            }
            
            // Fallback: Try by name
            if (!ppfMaster && item.name) {
              const ppfName = item.name.split('(')[0].split('\n')[0].trim();
              ppfMaster = await PPFMasterModel.findOne({ 
                name: { $regex: new RegExp(`^${ppfName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } 
              });
            }

            if (ppfMaster && ppfMaster.rolls) {
              let replenished = false;

              // Priority 1: Use exact roll data from Job Card if available
              if (jobCard && jobCard.ppfs) {
                const matchingPpf = (jobCard.ppfs as any[]).find(p => p.name === item.name || (p.ppfId || p.id) === item.category);
                if (matchingPpf) {
                  const rollsToRevert = (matchingPpf as any).rollsUsed || (matchingPpf.rollId ? [{
                    rollId: matchingPpf.rollId,
                    rollUsed: (matchingPpf as any).rollUsed || 0
                  }] : []);

                  for (const entry of rollsToRevert) {
                    const roll = (ppfMaster.rolls as any[]).find(r => 
                      (r._id && r._id.toString() === entry.rollId) || r.id === entry.rollId
                    );
                    if (roll && entry.rollUsed > 0) {
                      roll.stock += entry.rollUsed;
                      replenished = true;
                      console.log(`[REPLENISH] Added ${entry.rollUsed} to ${roll.name} from Job Card data`);
                    }
                  }
                }
              }

              // Priority 2: Fallback to parsing from item name if Job Card data wasn't found or didn't match
              if (!replenished) {
                const rollMatches = Array.from((item.name || "").matchAll(/(?:Quantity:\s*)?([\d.]+)sqft\s*\(from\s*(.*?)\)/g));
                if (rollMatches.length > 0) {
                  for (const match of rollMatches) {
                    const qty = parseFloat(match[1]);
                    const rawRollName = match[2].split(/[,\s)]/)[0].trim();
                    
                    const roll = (ppfMaster.rolls as any[]).find(r => 
                      r.name === rawRollName || 
                      (r.name && r.name.toLowerCase().includes(rawRollName.toLowerCase())) ||
                      (rawRollName.toLowerCase().includes(r.name.toLowerCase()))
                    );

                    if (roll && !isNaN(qty)) {
                      roll.stock += qty;
                      replenished = true;
                      console.log(`[REPLENISH] Added ${qty} to ${roll.name} from parsed name`);
                    }
                  }
                }
              }

              if (replenished) {
                ppfMaster.markModified("rolls");
                await ppfMaster.save();
              }
            }
          }
        }
      }

      const result = await InvoiceModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error("[STORAGE DELETE INVOICE ERROR]", error);
      throw error;
    }
  }

  // Vendor Management
  async getVendors(): Promise<Vendor[]> {
    const vendors = await VendorModel.find().sort({ createdAt: -1 });
    return vendors.map(v => ({ ...v.toObject(), id: v._id.toString() }) as Vendor);
  }

  async getVendor(id: string): Promise<Vendor | undefined> {
    const v = await VendorModel.findById(id);
    if (!v) return undefined;
    return { ...v.toObject(), id: v._id.toString() } as Vendor;
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const v = new VendorModel({ ...vendor, createdAt: new Date().toISOString() });
    await v.save();
    return { ...v.toObject(), id: v._id.toString() } as Vendor;
  }

  async updateVendor(id: string, vendor: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const v = await VendorModel.findByIdAndUpdate(id, vendor, { new: true });
    if (!v) return undefined;
    return { ...v.toObject(), id: v._id.toString() } as Vendor;
  }

  async deleteVendor(id: string): Promise<boolean> {
    const result = await VendorModel.findByIdAndDelete(id);
    return !!result;
  }

  async getVendorPurchases(vendorId?: string): Promise<VendorPurchase[]> {
    const query = vendorId ? { vendorId } : {};
    const purchases = await VendorPurchaseModel.find(query).sort({ createdAt: -1 });
    return purchases.map(p => ({ ...p.toObject(), id: p._id.toString() }) as VendorPurchase);
  }

  async getVendorPurchase(id: string): Promise<VendorPurchase | undefined> {
    const p = await VendorPurchaseModel.findById(id);
    if (!p) return undefined;
    return { ...p.toObject(), id: p._id.toString() } as VendorPurchase;
  }

  async createVendorPurchase(purchase: InsertVendorPurchase): Promise<VendorPurchase> {
    const total = purchase.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const p = new VendorPurchaseModel({ ...purchase, totalAmount: total, createdAt: new Date().toISOString() });
    await p.save();
    return { ...p.toObject(), id: p._id.toString() } as VendorPurchase;
  }

  async updateVendorPurchase(id: string, purchase: Partial<InsertVendorPurchase>): Promise<VendorPurchase | undefined> {
    if (purchase.items) {
      (purchase as any).totalAmount = purchase.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    }
    const p = await VendorPurchaseModel.findByIdAndUpdate(id, purchase, { new: true });
    if (!p) return undefined;
    return { ...p.toObject(), id: p._id.toString() } as VendorPurchase;
  }

  async deleteVendorPurchase(id: string): Promise<boolean> {
    const result = await VendorPurchaseModel.findByIdAndDelete(id);
    return !!result;
  }
}

export const storage = new MongoStorage();
