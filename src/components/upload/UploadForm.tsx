
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, File, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { uploadDiamondCSV } from "@/lib/diamond-api";

interface UploadResult {
  totalItems: number;
  matchedPairs: number;
  errors: string[];
  message?: string;
}

export function UploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const simulateProgress = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 10;
      if (currentProgress > 95) {
        clearInterval(interval);
        currentProgress = 95;
      }
      setProgress(Math.min(currentProgress, 95));
    }, 300);

    return () => clearInterval(interval);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);
    setError(null);
    
    const cleanup = simulateProgress();

    try {
      const response = await uploadDiamondCSV(selectedFile);
      
      setProgress(100);
      
      if (response.error) {
        setError(response.error);
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: response.error,
        });
      } else if (response.data) {
        setResult({
          totalItems: response.data.totalItems || response.data.total_items || 0,
          matchedPairs: response.data.matchedPairs || response.data.matched_pairs || 0,
          errors: response.data.errors || [],
          message: response.data.message,
        });
        
        toast({
          title: "Upload successful",
          description: `Processed ${response.data.totalItems || response.data.total_items || 0} diamonds successfully.`,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: errorMessage,
      });
    } finally {
      setUploading(false);
      cleanup();
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setResult(null);
    setProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <Card className="diamond-card mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {!selectedFile ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-diamond-300 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-4 text-sm text-gray-600">
                  Drag and drop your CSV file here, or <span className="text-diamond-600 font-medium">browse</span> to select
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Supported format: CSV (will be sent to FastAPI backend)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <File className="h-8 w-8 text-diamond-600 mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetForm}
                    className="text-gray-600"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
                
                {uploading && (
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-gray-500 text-right">
                      {Math.round(progress)}% - Uploading to FastAPI backend...
                    </p>
                  </div>
                )}
                
                {error && (
                  <Alert variant="destructive" className="text-sm">
                    <AlertDescription>
                      <strong>Backend Error:</strong> {error}
                      <br />
                      <span className="text-xs">Make sure your FastAPI backend is running and the upload endpoint is available.</span>
                    </AlertDescription>
                  </Alert>
                )}
                
                {result && (
                  <div className="bg-diamond-50 border border-diamond-100 rounded-lg p-4 space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <p className="text-sm font-medium">Upload complete</p>
                    </div>
                    
                    {result.message && (
                      <p className="text-sm text-gray-600">{result.message}</p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Total Items</p>
                        <p className="font-medium">{result.totalItems}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Matched Pairs</p>
                        <p className="font-medium">{result.matchedPairs}</p>
                      </div>
                    </div>
                    
                    {result.errors.length > 0 && (
                      <div className="text-sm">
                        <p className="text-gray-500">Errors</p>
                        <ul className="list-disc list-inside text-red-600 text-xs mt-1">
                          {result.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={resetForm}
                    disabled={uploading}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button 
                    onClick={handleUpload}
                    disabled={uploading || !!result}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload to Backend"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Instructions</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>Your CSV file will be sent to the FastAPI backend for processing:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>File will be uploaded to <code>/api/v1/upload_inventory</code></li>
            <li>Backend will process and validate the diamond data</li>
            <li>Results will show total items processed and any errors</li>
            <li>Processed diamonds will be available in your inventory</li>
          </ul>
          <p className="mt-4 text-gray-500 text-xs">
            Make sure your FastAPI backend is running and accessible at mazalbot.app
          </p>
        </div>
      </div>
    </div>
  );
}
