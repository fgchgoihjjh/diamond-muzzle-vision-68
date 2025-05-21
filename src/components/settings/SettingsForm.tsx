
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

// Import the new component files
import { IntegrationSettings } from "./IntegrationSettings";
import { NotificationSettings } from "./NotificationSettings";
import { AiSettings } from "./AiSettings";

interface SettingsFormProps {
  loading?: boolean;
}

export function SettingsForm({ loading = false }: SettingsFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // In a real app, these would be fetched from the API
  const [settings, setSettings] = useState({
    telegramGroupId: "-10012345678",
    whatsappEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    autoReplyEnabled: true,
    matchThreshold: 85,
    apiKey: "sk_test_x1y2z3...",
  });
  
  const handleChange = (field: string, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // const result = await api.post('/settings', settings);
      
      toast({
        title: "Settings updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update settings",
        description: "There was an error saving your settings.",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-100 rounded w-2/3"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-10 bg-gray-100 rounded"></div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <IntegrationSettings
        telegramGroupId={settings.telegramGroupId}
        whatsappEnabled={settings.whatsappEnabled}
        apiKey={settings.apiKey}
        onValueChange={handleChange}
        isSaving={isSaving}
      />
      
      <NotificationSettings
        emailNotifications={settings.emailNotifications}
        smsNotifications={settings.smsNotifications}
        pushNotifications={settings.pushNotifications}
        onValueChange={handleChange}
      />
      
      <AiSettings
        autoReplyEnabled={settings.autoReplyEnabled}
        matchThreshold={settings.matchThreshold}
        onValueChange={handleChange}
        isSaving={isSaving}
      />
    </form>
  );
}
