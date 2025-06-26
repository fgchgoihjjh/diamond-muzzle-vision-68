
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { isAuthenticated, isLoading, login, error, tokens } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Authenticating...</h1>
          <p className="text-gray-600">Verifying your Telegram session</p>
        </div>
      </div>
    );
  }

  if (error && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">{error}</p>
            <Button onClick={login} className="w-full">
              Retry Authentication
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-green-600">Welcome to MazalBot!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Successfully authenticated as user: <strong>{tokens?.user_id}</strong>
            </p>
            <p className="text-xs text-gray-500">
              Your session is secure and ready for diamond management.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to MazalBot</h1>
        <p className="text-xl text-gray-600 mb-6">Diamond Management & Trading Platform</p>
        <Button onClick={login}>
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Index;
