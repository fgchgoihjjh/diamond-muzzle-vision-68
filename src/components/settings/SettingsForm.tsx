
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";

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
      <Card>
        <CardHeader>
          <CardTitle>Integration Settings</CardTitle>
          <CardDescription>
            Configure your messaging platform integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="telegramGroupId">Telegram Group ID</Label>
            <Input
              id="telegramGroupId"
              value={settings.telegramGroupId}
              onChange={(e) => handleChange("telegramGroupId", e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Find this in your Telegram group settings or ask our support team for help.
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="whatsappEnabled">WhatsApp Integration</Label>
              <p className="text-xs text-gray-500">
                Enable WhatsApp messaging for client communications
              </p>
            </div>
            <Switch
              id="whatsappEnabled"
              checked={settings.whatsappEnabled}
              onCheckedChange={(checked) => handleChange("whatsappEnabled", checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              value={settings.apiKey}
              type="password"
              onChange={(e) => handleChange("apiKey", e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Required for external integrations. Keep this secure.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Reset</Button>
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose how you want to be notified about important events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-xs text-gray-500">
                Receive daily digest and important alerts
              </p>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleChange("emailNotifications", checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="smsNotifications">SMS Notifications</Label>
              <p className="text-xs text-gray-500">
                Receive urgent alerts via SMS
              </p>
            </div>
            <Switch
              id="smsNotifications"
              checked={settings.smsNotifications}
              onCheckedChange={(checked) => handleChange("smsNotifications", checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pushNotifications">Push Notifications</Label>
              <p className="text-xs text-gray-500">
                Receive real-time alerts in your browser
              </p>
            </div>
            <Switch
              id="pushNotifications"
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => handleChange("pushNotifications", checked)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Configuration</CardTitle>
          <CardDescription>
            Fine-tune your Diamond Muzzle AI behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoReplyEnabled">Automatic Replies</Label>
              <p className="text-xs text-gray-500">
                Let AI handle routine client queries automatically
              </p>
            </div>
            <Switch
              id="autoReplyEnabled"
              checked={settings.autoReplyEnabled}
              onCheckedChange={(checked) => handleChange("autoReplyEnabled", checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="matchThreshold">
              Match Threshold ({settings.matchThreshold}%)
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-xs">50%</span>
              <Input
                id="matchThreshold"
                type="range"
                min="50"
                max="100"
                value={settings.matchThreshold}
                onChange={(e) => handleChange("matchThreshold", Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs">100%</span>
            </div>
            <p className="text-xs text-gray-500">
              Higher values mean stricter matching between client requests and inventory
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="ml-auto" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save All Changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
