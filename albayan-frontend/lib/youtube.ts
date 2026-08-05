/**
 * أدوات مساعدة لروابط يوتيوب في الواجهة.
 * - عرض الفيديو المخزّن يستخدم video_embed القادم من الـ API مباشرة.
 * - هذا الملف مخصّص للمعاينة اللحظية داخل النماذج قبل الحفظ.
 */

export function extractYoutubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (!host.endsWith("youtube.com") && !host.endsWith("youtu.be")) {
      return null;
    }

    const segments = parsed.pathname.split("/").filter(Boolean);

    if (host.endsWith("youtu.be") && segments.length > 0) {
      return isValidId(segments[segments.length - 1]);
    }

    if (host.endsWith("youtube.com")) {
      const last = segments[segments.length - 1];
      if (last && last !== "watch" && last !== "embed") {
        return isValidId(last);
      }
      const v = parsed.searchParams.get("v");
      if (v) {
        return isValidId(v);
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function youtubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url || url === "") return null;

  const id = extractYoutubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

function isValidId(id: string): string | null {
  return /^[\w-]{11}$/.test(id) ? id : null;
}
