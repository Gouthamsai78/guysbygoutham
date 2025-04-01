
import { supabase } from "@/integrations/supabase/client";

/**
 * Upload a file to Supabase storage
 * @param file File to upload
 * @param userId User ID to associate with the file
 * @param bucketName Bucket name to store the file in
 * @returns Promise resolving to the file's public URL or null if upload fails
 */
export const uploadFile = async (
  file: File,
  userId: string,
  bucketName: string
): Promise<string | null> => {
  if (!file || !userId) return null;
  
  try {
    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    // Check if bucket exists, create if not
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.find(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      // Bucket doesn't exist, create it
      const { error: createError } = await supabase.storage
        .createBucket(bucketName, { public: true });
        
      if (createError) {
        console.error(`Error creating bucket ${bucketName}:`, createError);
        throw createError;
      }
    }
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
      
    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
};
