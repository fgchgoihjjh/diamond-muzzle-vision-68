
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { MessageSquare, Send, CheckCircle, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

interface TelegramFormValues {
  botToken: string;
  chatId: string;
  enableAnalysis: boolean;
  enableAutoReply: boolean;
  notifyOnMatch: boolean;
}

export function TelegramBotSetup() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"none" | "success" | "error">("none");
  
  const form = useForm<TelegramFormValues>({
    defaultValues: {
      botToken: "7954847874:AAE3qRrdW4NJgKL1ob6mwcq1AzmkoDbXyHs", // Pre-fill with provided token
      chatId: "-1002178695748", // Pre-fill with provided chat ID
      enableAnalysis: true,
      enableAutoReply: true,
      notifyOnMatch: true
    }
  });

  const testConnection = async (values: TelegramFormValues) => {
    setIsConnecting(true);
    setConnectionStatus("none");
    
    try {
      // In a real implementation, you would call the API
      // const response = await api.post("/telegram/test-connection", values);
      
      // For demo purposes, we're simulating a successful API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setConnectionStatus("success");
      toast({
        title: "Connection successful",
        description: "Your Telegram bot has been successfully connected.",
      });
    } catch (error) {
      setConnectionStatus("error");
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: "Could not connect to Telegram. Please check your credentials.",
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  const onSubmit = async (values: TelegramFormValues) => {
    try {
      // In a real implementation, you would call the API
      // await api.post("/telegram/settings", values);
      
      // For demo purposes, we're simulating a successful API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Settings saved",
        description: "Your Telegram bot settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: "Could not save Telegram settings. Please try again.",
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <Card className="diamond-card mb-6">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-diamond-600" />
                  <h2 className="text-lg font-medium">Telegram Bot Connection</h2>
                </div>
                
                <FormField
                  control={form.control}
                  name="botToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bot Token</FormLabel>
                      <FormControl>
                        <Input {...field} type="text" placeholder="Enter your bot token" />
                      </FormControl>
                      <FormDescription>
                        Get this from @BotFather on Telegram
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="chatId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chat ID</FormLabel>
                      <FormControl>
                        <Input {...field} type="text" placeholder="Enter your group chat ID" />
                      </FormControl>
                      <FormDescription>
                        The ID of your group or channel
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => testConnection(form.getValues())}
                    disabled={isConnecting}
                    variant="outline"
                  >
                    {isConnecting ? (
                      <>Testing connection...</>
                    ) : (
                      <>
                        {connectionStatus === "success" && <CheckCircle className="mr-2 h-4 w-4 text-green-500" />}
                        {connectionStatus === "error" && <XCircle className="mr-2 h-4 w-4 text-red-500" />}
                        Test Connection
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h2 className="text-lg font-medium">Bot Settings</h2>
                
                <FormField
                  control={form.control}
                  name="enableAnalysis"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Message Analysis</FormLabel>
                        <FormDescription>
                          Automatically analyze incoming messages for diamond requests
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="enableAutoReply"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Auto-Reply</FormLabel>
                        <FormDescription>
                          Automatically reply to diamond requests with matching inventory
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notifyOnMatch"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Match Notifications</FormLabel>
                        <FormDescription>
                          Notify you when a high-probability match is found
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">How It Works</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>The Telegram integration connects your inventory to your Telegram group:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Bot will scan messages for diamond requests</li>
            <li>Automatically match requests against your inventory</li>
            <li>Provide price quotes and images when matches are found</li>
            <li>Allow you to manually approve responses</li>
          </ul>
          <p className="mt-4 text-xs text-diamond-600">
            Tip: Make sure your bot is added to your group as an admin for best results
          </p>
        </div>
      </div>
    </div>
  );
}
