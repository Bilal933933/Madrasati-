"use client";

import { Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { youtubeEmbedUrl } from "@/lib/youtube";

type VideoUrlFieldProps = {
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
};

export function VideoUrlField({ value, onValueChange, id }: VideoUrlFieldProps) {
  const embedUrl = youtubeEmbedUrl(value);

  return (
    <div className="flex flex-col gap-2">
      <Input
        id={id}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder="https://www.youtube.com/watch?v=..."
        className="h-9 font-mono text-xs"
        dir="ltr"
      />
      {embedUrl ? (
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-input bg-muted">
          <iframe src={embedUrl} title="معاينة الفيديو" className="size-full" allowFullScreen />
        </div>
      ) : (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link2 className="size-3.5" />
          ارفع الفيديو على يوتيوب ثم الصق رابطه هنا — ستظهر معاينة فورية.
        </p>
      )}
    </div>
  );
}
