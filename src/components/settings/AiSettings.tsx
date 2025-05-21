
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

interface AiSettingsProps {
  autoReplyEnabled: boolean;
  matchThreshold: number;
  onValueChange: (field: string, value: any) => void;
  isSaving: boolean;
}

export function AiSettings({
  autoReplyEnabled,
  matchThreshold,
  onValueChange,
  isSaving,
}: AiSettingsProps) {
  return (
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
            checked={autoReplyEnabled}
            onCheckedChange={(checked) => onValueChange("autoReplyEnabled", checked)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="matchThreshold">
            Match Threshold ({matchThreshold}%)
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-xs">50%</span>
            <Input
              id="matchThreshold"
              type="range"
              min="50"
              max="100"
              value={matchThreshold}
              onChange={(e) => onValueChange("matchThreshold", Number(e.target.value))}
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
  );
}
