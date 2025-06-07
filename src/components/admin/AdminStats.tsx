
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, MessageCircle, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: string;
  status: string;
  is_premium?: boolean;
  created_at: string;
}

interface ApiUsage {
  cost: number;
  tokens_used: number;
  created_at: string;
}

interface AdminStatsProps {
  users: User[];
  apiUsage: ApiUsage[];
  loading: boolean;
}

export function AdminStats({ users, apiUsage, loading }: AdminStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === 'active').length;
  const premiumUsers = users.filter(user => user.is_premium).length;
  const recentUsers = users.filter(user => {
    const userDate = new Date(user.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return userDate > thirtyDaysAgo;
  }).length;

  const totalCost = apiUsage.reduce((sum, usage) => sum + (usage.cost || 0), 0);
  const totalTokens = apiUsage.reduce((sum, usage) => sum + (usage.tokens_used || 0), 0);
  const totalApiCalls = apiUsage.length;

  const stats = [
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      icon: Users,
      description: `${activeUsers} active users`,
    },
    {
      title: "Premium Users",
      value: premiumUsers.toLocaleString(),
      icon: TrendingUp,
      description: `${((premiumUsers / totalUsers) * 100).toFixed(1)}% conversion rate`,
    },
    {
      title: "API Usage Cost",
      value: `$${totalCost.toFixed(2)}`,
      icon: DollarSign,
      description: `${totalTokens.toLocaleString()} tokens used`,
    },
    {
      title: "API Calls",
      value: totalApiCalls.toLocaleString(),
      icon: MessageCircle,
      description: `Recent activity`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
