import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Bot, MessageSquare, Key } from "lucide-react";
import { api } from "@/lib/api";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface TelegramSettings {
  telegramGroupId: string;
  telegramBotToken: string;
  enableMessageAnalysis: boolean;
  autoReplyToQueries: boolean;
  notifyOnMatches: boolean;
  lastSyncTime?: string;
}

interface TelegramIntegrationProps {
  isLoading?: boolean;
}

export function TelegramIntegration({ isLoading = false }: TelegramIntegrationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testLoading, setTestLoading] = useState(false);
  
  // Get current settings from API
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['telegramIntegrationSettings'],
    queryFn: async () => {
      const response = await api.get<TelegramSettings>('/settings/telegram');
      if (response.error) throw new Error(response.error);
      return response.data || {
        telegramGroupId: "",
        telegramBotToken: "",
        enableMessageAnalysis: false,
        autoReplyToQueries: false,
        notifyOnMatches: false,
      };
    },
  });
  
  // Local state to track form changes
  const [formData, setFormData] = useState<TelegramSettings>({
    telegramGroupId: "",
    telegramBotToken: "",
    enableMessageAnalysis: false,
    autoReplyToQueries: false,
    notifyOnMatches: false,
  });
  
  // Update form data when API returns settings
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);
  
  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: TelegramSettings) => {
      return await api.post<{ success: boolean }>('/settings/telegram', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegramIntegrationSettings'] });
      toast({
        title: "Telegram Settings Saved",
        description: "Your Telegram integration settings have been updated.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save Telegram settings. Please try again.",
      });
    },
  });
  
  const handleChange = (field: keyof TelegramSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleTestConnection = async () => {
    if (!formData.telegramBotToken) {
      toast({
        variant: "destructive",
        title: "Missing Bot Token",
        description: "Please enter your Telegram bot token to test the connection.",
      });
      return;
    }

    if (!formData.telegramGroupId) {
      toast({
        variant: "destructive",
        title: "Missing Group ID",
        description: "Please enter your Telegram group ID to test the connection.",
      });
      return;
    }
    
    setTestLoading(true);
    try {
      const response = await api.post<{ success: boolean }>('/telegram/test-connection', { 
        botToken: formData.telegramBotToken,
        chatId: formData.telegramGroupId 
      });
      
      if (response.error) throw new Error(response.error);
      
      toast({
        title: "Connection Successful",
        description: "Diamond Muzzle bot is successfully connected to your Telegram group.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Could not connect to the Telegram group. Please verify your bot token and group ID.",
      });
    } finally {
      setTestLoading(false);
    }
  };
  
  const handleSaveSettings = async () => {
    saveSettingsMutation.mutate(formData);
  };
  
  // Show loading state
  if (isLoading || settingsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot size={20} className="text-diamond-500" />
            Loading Telegram Integration...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] animate-pulse bg-gray-100 rounded-lg"></div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot size={20} className="text-diamond-500" />
          Telegram Integration
        </CardTitle>
        <CardDescription>
          Connect to your Telegram group and bot to monitor diamond-related conversations
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="telegramBotToken">Telegram Bot Token</Label>
            <Input
              id="telegramBotToken"
              type="password"
              value={formData.telegramBotToken}
              onChange={(e) => handleChange("telegramBotToken", e.target.value)}
              placeholder="123456789:ABCDefGhIJKlmNoPQRsTUVwxyZ"
            />
            <p className="text-xs text-muted-foreground">
              Get this from BotFather when you create your Telegram bot
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="telegramGroupId">Telegram Group ID</Label>
            <div className="flex gap-2">
              <Input
                id="telegramGroupId"
                value={formData.telegramGroupId}
                onChange={(e) => handleChange("telegramGroupId", e.target.value)}
                className="flex-1"
                placeholder="-10012345678"
              />
              <Button 
                variant="outline" 
                onClick={handleTestConnection}
                disabled={testLoading}
              >
                {testLoading ? "Testing..." : "Test Connection"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Find this in your Telegram group info or by asking @username_to_id_bot
            </p>
          </div>
        </div>
        
        <Separator className="my-2" />
        
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <Label htmlFor="enableMessageAnalysis">Message Analysis</Label>
            <p className="text-xs text-muted-foreground">
              Analyze all messages in the group for diamond-related content
            </p>
          </div>
          <Switch
            id="enableMessageAnalysis"
            checked={formData.enableMessageAnalysis}
            onCheckedChange={(checked) => handleChange("enableMessageAnalysis", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between border-t pt-4">
          <div className="space-y-0.5">
            <Label htmlFor="autoReplyToQueries">Auto-Reply to Queries</Label>
            <p className="text-xs text-muted-foreground">
              Let the bot automatically respond to diamond inquiries
            </p>
          </div>
          <Switch
            id="autoReplyToQueries"
            checked={formData.autoReplyToQueries}
            onCheckedChange={(checked) => handleChange("autoReplyToQueries", checked)}
          />
        </div>
        
        <div className="flex items-center justify-between border-t pt-4">
          <div className="space-y-0.5">
            <Label htmlFor="notifyOnMatches">Notify on Inventory Matches</Label>
            <p className="text-xs text-muted-foreground">
              Receive notifications when group messages match your inventory
            </p>
          </div>
          <Switch
            id="notifyOnMatches"
            checked={formData.notifyOnMatches}
            onCheckedChange={(checked) => handleChange("notifyOnMatches", checked)}
          />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          <MessageSquare size={14} className="inline mr-1" />
          Last sync: 5 minutes ago
        </div>
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </CardFooter>
    </Card>
  );
}
