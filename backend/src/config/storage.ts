import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Bucket name for images
export const IMAGE_BUCKET = "images";

// Helper function to upload image
export async function uploadImage(
  file: Buffer,
  filename: string,
  contentType: string,
): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(filename, file, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(IMAGE_BUCKET)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

// Helper to delete image
export async function deleteImage(fileUrl: string): Promise<boolean> {
  const path = fileUrl.split("/").pop();
  if (!path) return false;

  const { error } = await supabase.storage.from(IMAGE_BUCKET).remove([path]);

  if (error) {
    console.error("Delete error:", error);
    return false;
  }

  return true;
}
