
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, DollarSign, Activity } from "lucide-react";
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

interface AdminStatsProps {
  clients: Client[];
  apiUsage: ApiUsage[];
  loading: boolean;
}

export function AdminStats({ clients, apiUsage, loading }: AdminStatsProps) {
  const totalClients = clients.length;
  const activeClients = clients.filter(client => client.status === 'active').length;
  const totalApiCalls = apiUsage.length;
  const totalCost = apiUsage.reduce((sum, usage) => sum + usage.cost, 0);

  const stats = [
    {
      title: "Total Clients",
      value: totalClients,
      icon: Users,
      description: `${activeClients} active`,
    },
    {
      title: "API Calls",
      value: totalApiCalls,
      icon: MessageSquare,
      description: "Total requests",
    },
    {
      title: "API Cost",
      value: `$${totalCost.toFixed(2)}`,
      icon: DollarSign,
      description: "Total spending",
    },
    {
      title: "Active Sessions",
      value: activeClients,
      icon: Activity,
      description: "Current users",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
