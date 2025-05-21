
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { InventoryChart } from "@/components/dashboard/InventoryChart";
import { Diamond, Coins, Users, BadgeCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  totalDiamonds: number;
  matchedPairs: number;
  totalLeads: number;
  activeSubscriptions: number;
}

interface InventoryChartData {
  name: string;
  value: number;
}

export default function Dashboard() {
  // Fetch dashboard stats
  const { 
    data: stats, 
    isLoading: statsLoading 
  } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await api.get<DashboardStats>('/stats');
      if (response.error) throw new Error(response.error);
      return response.data || {
        totalDiamonds: 0,
        matchedPairs: 0,
        totalLeads: 0,
        activeSubscriptions: 0
      };
    }
  });
  
  // Fetch inventory shape data
  const { 
    data: shapeData, 
    isLoading: shapeLoading 
  } = useQuery({
    queryKey: ['inventoryByShape'],
    queryFn: async () => {
      const response = await api.get<InventoryChartData[]>('/inventory/by-shape');
      if (response.error) throw new Error(response.error);
      return response.data || [];
    }
  });
  
  // Fetch sales by carat data
  const { 
    data: salesData, 
    isLoading: salesLoading 
  } = useQuery({
    queryKey: ['salesByCategory'],
    queryFn: async () => {
      const response = await api.get<InventoryChartData[]>('/sales/by-category');
      if (response.error) throw new Error(response.error);
      return response.data || [];
    }
  });

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to Diamond Muzzle. Here's an overview of your inventory.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Diamonds"
            value={stats?.totalDiamonds || 0}
            icon={Diamond}
            trend={7.4}
            trendLabel="vs last month"
            loading={statsLoading}
          />
          <StatCard
            title="Matched Pairs"
            value={stats?.matchedPairs || 0}
            icon={BadgeCheck}
            trend={3.2}
            trendLabel="vs last month"
            loading={statsLoading}
          />
          <StatCard
            title="Active Leads"
            value={stats?.totalLeads || 0}
            icon={Users}
            trend={-2.1}
            trendLabel="vs last month"
            loading={statsLoading}
          />
          <StatCard
            title="Active Subscriptions"
            value={stats?.activeSubscriptions || 0}
            suffix=""
            icon={Coins}
            trend={12.5}
            trendLabel="vs last month"
            loading={statsLoading}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InventoryChart
            title="Inventory by Shape"
            data={shapeData || []}
            loading={shapeLoading}
          />
          
          <InventoryChart
            title="Recent Sales by Category"
            data={salesData || []}
            loading={salesLoading}
          />
        </div>
      </div>
    </Layout>
  );
}
