
import { Layout } from "@/components/layout/Layout";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { TelegramIntegration } from "@/components/settings/TelegramIntegration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  
  // Load all settings to ensure we have the latest data
  const { isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.get('/settings');
      return response.data;
    },
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your Diamond Muzzle preferences and integrations
          </p>
        </div>
        
        <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <SettingsForm loading={isLoading} />
          </TabsContent>
          
          <TabsContent value="integrations">
            <TelegramIntegration isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
