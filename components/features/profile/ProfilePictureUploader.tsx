'use client';

import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { uploadProfilePicture, validateImageFile } from '@/lib/services/profile-picture';
import { useUpdateAvatar, useDeleteAvatar } from '@/hooks/queries/use-profile';
import { ProfileAvatar } from './ProfileAvatar';
import { ProfilePictureModal } from './ProfilePictureModal';
import { useAuth } from '@/hooks/useAuth';

interface ProfilePictureUploaderProps {
  avatarUrl?: string | null;
  name?: string | null;
  email?: string | null;
}

export function ProfilePictureUploader({ avatarUrl, name, email }: ProfilePictureUploaderProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAvatar = useUpdateAvatar();
  const deleteAvatar = useDeleteAvatar();

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Reset input so same file can be picked again
    e.target.value = '';

    setError(null);
    const validationError = validateImageFile(file);
    if (validationError) { setError(validationError.error); return; }

    try {
      setUploading(true);
      const { url, path } = await uploadProfilePicture(file, user.id);
      await updateAvatar.mutateAsync({ url, path });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleDelete() {
    setError(null);
    await deleteAvatar.mutateAsync();
    setModalOpen(false);
  }

  const isBusy = uploading || updateAvatar.isPending || deleteAvatar.isPending;

  return (
    <div className="flex items-center gap-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
        aria-label="Upload profile picture"
      />

      {/* Avatar — click to open modal */}
      <div className="relative">
        <ProfileAvatar
          name={name}
          email={email}
          avatarUrl={avatarUrl}
          size="lg"
          clickable
          onClick={() => setModalOpen(true)}
        />
        {isBusy && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
            <Loader2 size={18} className="animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Action button */}
      <div className="flex flex-col gap-1 min-w-0">
        <button
          type="button"
          onClick={openFilePicker}
          disabled={isBusy}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-border bg-muted hover:bg-accent text-foreground disabled:opacity-50 transition-colors"
        >
          <Upload size={13} />
          {avatarUrl ? 'Change picture' : 'Upload picture'}
        </button>
        <p className="text-[11px] text-muted-foreground">JPG, PNG or WEBP · max 5 MB</p>
        {error && <p className="text-[11px] text-destructive">{error}</p>}
      </div>

      {/* Full-screen preview modal */}
      <ProfilePictureModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        avatarUrl={avatarUrl}
        name={name}
        email={email}
        onChangePicture={openFilePicker}
        onDeletePicture={handleDelete}
        isDeleting={deleteAvatar.isPending}
      />
    </div>
  );
}
