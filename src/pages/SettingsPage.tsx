
import { Layout } from "@/components/layout/Layout";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { TelegramIntegration } from "@/components/settings/TelegramIntegration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your Diamond Muzzle preferences and integrations
          </p>
        </div>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <SettingsForm />
          </TabsContent>
          
          <TabsContent value="integrations">
            <TelegramIntegration />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
