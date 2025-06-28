
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowRight, Diamond, Database, Upload } from "lucide-react";
import { Link } from "react-router-dom";

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
        <div className="w-full max-w-4xl space-y-8">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-green-600 text-2xl">Welcome to MazalBot!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Successfully authenticated as user: <strong>{tokens?.user_id}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Your session is secure and ready for diamond management.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Diamond className="h-5 w-5 text-diamond-500" />
                  Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  View your diamond inventory statistics and analytics
                </p>
                <Button asChild className="w-full">
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Manage your diamond collection with full CRUD operations
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/inventory">
                    Manage Inventory
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-green-500" />
                  Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Upload CSV files or scan GIA certificates
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/upload">
                    Upload Data
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
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
    );
  );
};

export default Index;
