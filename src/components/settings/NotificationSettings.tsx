
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface NotificationSettingsProps {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  onValueChange: (field: string, value: any) => void;
}

export function NotificationSettings({
  emailNotifications,
  smsNotifications,
  pushNotifications,
  onValueChange,
}: NotificationSettingsProps) {
  return (
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
            checked={emailNotifications}
            onCheckedChange={(checked) => onValueChange("emailNotifications", checked)}
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
            checked={smsNotifications}
            onCheckedChange={(checked) => onValueChange("smsNotifications", checked)}
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
            checked={pushNotifications}
            onCheckedChange={(checked) => onValueChange("pushNotifications", checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
