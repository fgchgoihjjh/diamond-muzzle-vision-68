
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { AdminStats } from "@/components/admin/AdminStats";
import { ClientsList } from "@/components/admin/ClientsList";
import { ApiUsageChart } from "@/components/admin/ApiUsageChart";
import { AiChat } from "@/components/admin/AiChat";
import { UserManagement } from "@/components/admin/UserManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

export default function AdminDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [apiUsage, setApiUsage] = useState<ApiUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to fetch clients data",
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
      await Promise.all([fetchClients(), fetchApiUsage()]);
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
              Monitor clients, API usage, and manage diamond consultations
            </p>
          </div>
        </div>

        <AdminStats clients={clients} apiUsage={apiUsage} loading={loading} />

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="usage">API Usage</TabsTrigger>
            <TabsTrigger value="chat">AI Diamond Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <ClientsList clients={clients} onRefresh={fetchClients} loading={loading} />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <UserManagement clients={clients} onRefresh={fetchClients} loading={loading} />
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <ApiUsageChart apiUsage={apiUsage} clients={clients} loading={loading} />
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <AiChat />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
