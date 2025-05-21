
import { Layout } from "@/components/layout/Layout";
import { UploadForm } from "@/components/upload/UploadForm";

export default function UploadPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Upload Inventory</h1>
          <p className="text-muted-foreground">
            Upload your inventory data using a CSV file
          </p>
        </div>
        
        <UploadForm />
      </div>
    </Layout>
  );
}
