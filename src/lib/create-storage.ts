
import { supabase } from "@/integrations/supabase/client";

export async function ensureStorageBucketExists(): Promise<void> {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'inventory');
    
    // If bucket doesn't exist, create it
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket('inventory', {
        public: false,
        fileSizeLimit: 10485760, // 10MB limit
      });
      
      if (error) {
        console.error('Error creating storage bucket:', error);
        throw error;
      }
      
      console.log('Inventory storage bucket created successfully');
    }
  } catch (error) {
    console.error('Error ensuring storage bucket exists:', error);
  }
}
