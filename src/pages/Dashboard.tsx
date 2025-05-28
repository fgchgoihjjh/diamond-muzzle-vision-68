import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { InventoryChart } from "@/components/dashboard/InventoryChart";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { Diamond, Coins, Users, BadgeCheck, Weight, DollarSign } from "lucide-react";
import { fetchDiamonds } from "@/lib/diamond-api";
import { Diamond as DiamondType, DashboardMetrics } from "@/types/diamond";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardMetrics>({
    totalDiamonds: 0,
    totalCaratWeight: 0,
    totalEstimatedValue: 0,
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
        // Fetch real diamond data from FastAPI backend
        const response = await fetchDiamonds();
        
        if (response.data) {
          const diamonds = response.data;
          
          // Calculate real statistics
          const totalDiamonds = diamonds.length;
          const availableDiamonds = diamonds.filter(d => d.status === "Available").length;
          const soldDiamonds = diamonds.filter(d => d.status === "Sold").length;
          
          // Calculate total carat weight
          const totalCaratWeight = diamonds.reduce((sum, diamond) => sum + diamond.carat, 0);
          
          // Calculate total estimated value
          const totalEstimatedValue = diamonds.reduce((sum, diamond) => sum + diamond.price, 0);
          
          setStats({
            totalDiamonds,
            totalCaratWeight: Math.round(totalCaratWeight * 100) / 100, // Round to 2 decimal places
            totalEstimatedValue,
            matchedPairs: Math.floor(availableDiamonds / 2), // Simplified matching logic
            totalLeads: soldDiamonds + Math.floor(Math.random() * 20), // Mock leads
            activeSubscriptions: 18, // Mock subscriptions
          });
          
          // Calculate real inventory distribution by shape
          const shapeDistribution = diamonds.reduce((acc: Record<string, number>, diamond) => {
            acc[diamond.shape] = (acc[diamond.shape] || 0) + 1;
            return acc;
          }, {});
          
          const chartData = [
            { name: "Round", value: shapeDistribution["Round"] || 0 },
            { name: "Princess", value: shapeDistribution["Princess"] || 0 },
            { name: "Cushion", value: shapeDistribution["Cushion"] || 0 },
            { name: "Oval", value: shapeDistribution["Oval"] || 0 },
            { name: "Pear", value: shapeDistribution["Pear"] || 0 },
            { name: "Other", value: Object.entries(shapeDistribution)
              .filter(([shape]) => !["Round", "Princess", "Cushion", "Oval", "Pear"].includes(shape))
              .reduce((sum, [, count]) => sum + count, 0) 
            },
          ];
          
          setInventoryData(chartData);
        } else {
          // Fallback to mock data if backend is unavailable
          console.warn("Backend unavailable, using mock data");
          setStats({
            totalDiamonds: 1287,
            totalCaratWeight: 2574.32,
            totalEstimatedValue: 12847500,
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
        }
        
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        // Use mock data as fallback
        setStats({
          totalDiamonds: 1287,
          totalCaratWeight: 2574.32,
          totalEstimatedValue: 12847500,
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
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to Diamond Muzzle. Here's an overview of your inventory.
            </p>
          </div>
          <ConnectionStatus />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Total Diamonds"
            value={stats.totalDiamonds}
            icon={Diamond}
            trend={7.4}
            trendLabel="vs last month"
            loading={loading}
          />
          <StatCard
            title="Total Carat Weight"
            value={stats.totalCaratWeight}
            suffix=" ct"
            icon={Weight}
            trend={3.2}
            trendLabel="vs last month"
            loading={loading}
          />
          <StatCard
            title="Total Value"
            value={stats.totalEstimatedValue}
            prefix="$"
            icon={DollarSign}
            trend={5.8}
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
