import { supabase } from '@/lib/supabase';

const BUCKET = 'profile-pictures';
const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export interface UploadResult {
  url: string;
  path: string;
}

export interface ValidationError {
  error: string;
}

export function validateImageFile(file: File): ValidationError | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Only JPG, JPEG, PNG, and WEBP images are allowed.' };
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return { error: `Image must be smaller than ${MAX_SIZE_MB}MB.` };
  }
  return null;
}

export async function uploadProfilePicture(file: File, userId: string): Promise<UploadResult> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${userId}/${filename}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export function getAvatarPublicUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
