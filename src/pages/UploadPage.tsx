
import { Layout } from "@/components/layout/Layout";
import { UploadForm } from "@/components/upload/UploadForm";
import { TelegramBotSetup } from "@/components/upload/TelegramBotSetup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UploadPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Upload Inventory</h1>
          <p className="text-muted-foreground">
            Upload your inventory data and configure Telegram integration
          </p>
        </div>
        
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upload">CSV Upload</TabsTrigger>
            <TabsTrigger value="telegram">Telegram Integration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <UploadForm />
          </TabsContent>
          
          <TabsContent value="telegram">
            <TelegramBotSetup />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
