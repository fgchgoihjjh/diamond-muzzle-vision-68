
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  telegram_id?: number;
  email?: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_active?: string;
}

interface ApiUsage {
  id: string;
  client_id?: string;
  telegram_id?: number;
  api_type: string;
  tokens_used: number;
  cost: number;
  created_at: string;
}

interface ApiUsageChartProps {
  apiUsage: ApiUsage[];
  clients: Client[];
  loading: boolean;
}

export function ApiUsageChart({ apiUsage, clients, loading }: ApiUsageChartProps) {
  // Group usage by day
  const usageByDay = apiUsage.reduce((acc, usage) => {
    const date = new Date(usage.created_at).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { date, calls: 0, cost: 0, tokens: 0 };
    }
    acc[date].calls += 1;
    acc[date].cost += usage.cost;
    acc[date].tokens += usage.tokens_used;
    return acc;
  }, {} as Record<string, { date: string; calls: number; cost: number; tokens: number }>);

  const chartData = Object.values(usageByDay).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Group usage by API type
  const usageByType = apiUsage.reduce((acc, usage) => {
    if (!acc[usage.api_type]) {
      acc[usage.api_type] = { type: usage.api_type, calls: 0, cost: 0 };
    }
    acc[usage.api_type].calls += 1;
    acc[usage.api_type].cost += usage.cost;
    return acc;
  }, {} as Record<string, { type: string; calls: number; cost: number }>);

  const typeData = Object.values(usageByType);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>API Usage Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Usage by API Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>API Usage Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="calls" stroke="#8884d8" name="API Calls" />
              <Line type="monotone" dataKey="cost" stroke="#82ca9d" name="Cost ($)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage by API Type</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="calls" fill="#8884d8" name="API Calls" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
