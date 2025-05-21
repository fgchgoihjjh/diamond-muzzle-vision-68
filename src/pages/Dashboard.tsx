
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { InventoryChart } from "@/components/dashboard/InventoryChart";
import { Diamond, Coins, Users, BadgeCheck } from "lucide-react";
import { api } from "@/lib/api";

interface DashboardStats {
  totalDiamonds: number;
  matchedPairs: number;
  totalLeads: number;
  activeSubscriptions: number;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalDiamonds: 0,
    matchedPairs: 0,
    totalLeads: 0,
    activeSubscriptions: 0,
  });
  
  const [inventoryData, setInventoryData] = useState([
    { name: "Round", value: 0 },
    { name: "Princess", value: 0 },
    { name: "Cushion", value: 0 },
    { name: "Oval", value: 0 },
    { name: "Pear", value: 0 },
    { name: "Other", value: 0 },
  ]);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, we would call the actual API
        // const response = await api.get<DashboardStats>('/stats');
        // setStats(response.data);
        
        // For demo purposes, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock data
        setStats({
          totalDiamonds: 1287,
          matchedPairs: 42,
          totalLeads: 96,
          activeSubscriptions: 18,
        });
        
        setInventoryData([
          { name: "Round", value: 582 },
          { name: "Princess", value: 231 },
          { name: "Cushion", value: 142 },
          { name: "Oval", value: 118 },
          { name: "Pear", value: 64 },
          { name: "Other", value: 150 },
        ]);
        
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

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
            value={stats.totalDiamonds}
            icon={Diamond}
            trend={7.4}
            trendLabel="vs last month"
            loading={loading}
          />
          <StatCard
            title="Matched Pairs"
            value={stats.matchedPairs}
            icon={BadgeCheck}
            trend={3.2}
            trendLabel="vs last month"
            loading={loading}
          />
          <StatCard
            title="Active Leads"
            value={stats.totalLeads}
            icon={Users}
            trend={-2.1}
            trendLabel="vs last month"
            loading={loading}
          />
          <StatCard
            title="Active Subscriptions"
            value={stats.activeSubscriptions}
            suffix=""
            icon={Coins}
            trend={12.5}
            trendLabel="vs last month"
            loading={loading}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InventoryChart
            title="Inventory by Shape"
            data={inventoryData}
            loading={loading}
          />
          
          <InventoryChart
            title="Recent Sales by Category"
            data={[
              { name: "0-1 carat", value: 28 },
              { name: "1-2 carat", value: 42 },
              { name: "2-3 carat", value: 18 },
              { name: "3-4 carat", value: 8 },
              { name: "4+ carat", value: 4 },
            ]}
            loading={loading}
          />
        </div>
      </div>
    </Layout>
  );
}
