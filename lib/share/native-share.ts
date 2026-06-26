import { toast } from 'sonner';
import { copyToClipboard } from './copy-link';

export async function shareUrl({
  title,
  text,
  url,
}: {
  title: string;
  text: string;
  url: string;
}): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text, url });
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        await copyToClipboard(url);
      }
    }
  } else {
    await copyToClipboard(url);
    toast.info('Sharing is not supported on this browser. Link copied instead.');
  }
}
