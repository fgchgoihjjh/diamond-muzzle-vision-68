
export interface Diamond {
  id: string;
  stock_number: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  status: string;
  created_at?: string;
  lab?: string;
  certificate_number?: string;
  measurements?: string;
  depth?: number;
  table?: number;
}

export interface DashboardMetrics {
  totalDiamonds: number;
  totalCaratWeight: number;
  totalEstimatedValue: number;
  matchedPairs: number;
  totalLeads: number;
  activeSubscriptions: number;
}
