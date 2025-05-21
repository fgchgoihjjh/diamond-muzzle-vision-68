
import { useState } from "react";
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
import { Button } from "@/components/ui/button";

interface IntegrationSettingsProps {
  telegramGroupId: string;
  whatsappEnabled: boolean;
  apiKey: string;
  onValueChange: (field: string, value: any) => void;
  isSaving: boolean;
}

export function IntegrationSettings({
  telegramGroupId,
  whatsappEnabled,
  apiKey,
  onValueChange,
  isSaving,
}: IntegrationSettingsProps) {
  return (
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
            value={telegramGroupId}
            onChange={(e) => onValueChange("telegramGroupId", e.target.value)}
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
            checked={whatsappEnabled}
            onCheckedChange={(checked) => onValueChange("whatsappEnabled", checked)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            value={apiKey}
            type="password"
            onChange={(e) => onValueChange("apiKey", e.target.value)}
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
  );
}
