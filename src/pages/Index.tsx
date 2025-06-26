
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Smartphone, Globe } from "lucide-react";

const Index = () => {
  const { 
    isAuthenticated, 
    isLoading, 
    telegramUser, 
    isTelegramWebApp, 
    login, 
    logout, 
    error 
  } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Authenticating with Telegram...</p>
        </div>
      </div>
    );
  }

  if (error && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Authentication Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={login} className="w-full">
              Retry Authentication
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to MazalBot</CardTitle>
            <CardDescription>
              {isTelegramWebApp 
                ? "Please authenticate to continue" 
                : "This app is designed to work within Telegram"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={login} className="w-full">
              {isTelegramWebApp ? "Login with Telegram" : "Continue (Development Mode)"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Welcome, {telegramUser?.first_name}!
                </CardTitle>
                <CardDescription>
                  Successfully authenticated with Telegram
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {isTelegramWebApp ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Smartphone className="h-3 w-3" />
                    Telegram WebApp
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Development Mode
                  </Badge>
                )}
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">User Information</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Name:</span> {telegramUser?.first_name} {telegramUser?.last_name}</p>
                  {telegramUser?.username && (
                    <p><span className="font-medium">Username:</span> @{telegramUser.username}</p>
                  )}
                  <p><span className="font-medium">Telegram ID:</span> {telegramUser?.id}</p>
                  {telegramUser?.language_code && (
                    <p><span className="font-medium">Language:</span> {telegramUser.language_code}</p>
                  )}
                  {telegramUser?.is_premium && (
                    <Badge variant="default" className="mt-1">Telegram Premium</Badge>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Session Status</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Environment:</span> {isTelegramWebApp ? 'Telegram WebApp' : 'Web Browser'}</p>
                  <p><span className="font-medium">Status:</span> <Badge variant="default">Authenticated</Badge></p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
              <CardDescription>Manage your diamond inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => window.location.href = '/inventory'}>
                View Inventory
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload</CardTitle>
              <CardDescription>Add new diamonds to your collection</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => window.location.href = '/upload'}>
                Upload Diamonds
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insights</CardTitle>
              <CardDescription>View analytics and reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => window.location.href = '/insights'}>
                View Insights
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
