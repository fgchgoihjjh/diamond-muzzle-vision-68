
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { AdminStats } from "@/components/admin/AdminStats";
import { ClientsList } from "@/components/admin/ClientsList";
import { ApiUsageChart } from "@/components/admin/ApiUsageChart";
import { AiChat } from "@/components/admin/AiChat";
import { UserManagement } from "@/components/admin/UserManagement";
import { DiamondManagement } from "@/components/admin/DiamondManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email?: string;
  first_name: string;
  last_name?: string;
  phone_number?: string;
  telegram_id?: number;
  status: string;
  created_at: string;
  updated_at?: string;
  last_active?: string;
  is_premium?: boolean;
  subscription_plan?: string;
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

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [apiUsage, setApiUsage] = useState<ApiUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedUsers: User[] = (data || []).map(profile => ({
        id: profile.id,
        email: '',
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number,
        telegram_id: profile.telegram_id,
        status: profile.status || 'active',
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        last_active: profile.last_login,
        is_premium: profile.is_premium,
        subscription_plan: profile.subscription_plan
      }));

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users data",
        variant: "destructive",
      });
    }
  };

  const fetchApiUsage = async () => {
    try {
      const { data, error } = await supabase
        .from('api_usage')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setApiUsage(data || []);
    } catch (error) {
      console.error('Error fetching API usage:', error);
      toast({
        title: "Error",
        description: "Failed to fetch API usage data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchApiUsage()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor users, API usage, diamonds, and manage consultations
            </p>
          </div>
        </div>

        <AdminStats users={users} apiUsage={apiUsage} loading={loading} />

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="diamonds">Diamond Inventory</TabsTrigger>
            <TabsTrigger value="usage">API Usage</TabsTrigger>
            <TabsTrigger value="chat">AI Diamond Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <ClientsList users={users} onRefresh={fetchUsers} loading={loading} />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <UserManagement users={users} onRefresh={fetchUsers} loading={loading} />
          </TabsContent>

          <TabsContent value="diamonds" className="space-y-4">
            <DiamondManagement />
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <ApiUsageChart apiUsage={apiUsage} users={users} loading={loading} />
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <AiChat />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
