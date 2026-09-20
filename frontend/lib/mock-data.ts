import { AdminOrderRow } from "@/types/order";
import { Printer } from "@/types/printer";

export const MOCK_PRINTERS: Printer[] = [
  {
    id: "printer-01",
    name: "Printer #01",
    model: "Canon imageRUNNER 2625",
    status: "online",
    jobsToday: 87,
    pagesToday: 1420,
    currentJobFile: "assignment.pdf",
    currentJobProgress: { done: 8, total: 12 },
  },
  {
    id: "printer-02",
    name: "Printer #02",
    model: "HP LaserJet Pro M428",
    status: "online",
    jobsToday: 34,
    pagesToday: 610,
  },
  {
    id: "printer-03",
    name: "Printer #03",
    model: "Epson EcoTank L15150",
    status: "offline",
    jobsToday: 6,
    pagesToday: 400,
    lastSeen: "4 minutes ago",
  },
  {
    id: "printer-04",
    name: "Printer #04",
    model: "Canon imageRUNNER 2625",
    status: "paused",
    jobsToday: 0,
    pagesToday: 0,
  },
];

export const MOCK_ORDERS: AdminOrderRow[] = [
  { id: "#1042", customer: "Ravi Teja", pages: 12, copies: 2, color: "B&W", paper: "A4", amount: 24, payment: "Paid", status: "Printing", createdAt: "2026-08-30T10:42:00", file: "assignment.pdf" },
  { id: "#1041", customer: "Sneha Rao", pages: 8, copies: 1, color: "B&W", paper: "A4", amount: 16, payment: "Paid", status: "Completed", createdAt: "2026-08-30T10:21:00", file: "resume_final.pdf" },
  { id: "#1040", customer: "Karthik M", pages: 25, copies: 1, color: "Color", paper: "A4", amount: 125, payment: "Paid", status: "Completed", createdAt: "2026-08-30T09:58:00", file: "project_report.pdf" },
  { id: "#1039", customer: "Divya Sri", pages: 4, copies: 3, color: "B&W", paper: "A4", amount: 12, payment: "Paid", status: "Completed", createdAt: "2026-08-30T09:40:00", file: "notes.pdf" },
  { id: "#1038", customer: "Ahmed Khan", pages: 16, copies: 1, color: "Color", paper: "A3", amount: 160, payment: "Failed", status: "Failed", createdAt: "2026-08-30T09:12:00", file: "poster_design.png" },
  { id: "#1037", customer: "Priya Das", pages: 2, copies: 1, color: "B&W", paper: "A4", amount: 5, payment: "Paid", status: "Completed", createdAt: "2026-08-30T08:55:00", file: "id_proof.jpg" },
  { id: "#1036", customer: "Vikram S", pages: 40, copies: 1, color: "B&W", paper: "A4", amount: 40, payment: "Paid", status: "Completed", createdAt: "2026-08-30T08:30:00", file: "thesis_draft.pdf" },
  { id: "#1035", customer: "Anitha Reddy", pages: 6, copies: 2, color: "Color", paper: "A4", amount: 60, payment: "Paid", status: "Queued", createdAt: "2026-08-30T08:05:00", file: "certificate.pdf" },
];

export const REVENUE_TREND = [
  { day: "Mon", revenue: 2100 },
  { day: "Tue", revenue: 2640 },
  { day: "Wed", revenue: 1980 },
  { day: "Thu", revenue: 3120 },
  { day: "Fri", revenue: 2890 },
  { day: "Sat", revenue: 3560 },
  { day: "Sun", revenue: 3240 },
];

export const WEEKLY_REVENUE = [
  { label: "Week 1", value: 16200 },
  { label: "Week 2", value: 18450 },
  { label: "Week 3", value: 15900 },
  { label: "Week 4", value: 20120 },
];

export const MONTHLY_REVENUE = [
  { label: "Apr", value: 58200 },
  { label: "May", value: 64100 },
  { label: "Jun", value: 61300 },
  { label: "Jul", value: 70450 },
  { label: "Aug", value: 74670 },
];

export const COLOR_SPLIT = [
  { name: "Black & White", value: 68 },
  { name: "Color", value: 32 },
];

export const PAPER_SPLIT = [
  { name: "A4", value: 82 },
  { name: "A3", value: 18 },
];

export const DAILY_ORDERS = [
  { day: "Mon", orders: 62 },
  { day: "Tue", orders: 78 },
  { day: "Wed", orders: 54 },
  { day: "Thu", orders: 91 },
  { day: "Fri", orders: 85 },
  { day: "Sat", orders: 104 },
  { day: "Sun", orders: 127 },
];
