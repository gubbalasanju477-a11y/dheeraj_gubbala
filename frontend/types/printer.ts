export type PrinterStatus = "online" | "offline" | "paused";

export interface Printer {
  id: string;
  name: string;
  model: string;
  status: PrinterStatus;
  jobsToday: number;
  pagesToday: number;
  currentJobFile?: string;
  currentJobProgress?: { done: number; total: number };
  lastSeen?: string;
}
