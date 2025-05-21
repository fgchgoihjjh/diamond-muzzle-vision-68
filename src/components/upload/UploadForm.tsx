
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, File, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

interface UploadResult {
  totalItems: number;
  matchedPairs: number;
  errors: string[];
}

export function UploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setResult(null);
    }
  };

  const simulateProgress = () => {
    // Simulate upload progress for demo
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
    
    const cleanup = simulateProgress();

    try {
      // In a real implementation, you would use the actual API
      // const response = await api.upload<UploadResult>("/upload", selectedFile);
      
      // For demo purposes, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setProgress(100);
      
      // Simulate response
      const mockResult: UploadResult = {
        totalItems: Math.floor(Math.random() * 200) + 50,
        matchedPairs: Math.floor(Math.random() * 30) + 5,
        errors: Math.random() > 0.7 
          ? ["Invalid format in line 42", "Missing required field in line 73"] 
          : [],
      };
      
      setResult(mockResult);
      
      toast({
        title: "Upload successful",
        description: `Processed ${mockResult.totalItems} diamonds successfully.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your inventory.",
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
                  Supported format: CSV
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
                      {Math.round(progress)}%
                    </p>
                  </div>
                )}
                
                {result && (
                  <div className="bg-diamond-50 border border-diamond-100 rounded-lg p-4 space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <p className="text-sm font-medium">Upload complete</p>
                    </div>
                    
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
                    {uploading ? "Uploading..." : "Upload"}
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
          <p>Please ensure your CSV file follows the required format:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>One diamond per row</li>
            <li>Required columns: Stock #, Shape, Carat, Color, Clarity, Cut, Price</li>
            <li>Optional columns: Certificate, Measurements, Depth, Table</li>
            <li>First row should contain column headers</li>
          </ul>
          <p className="mt-4 text-gray-500 text-xs">
            Need a template? <a href="#" className="text-diamond-600 hover:underline">Download sample CSV</a>
          </p>
        </div>
      </div>
    </div>
  );
}
